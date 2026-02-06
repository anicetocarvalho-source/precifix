import { useState, useMemo } from 'react';
import { useServiceTemplates } from '@/hooks/useServiceTemplates';
import { ServiceTemplate } from '@/types/serviceTemplate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Search,
  Trash2,
  Edit,
  LayoutTemplate,
  Loader2,
  Copy,
  Star,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

import { getServiceLabel } from '@/lib/serviceLabels';
import { COMPLEXITY_LABELS, formatDuration } from '@/lib/statusLabels';
import { getServiceTypeConfig } from '@/lib/serviceCategoryConfig';

const COMPLEXITY_BADGE_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive'> = {
  low: 'secondary',
  medium: 'default',
  high: 'destructive',
};

type SortOption = 'name' | 'date' | 'type' | 'favorites';
type FilterOption = 'all' | 'favorites' | string;

export function TemplateManagement() {
  const { templates, isLoading, deleteTemplate, isDeleting, duplicateTemplate, isDuplicating, toggleFavorite } = useServiceTemplates();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [templateToDelete, setTemplateToDelete] = useState<ServiceTemplate | null>(null);
  const [templateToEdit, setTemplateToEdit] = useState<ServiceTemplate | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('favorites');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Filter only user templates (not system templates)
  const userTemplates = templates.filter(t => !t.isSystemTemplate);

  // Get unique service types for filter dropdown
  const serviceTypes = useMemo(() => {
    const types = new Set(userTemplates.map(t => t.serviceType));
    return Array.from(types);
  }, [userTemplates]);

  // Apply filters and sorting
  const filteredAndSortedTemplates = useMemo(() => {
    let result = [...userTemplates];

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        (template.description?.toLowerCase().includes(searchLower)) ||
        getServiceLabel(template.serviceType).toLowerCase().includes(searchLower)
      );
    }

    // Apply category/favorites filter
    if (filterBy === 'favorites') {
      result = result.filter(t => t.isFavorite);
    } else if (filterBy !== 'all') {
      result = result.filter(t => t.serviceType === filterBy);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'favorites':
          // Favorites first, then by name
          if (a.isFavorite !== b.isFavorite) {
            return a.isFavorite ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'type':
          return a.serviceType.localeCompare(b.serviceType);
        default:
          return 0;
      }
    });

    return result;
  }, [userTemplates, searchQuery, filterBy, sortBy]);

  const handleEditClick = (template: ServiceTemplate) => {
    setTemplateToEdit(template);
    setEditForm({
      name: template.name,
      description: template.description || '',
    });
  };

  const handleEditSave = async () => {
    if (!templateToEdit) return;
    
    setIsEditing(true);
    try {
      const { error } = await supabase
        .from('service_templates')
        .update({
          name: editForm.name,
          description: editForm.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', templateToEdit.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['service-templates'] });
      toast.success('Template atualizado com sucesso!');
      setTemplateToEdit(null);
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Erro ao atualizar template');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (templateToDelete) {
      deleteTemplate(templateToDelete.id);
      setTemplateToDelete(null);
    }
  };

  const handleToggleFavorite = (template: ServiceTemplate) => {
    toggleFavorite({ templateId: template.id, isFavorite: !template.isFavorite });
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Gestão de Templates</h2>
        <p className="text-sm text-muted-foreground">
          Visualize, edite e elimine os templates de serviços que guardou.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filter by category */}
        <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar por..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os templates</SelectItem>
            <SelectItem value="favorites">
              <span className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                Favoritos
              </span>
            </SelectItem>
            {serviceTypes.map(type => (
              <SelectItem key={type} value={type}>
                {getServiceLabel(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort by */}
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Ordenar por..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="favorites">Favoritos primeiro</SelectItem>
            <SelectItem value="name">Nome (A-Z)</SelectItem>
            <SelectItem value="date">Data de criação</SelectItem>
            <SelectItem value="type">Tipo de serviço</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Table */}
      {filteredAndSortedTemplates.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed border-border">
          <LayoutTemplate className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          {userTemplates.length === 0 ? (
            <>
              <p className="text-muted-foreground font-medium">Nenhum template guardado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Guarde templates a partir dos serviços nas suas propostas multi-serviço.
              </p>
            </>
          ) : filterBy === 'favorites' ? (
            <>
              <p className="text-muted-foreground font-medium">Nenhum template favorito</p>
              <p className="text-sm text-muted-foreground mt-1">
                Clique na estrela para marcar templates como favoritos.
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground font-medium">Nenhum resultado encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tente ajustar a sua pesquisa ou filtros.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[40px]"></TableHead>
                <TableHead className="w-[280px]">Template</TableHead>
                <TableHead>Tipo de Serviço</TableHead>
                <TableHead>Complexidade</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTemplates.map((template) => {
                const categoryConfig = getServiceTypeConfig(template.serviceType);
                const ServiceIcon = categoryConfig.icon;
                const complexityConfig = { label: COMPLEXITY_LABELS[template.complexity as keyof typeof COMPLEXITY_LABELS] || 'Média', variant: (COMPLEXITY_BADGE_VARIANTS[template.complexity] || 'default') as 'default' | 'secondary' | 'destructive' };

                return (
                  <TableRow key={template.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleFavorite(template)}
                        className="h-8 w-8"
                        title={template.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      >
                        <Star 
                          className={cn(
                            "w-4 h-4 transition-colors",
                            template.isFavorite 
                              ? "fill-amber-400 text-amber-400" 
                              : "text-muted-foreground hover:text-amber-400"
                          )} 
                        />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{template.name}</p>
                        {template.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {template.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-md", categoryConfig.color)}>
                          <ServiceIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm">{getServiceLabel(template.serviceType)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={complexityConfig.variant}>
                        {complexityConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDuration(template.estimatedDuration, template.durationUnit)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(template.createdAt), 'dd MMM yyyy', { locale: pt })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => duplicateTemplate(template)}
                          disabled={isDuplicating}
                          className="h-8 w-8"
                          title="Duplicar template"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(template)}
                          className="h-8 w-8"
                          title="Editar template"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setTemplateToDelete(template)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          title="Eliminar template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Stats */}
      {userTemplates.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
          <span>
            {filteredAndSortedTemplates.length} de {userTemplates.length} template(s)
            {userTemplates.filter(t => t.isFavorite).length > 0 && (
              <span className="ml-2">
                • <Star className="w-3 h-3 inline fill-amber-400 text-amber-400" /> {userTemplates.filter(t => t.isFavorite).length} favorito(s)
              </span>
            )}
          </span>
          <span>
            Templates de sistema disponíveis: {templates.filter(t => t.isSystemTemplate).length}
          </span>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!templateToEdit} onOpenChange={(open) => !open && setTemplateToEdit(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Template</DialogTitle>
            <DialogDescription>
              Atualize o nome e descrição do template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome do Template</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do template"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição opcional..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateToEdit(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSave} disabled={isEditing || !editForm.name.trim()}>
              {isEditing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  A guardar...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Template</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que pretende eliminar o template "{templateToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  A eliminar...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
