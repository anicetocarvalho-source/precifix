import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Search,
  Trash2,
  Edit,
  LayoutTemplate,
  Camera,
  Globe,
  Palette,
  Package,
  Loader2,
  FileText,
  Copy,
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const SERVICE_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  'event-coverage': { label: 'Cobertura de Eventos', icon: Camera, color: 'bg-purple-500/10 text-purple-600' },
  'web-development': { label: 'Desenvolvimento Web', icon: Globe, color: 'bg-blue-500/10 text-blue-600' },
  'branding': { label: 'Branding', icon: Palette, color: 'bg-amber-500/10 text-amber-600' },
  'packaging-design': { label: 'Design de Embalagem', icon: Package, color: 'bg-green-500/10 text-green-600' },
};

const COMPLEXITY_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  low: { label: 'Baixa', variant: 'secondary' },
  medium: { label: 'Média', variant: 'default' },
  high: { label: 'Alta', variant: 'destructive' },
};

export function TemplateManagement() {
  const { templates, isLoading, deleteTemplate, isDeleting, duplicateTemplate, isDuplicating } = useServiceTemplates();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [templateToDelete, setTemplateToDelete] = useState<ServiceTemplate | null>(null);
  const [templateToEdit, setTemplateToEdit] = useState<ServiceTemplate | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Filter only user templates (not system templates)
  const userTemplates = templates.filter(t => !t.isSystemTemplate);
  
  const filteredTemplates = userTemplates.filter(template => {
    const searchLower = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(searchLower) ||
      (template.description?.toLowerCase().includes(searchLower)) ||
      SERVICE_TYPE_CONFIG[template.serviceType]?.label.toLowerCase().includes(searchLower)
    );
  });

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

  const getServiceTypeConfig = (serviceType: string) => {
    return SERVICE_TYPE_CONFIG[serviceType] || { 
      label: serviceType, 
      icon: FileText, 
      color: 'bg-muted text-muted-foreground' 
    };
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Templates Table */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed border-border">
          <LayoutTemplate className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          {userTemplates.length === 0 ? (
            <>
              <p className="text-muted-foreground font-medium">Nenhum template guardado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Guarde templates a partir dos serviços nas suas propostas multi-serviço.
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground font-medium">Nenhum resultado encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tente ajustar a sua pesquisa.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[300px]">Template</TableHead>
                <TableHead>Tipo de Serviço</TableHead>
                <TableHead>Complexidade</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => {
                const serviceConfig = getServiceTypeConfig(template.serviceType);
                const ServiceIcon = serviceConfig.icon;
                const complexityConfig = COMPLEXITY_LABELS[template.complexity] || COMPLEXITY_LABELS.medium;

                return (
                  <TableRow key={template.id}>
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
                        <div className={`p-1.5 rounded ${serviceConfig.color}`}>
                          <ServiceIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm">{serviceConfig.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={complexityConfig.variant}>
                        {complexityConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {template.estimatedDuration} {template.durationUnit === 'months' ? 'meses' : template.durationUnit === 'weeks' ? 'semanas' : 'dias'}
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
          <span>{userTemplates.length} template(s) guardado(s)</span>
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
