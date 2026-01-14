import { useState } from 'react';
import { ProposalService } from '@/types/proposalService';
import { SortableServiceCard } from './SortableServiceCard';
import { Button } from '@/components/ui/button';
import { Plus, LayoutTemplate } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/pricing';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

interface ServicesListProps {
  services: ProposalService[];
  onAddService: () => void;
  onAddFromTemplate?: () => void;
  onRemoveService: (id: string) => void;
  onEditService: (id: string) => void;
  onDuplicateService: (id: string) => void;
  onSaveAsTemplate?: (service: ProposalService) => void;
  onReorderServices?: (services: ProposalService[]) => void;
  totalValue?: number;
}

export function ServicesList({
  services,
  onAddService,
  onAddFromTemplate,
  onRemoveService,
  onEditService,
  onDuplicateService,
  onSaveAsTemplate,
  onReorderServices,
  totalValue,
}: ServicesListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    services.length === 1 ? services[0]?.id : null
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = services.findIndex((s) => s.id === active.id);
      const newIndex = services.findIndex((s) => s.id === over.id);
      
      const reorderedServices = arrayMove(services, oldIndex, newIndex);
      onReorderServices?.(reorderedServices);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Serviços ({services.length})
          </h3>
          {totalValue && totalValue > 0 && (
            <p className="text-sm text-muted-foreground">
              Total: <span className="font-semibold text-foreground">{formatCurrency(totalValue)}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onAddFromTemplate && (
            <Button onClick={onAddFromTemplate} variant="outline" className="gap-2">
              <LayoutTemplate className="w-4 h-4" />
              Templates
            </Button>
          )}
          <Button onClick={onAddService} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Serviço
          </Button>
        </div>
      </div>
      
      {/* Services List with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={services.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {services.map((service, index) => (
                <SortableServiceCard
                  key={service.id}
                  service={service}
                  index={index}
                  isExpanded={expandedId === service.id}
                  onToggleExpand={() => setExpandedId(expandedId === service.id ? null : service.id)}
                  onRemove={() => onRemoveService(service.id)}
                  onEdit={() => onEditService(service.id)}
                  onDuplicate={() => onDuplicateService(service.id)}
                  onSaveAsTemplate={onSaveAsTemplate ? () => onSaveAsTemplate(service) : undefined}
                  canRemove={services.length > 1}
                />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>
      
      {/* Empty State */}
      {services.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-2 border-dashed border-border rounded-xl p-8 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Nenhum serviço adicionado ainda.
          </p>
          <Button onClick={onAddService} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Primeiro Serviço
          </Button>
        </motion.div>
      )}
    </div>
  );
}
