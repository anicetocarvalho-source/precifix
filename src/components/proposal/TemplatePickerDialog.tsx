import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ServiceTemplate, templateToService } from '@/types/serviceTemplate';
import { ProposalService } from '@/types/proposalService';
import { getServiceLabel } from '@/lib/serviceLabels';
import { COMPLEXITY_LABELS } from '@/lib/statusLabels';
import { getServiceTypeConfig, CATEGORY_COLORS } from '@/lib/serviceCategoryConfig';
import { SERVICE_CATEGORIES } from '@/types/proposal';
import { useServiceTemplates } from '@/hooks/useServiceTemplates';
import { cn } from '@/lib/utils';
import { 
  Search, 
  LayoutTemplate, 
  Loader2, 
  Trash2,
  Star,
  Clock,
  Briefcase,
} from 'lucide-react';
import { formatDuration } from '@/lib/statusLabels';
import { motion, AnimatePresence } from 'framer-motion';

interface TemplatePickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (service: ProposalService) => void;
}

export function TemplatePickerDialog({
  isOpen,
  onClose,
  onSelect,
}: TemplatePickerDialogProps) {
  const [search, setSearch] = useState('');
  const { templates, isLoading, deleteTemplate, isDeleting } = useServiceTemplates();

  const filteredTemplates = templates.filter((template) => {
    const searchLower = search.toLowerCase();
    return (
      template.name.toLowerCase().includes(searchLower) ||
      template.description?.toLowerCase().includes(searchLower) ||
      getServiceLabel(template.serviceType).toLowerCase().includes(searchLower)
    );
  });

  const systemTemplates = filteredTemplates.filter((t) => t.isSystemTemplate);
  const userTemplates = filteredTemplates.filter((t) => !t.isSystemTemplate);

  const handleSelect = (template: ServiceTemplate) => {
    const service = templateToService(template);
    onSelect(service);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5" />
            Escolher Template
          </DialogTitle>
          <DialogDescription>
            Selecione um template pré-configurado para adicionar rapidamente um serviço.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <LayoutTemplate className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum template encontrado</p>
              {search && (
                <p className="text-sm mt-1">
                  Tente uma pesquisa diferente
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {/* System Templates */}
              {systemTemplates.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Templates do Sistema
                  </h3>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {systemTemplates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onSelect={handleSelect}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* User Templates */}
              {userTemplates.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4" />
                    Os Meus Templates
                  </h3>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {userTemplates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onSelect={handleSelect}
                          onDelete={deleteTemplate}
                          isDeleting={isDeleting}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

interface TemplateCardProps {
  template: ServiceTemplate;
  onSelect: (template: ServiceTemplate) => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

function TemplateCard({ 
  template, 
  onSelect, 
  onDelete, 
  isDeleting, 
}: TemplateCardProps) {
  const config = getServiceTypeConfig(template.serviceType);
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "border rounded-lg p-4 hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer group"
      )}
      onClick={() => onSelect(template)}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          config.color
        )}>
          <IconComponent className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-foreground">{template.name}</h4>
              {template.description && (
                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                  {template.description}
                </p>
              )}
            </div>
            
            {onDelete && !template.isSystemTemplate && (
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(template.id);
                }}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {getServiceLabel(template.serviceType)}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatDuration(template.estimatedDuration, template.durationUnit)}
            </div>
            <span className="text-xs text-muted-foreground">
              Complexidade {COMPLEXITY_LABELS[template.complexity]}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
