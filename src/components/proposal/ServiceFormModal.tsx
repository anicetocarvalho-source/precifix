import { useState, useEffect } from 'react';
import { ProposalService, createDefaultService } from '@/types/proposalService';
import { ServiceType, DurationUnit, Complexity, SERVICE_CATEGORIES } from '@/types/proposal';
import { ServiceSelector } from './ServiceSelector';
import { EventFields } from './EventFields';
import { WebSystemsFields } from './WebSystemsFields';
import { DesignFields } from './DesignFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: ProposalService) => void;
  service?: ProposalService;
  mode: 'create' | 'edit';
}

type Step = 'service' | 'details' | 'sector' | 'deliverables';

const DURATION_UNIT_LABELS: Record<DurationUnit, { singular: string; plural: string }> = {
  days: { singular: 'dia', plural: 'dias' },
  weeks: { singular: 'semana', plural: 'semanas' },
  months: { singular: 'mês', plural: 'meses' },
};

const COMPLEXITY_OPTIONS = [
  { value: 'low', label: 'Baixa', description: 'Projeto simples, escopo definido' },
  { value: 'medium', label: 'Média', description: 'Complexidade moderada, múltiplas áreas' },
  { value: 'high', label: 'Alta', description: 'Projeto complexo, alto risco' },
];

// Get deliverable options based on service category
const getDeliverableOptions = (category: string | null) => {
  switch (category) {
    case 'events':
      return [
        { value: 'photos', label: 'Fotografias Editadas' },
        { value: 'raw_photos', label: 'Fotografias RAW' },
        { value: 'videos', label: 'Vídeos Editados' },
        { value: 'raw_footage', label: 'Filmagens Brutas' },
        { value: 'highlights', label: 'Vídeo Resumo/Highlights' },
        { value: 'streaming', label: 'Streaming ao Vivo' },
        { value: 'photo_album', label: 'Álbum Digital' },
        { value: 'social_media_package', label: 'Pacote para Redes Sociais' },
      ];
    case 'creative':
      return [
        { value: 'logo', label: 'Logótipo' },
        { value: 'brand_manual', label: 'Manual de Marca' },
        { value: 'social_media_kit', label: 'Kit Redes Sociais' },
        { value: 'business_cards', label: 'Cartões de Visita' },
        { value: 'promotional_materials', label: 'Materiais Promocionais' },
        { value: 'video_animation', label: 'Vídeo/Animação' },
        { value: 'presentations', label: 'Apresentações' },
        { value: 'packaging', label: 'Embalagens' },
      ];
    case 'technology':
      return [
        { value: 'source_code', label: 'Código Fonte' },
        { value: 'technical_docs', label: 'Documentação Técnica' },
        { value: 'user_manual', label: 'Manual do Utilizador' },
        { value: 'api_docs', label: 'Documentação API' },
        { value: 'database', label: 'Base de Dados' },
        { value: 'hosting_setup', label: 'Configuração de Hosting' },
        { value: 'training_videos', label: 'Vídeos de Formação' },
        { value: 'maintenance_support', label: 'Suporte/Manutenção' },
      ];
    case 'consulting':
    default:
      return [
        { value: 'reports', label: 'Relatórios' },
        { value: 'dashboards', label: 'Dashboards' },
        { value: 'kpis', label: 'KPIs' },
        { value: 'schedules', label: 'Cronogramas' },
        { value: 'training', label: 'Materiais de Formação' },
        { value: 'documentation', label: 'Documentação de Processos' },
        { value: 'presentations', label: 'Apresentações Executivas' },
        { value: 'action_plans', label: 'Planos de Acção' },
      ];
  }
};

export function ServiceFormModal({
  isOpen,
  onClose,
  onSave,
  service,
  mode,
}: ServiceFormModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('service');
  const [formData, setFormData] = useState<ProposalService>(
    service || createDefaultService()
  );

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(service || createDefaultService());
      setCurrentStep(mode === 'edit' ? 'details' : 'service');
    }
  }, [isOpen, service, mode]);

  const category = formData.serviceType ? SERVICE_CATEGORIES[formData.serviceType] : null;
  const needsSectorStep = category && category !== 'consulting';
  
  const steps: Step[] = needsSectorStep 
    ? ['service', 'details', 'sector', 'deliverables']
    : ['service', 'details', 'deliverables'];

  const currentStepIndex = steps.indexOf(currentStep);
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleServiceSelect = (serviceType: ServiceType) => {
    setFormData({
      ...formData,
      serviceType,
      deliverables: [], // Reset deliverables when changing service
    });
    setCurrentStep('details');
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'service':
        return !!formData.serviceType;
      case 'details':
        return formData.estimatedDuration > 0 && !!formData.complexity;
      case 'sector':
        return true; // Sector fields are optional
      case 'deliverables':
        return formData.deliverables.length > 0;
      default:
        return true;
    }
  };

  const toggleDeliverable = (value: string) => {
    const current = formData.deliverables || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFormData({ ...formData, deliverables: updated });
  };

  const deliverableOptions = getDeliverableOptions(category);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Adicionar Serviço' : 'Editar Serviço'}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-4">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  index < currentStepIndex
                    ? "bg-primary text-primary-foreground"
                    : index === currentStepIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {index < currentStepIndex ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 h-0.5 mx-1",
                    index < currentStepIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {currentStep === 'service' && (
              <motion.div
                key="service"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-lg font-semibold mb-4">Selecione o tipo de serviço</h3>
                <ServiceSelector
                  value={formData.serviceType}
                  onChange={handleServiceSelect}
                />
              </motion.div>
            )}

            {currentStep === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold">Detalhes do Serviço</h3>
                
                {/* Duration */}
                <div className="space-y-3">
                  <Label>Duração Estimada</Label>
                  <div className="flex gap-3">
                    <div className="flex gap-1">
                      {(['days', 'weeks', 'months'] as DurationUnit[]).map((unit) => (
                        <Button
                          key={unit}
                          type="button"
                          variant={formData.durationUnit === unit ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFormData({ ...formData, durationUnit: unit })}
                        >
                          {DURATION_UNIT_LABELS[unit].plural}
                        </Button>
                      ))}
                    </div>
                    <Input
                      type="number"
                      min="1"
                      max={formData.durationUnit === 'days' ? 365 : formData.durationUnit === 'weeks' ? 52 : 60}
                      value={formData.estimatedDuration || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        estimatedDuration: parseInt(e.target.value) || 0 
                      })}
                      className="w-24"
                    />
                    <span className="text-muted-foreground self-center">
                      {formData.estimatedDuration === 1 
                        ? DURATION_UNIT_LABELS[formData.durationUnit].singular
                        : DURATION_UNIT_LABELS[formData.durationUnit].plural
                      }
                    </span>
                  </div>
                </div>

                {/* Complexity */}
                <div className="space-y-3">
                  <Label>Complexidade</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {COMPLEXITY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, complexity: option.value as Complexity })}
                        className={cn(
                          "p-3 rounded-lg border-2 text-left transition-all",
                          formData.complexity === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <p className="font-medium text-foreground">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'sector' && (
              <motion.div
                key="sector"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-lg font-semibold mb-4">Detalhes Específicos</h3>
                
                {category === 'events' && (
                  <EventFields
                    formData={{
                      eventType: formData.eventType,
                      coverageDuration: formData.coverageDuration,
                      eventDays: formData.eventDays,
                      eventStaffing: formData.eventStaffing,
                      eventExtras: formData.eventExtras,
                      includesPostProduction: !!formData.postProductionHours,
                      eventDate: formData.eventDate,
                    }}
                    onChange={(updates) => setFormData({ 
                      ...formData, 
                      ...updates,
                      postProductionHours: updates.includesPostProduction ? 8 : 0,
                    })}
                  />
                )}
                
                {category === 'technology' && (
                  <WebSystemsFields
                    formData={{
                      webSystemsData: {
                        projectType: formData.webProjectType,
                        numberOfPages: formData.numberOfPages,
                        numberOfModules: formData.numberOfModules,
                        hasPaymentIntegration: formData.hasPaymentIntegration,
                        hasCrmIntegration: formData.hasCrmIntegration,
                        hasErpIntegration: formData.hasErpIntegration,
                        hasMaintenanceSupport: formData.hasMaintenance,
                        maintenanceMonths: formData.maintenanceMonths,
                      }
                    }}
                    onChange={(updates) => {
                      const data = updates.webSystemsData;
                      setFormData({
                        ...formData,
                        webProjectType: data?.projectType,
                        numberOfPages: data?.numberOfPages,
                        numberOfModules: data?.numberOfModules,
                        hasPaymentIntegration: data?.hasPaymentIntegration,
                        hasCrmIntegration: data?.hasCrmIntegration,
                        hasErpIntegration: data?.hasErpIntegration,
                        hasMaintenance: data?.hasMaintenanceSupport,
                        maintenanceMonths: data?.maintenanceMonths,
                      });
                    }}
                  />
                )}
                
                {category === 'creative' && (
                  <DesignFields
                    formData={{
                      designData: {
                        numberOfConcepts: formData.numberOfConcepts,
                        numberOfRevisions: formData.numberOfRevisions,
                        includesBrandGuidelines: formData.includesBrandGuidelines,
                        deliverableFormats: formData.deliverableFormats,
                      }
                    }}
                    onChange={(updates) => {
                      const data = updates.designData;
                      setFormData({
                        ...formData,
                        numberOfConcepts: data?.numberOfConcepts,
                        numberOfRevisions: data?.numberOfRevisions,
                        includesBrandGuidelines: data?.includesBrandGuidelines,
                        deliverableFormats: data?.deliverableFormats,
                      });
                    }}
                  />
                )}
              </motion.div>
            )}

            {currentStep === 'deliverables' && (
              <motion.div
                key="deliverables"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-lg font-semibold mb-4">Entregáveis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione os entregáveis para este serviço
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {deliverableOptions.map((option) => {
                    const isSelected = formData.deliverables.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleDeliverable(option.value)}
                        className={cn(
                          "p-3 rounded-lg border-2 text-left transition-all flex items-center gap-2",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                          isSelected 
                            ? "bg-primary border-primary" 
                            : "border-muted-foreground"
                        )}>
                          {isSelected && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <span className={cn(
                          "text-sm",
                          isSelected ? "text-primary font-medium" : "text-foreground"
                        )}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {currentStepIndex > 0 && (
              <Button variant="outline" onClick={handleBack}>
                Anterior
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            {isLastStep ? (
              <Button onClick={handleSave} disabled={!canProceed()}>
                {mode === 'create' ? 'Adicionar Serviço' : 'Guardar Alterações'}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Próximo
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
