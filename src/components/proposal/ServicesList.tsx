import { useState } from 'react';
import { ProposalService, createDefaultService } from '@/types/proposalService';
import { ServiceCard } from './ServiceCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/pricing';

interface ServicesListProps {
  services: ProposalService[];
  onAddService: () => void;
  onRemoveService: (id: string) => void;
  onEditService: (id: string) => void;
  totalValue?: number;
}

export function ServicesList({
  services,
  onAddService,
  onRemoveService,
  onEditService,
  totalValue,
}: ServicesListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    services.length === 1 ? services[0]?.id : null
  );

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
        <Button onClick={onAddService} className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Serviço
        </Button>
      </div>
      
      {/* Services List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              isExpanded={expandedId === service.id}
              onToggleExpand={() => setExpandedId(expandedId === service.id ? null : service.id)}
              onRemove={() => onRemoveService(service.id)}
              onEdit={() => onEditService(service.id)}
              canRemove={services.length > 1}
            />
          ))}
        </AnimatePresence>
      </div>
      
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
