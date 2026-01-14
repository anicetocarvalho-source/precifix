import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProposals } from '@/hooks/useProposals';
import { ProposalService, createDefaultService } from '@/types/proposalService';
import { ServicesList } from '@/components/proposal/ServicesList';
import { ServiceFormModal } from '@/components/proposal/ServiceFormModal';
import { MultiServicePricingPreview } from '@/components/proposal/MultiServicePricingPreview';
import { SaveAsTemplateDialog } from '@/components/proposal/SaveAsTemplateDialog';
import { TemplatePickerDialog } from '@/components/proposal/TemplatePickerDialog';
import { useServiceTemplates } from '@/hooks/useServiceTemplates';
import { calculateMultiServicePricing, updateServicesWithPricing } from '@/lib/pricingMultiService';
import { usePricingParameters, toPricingParams } from '@/hooks/usePricingParameters';
import { DEFAULT_PRICING_PARAMS } from '@/lib/pricing';
import {
  ProposalFormData,
  ClientType,
  Complexity,
  ServiceType,
  Methodology,
  DurationUnit,
} from '@/types/proposal';
import {
  ArrowLeft,
  ArrowRight,
  Building,
  Briefcase,
  FileText,
  CheckCircle,
  Building2,
  Landmark,
  Heart,
  Rocket,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Cloud,
  CloudOff,
  MapPin,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'intro' | 'client' | 'services' | 'locations' | 'review';

const STEPS: Step[] = ['intro', 'client', 'services', 'locations', 'review'];

const STEP_LABELS: Record<Step, string> = {
  intro: 'Início',
  client: 'Cliente',
  services: 'Serviços',
  locations: 'Localizações',
  review: 'Revisão',
};

const CLIENT_TYPE_OPTIONS = [
  { value: 'public', label: 'Instituição Pública', description: 'Ministérios, autarquias, agências governamentais', icon: Landmark },
  { value: 'private', label: 'Empresa Privada', description: 'Sociedades comerciais, multinacionais', icon: Building2 },
  { value: 'ngo', label: 'ONG', description: 'Organizações sem fins lucrativos, fundações', icon: Heart },
  { value: 'startup', label: 'Startup', description: 'Empresas inovadoras em fase de crescimento', icon: Rocket },
];

interface ClientFormData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientType: ClientType;
  sector: string;
}

const DRAFT_STORAGE_KEY = 'precifix-multiservice-proposal-draft';

interface DraftState {
  clientData: ClientFormData;
  services: ProposalService[];
  locations: string[];
  currentStep: Step;
  savedAt: number;
}

export default function NewMultiServiceProposal() {
  const navigate = useNavigate();
  const { createMultiServiceProposal } = useProposals();
  const { parameters } = usePricingParameters();

  // Load saved draft
  const loadSavedDraft = useCallback((): DraftState | null => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved) as DraftState;
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        if (draft.savedAt > oneDayAgo) {
          return draft;
        }
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error loading draft:', e);
    }
    return null;
  }, []);

  const savedDraft = loadSavedDraft();

  const [currentStep, setCurrentStep] = useState<Step>(savedDraft?.currentStep || 'intro');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<ProposalService | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [serviceForTemplate, setServiceForTemplate] = useState<ProposalService | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(savedDraft ? new Date(savedDraft.savedAt) : null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDraftRestored, setShowDraftRestored] = useState(!!savedDraft);
  
  const { createTemplate, isCreating: isCreatingTemplate } = useServiceTemplates();
  
  const [clientData, setClientData] = useState<ClientFormData>(savedDraft?.clientData || {
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientType: 'private',
    sector: '',
  });
  
  const [services, setServices] = useState<ProposalService[]>(savedDraft?.services || []);
  const [locations, setLocations] = useState<string[]>(savedDraft?.locations || ['']);

  // Auto-save
  useEffect(() => {
    setIsSaving(true);
    const timeoutId = setTimeout(() => {
      const draftState: DraftState = {
        clientData,
        services,
        locations,
        currentStep,
        savedAt: Date.now(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftState));
      setLastSavedAt(new Date());
      setIsSaving(false);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [clientData, services, locations, currentStep]);

  // Clear draft notification
  useEffect(() => {
    if (showDraftRestored) {
      const timer = setTimeout(() => setShowDraftRestored(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showDraftRestored]);

  const clearSavedDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  }, []);

  const formatLastSaved = (date: Date | null): string => {
    if (!date) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    if (diffSecs < 10) return 'agora mesmo';
    if (diffSecs < 60) return `há ${diffSecs} segundos`;
    if (diffMins === 1) return 'há 1 minuto';
    if (diffMins < 60) return `há ${diffMins} minutos`;
    return `há ${Math.floor(diffMins / 60)} horas`;
  };

  const currentStepIndex = STEPS.indexOf(currentStep);
  const progress = ((currentStepIndex) / (STEPS.length - 1)) * 100;

  // Update services with pricing
  const servicesWithPricing = updateServicesWithPricing(
    services,
    parameters ? toPricingParams(parameters) : DEFAULT_PRICING_PARAMS
  );

  const pricingParams = parameters ? toPricingParams(parameters) : DEFAULT_PRICING_PARAMS;
  const totalPricing = services.length > 0 
    ? calculateMultiServicePricing(services, pricingParams) 
    : null;

  const handleAddService = () => {
    setEditingService(null);
    setShowServiceModal(true);
  };

  const handleEditService = (id: string) => {
    const service = services.find(s => s.id === id);
    if (service) {
      setEditingService(service);
      setShowServiceModal(true);
    }
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const handleDuplicateService = (id: string) => {
    const serviceToDuplicate = services.find(s => s.id === id);
    if (serviceToDuplicate) {
      const duplicatedService: ProposalService = {
        ...serviceToDuplicate,
        id: crypto.randomUUID(),
        displayOrder: services.length,
      };
      setServices([...services, duplicatedService]);
    }
  };

  const handleReorderServices = (reorderedServices: ProposalService[]) => {
    // Update display order for each service
    const updatedServices = reorderedServices.map((service, index) => ({
      ...service,
      displayOrder: index,
    }));
    setServices(updatedServices);
  };

  const handleSaveService = (service: ProposalService) => {
    if (editingService) {
      setServices(services.map(s => s.id === service.id ? service : s));
    } else {
      setServices([...services, { ...service, displayOrder: services.length }]);
    }
    setShowServiceModal(false);
    setEditingService(null);
  };


  const handleAddFromTemplate = () => {
    setShowTemplateDialog(true);
  };

  const handleSelectTemplate = (service: ProposalService) => {
    setServices([...services, { ...service, displayOrder: services.length }]);
  };

  const handleSaveAsTemplate = (service: ProposalService) => {
    setServiceForTemplate(service);
    setShowSaveTemplateDialog(true);
  };

  const handleConfirmSaveTemplate = (name: string, description: string) => {
    if (serviceForTemplate) {
      createTemplate({ service: serviceForTemplate, name, description });
      setShowSaveTemplateDialog(false);
      setServiceForTemplate(null);
    }
  };

  const addLocation = () => setLocations([...locations, '']);
  const updateLocation = (index: number, value: string) => {
    const updated = [...locations];
    updated[index] = value;
    setLocations(updated);
  };
  const removeLocation = (index: number) => {
    const updated = locations.filter((_, i) => i !== index);
    setLocations(updated.length ? updated : ['']);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'intro':
        return true;
      case 'client':
        return clientData.clientName.trim().length > 0 && 
               clientData.sector.trim().length > 0 &&
               clientData.clientType;
      case 'services':
        return services.length > 0;
      case 'locations':
        return locations.some(l => l.trim().length > 0);
      case 'review':
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    } else {
      // Submit - create proposal with all services
      setIsSubmitting(true);
      
      try {
        const result = await createMultiServiceProposal.mutateAsync({
          clientData: {
            clientName: clientData.clientName,
            clientEmail: clientData.clientEmail || undefined,
            clientPhone: clientData.clientPhone || undefined,
            clientType: clientData.clientType,
            sector: clientData.sector,
          },
          services: servicesWithPricing,
          locations: locations.filter(Boolean),
        });
        
        clearSavedDraft();
        navigate(`/proposta/${result.id}`);
      } catch (error) {
        console.error('Error creating proposal:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Main Form */}
        <div className="flex-1 max-w-3xl mx-auto lg:mx-0">
          
          {/* Draft Restored Notification */}
          <AnimatePresence>
            {showDraftRestored && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary">Rascunho restaurado automaticamente</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearSavedDraft();
                    setClientData({ clientName: '', clientEmail: '', clientPhone: '', clientType: 'private', sector: '' });
                    setServices([]);
                    setLocations(['']);
                    setCurrentStep('intro');
                    setShowDraftRestored(false);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Limpar e começar de novo
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {STEP_LABELS[currentStep]} ({currentStepIndex + 1} de {STEPS.length})
              </span>
              <div className="flex items-center gap-3">
                <motion.div 
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      <span>A guardar...</span>
                    </>
                  ) : lastSavedAt ? (
                    <>
                      <Cloud className="w-3.5 h-3.5 text-green-500" />
                      <span>Guardado {formatLastSaved(lastSavedAt)}</span>
                    </>
                  ) : (
                    <>
                      <CloudOff className="w-3.5 h-3.5" />
                      <span>Não guardado</span>
                    </>
                  )}
                </motion.div>
                <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full gradient-brand"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            {/* Step indicators */}
            <div className="flex justify-between mt-4">
              {STEPS.map((step, index) => (
                <div 
                  key={step}
                  className={cn(
                    "flex flex-col items-center gap-1",
                    index <= currentStepIndex ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    index < currentStepIndex 
                      ? "bg-primary text-primary-foreground"
                      : index === currentStepIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {index < currentStepIndex ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-xs hidden sm:block">{STEP_LABELS[step]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-card rounded-2xl border border-border p-8 shadow-card"
            >
              {/* Intro Step */}
              {currentStep === 'intro' && (
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    Criar Nova Proposta
                  </h1>
                  <p className="text-muted-foreground mb-8">
                    Crie propostas com múltiplos serviços independentes
                  </p>
                  <div className="flex flex-col items-center py-8">
                    <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center mb-6 shadow-brand">
                      <FileText className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-8 w-full">
                      <div className="text-center p-4 rounded-xl bg-muted">
                        <Building className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">1. Cliente</p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-muted">
                        <Plus className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">2. Serviços</p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-muted">
                        <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">3. Proposta</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Client Step */}
              {currentStep === 'client' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      Informações do Cliente
                    </h1>
                    <p className="text-muted-foreground">
                      Dados básicos do cliente para a proposta
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="clientName">Nome do Cliente *</Label>
                      <Input
                        id="clientName"
                        value={clientData.clientName}
                        onChange={(e) => setClientData({ ...clientData, clientName: e.target.value })}
                        placeholder="Ex: Ministério da Saúde"
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clientEmail">Email (opcional)</Label>
                        <Input
                          id="clientEmail"
                          type="email"
                          value={clientData.clientEmail}
                          onChange={(e) => setClientData({ ...clientData, clientEmail: e.target.value })}
                          placeholder="cliente@empresa.com"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="clientPhone">Telefone (opcional)</Label>
                        <Input
                          id="clientPhone"
                          value={clientData.clientPhone}
                          onChange={(e) => setClientData({ ...clientData, clientPhone: e.target.value })}
                          placeholder="923456789"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="sector">Sector de Atuação *</Label>
                      <Input
                        id="sector"
                        value={clientData.sector}
                        onChange={(e) => setClientData({ ...clientData, sector: e.target.value })}
                        placeholder="Ex: Saúde, Energia, Tecnologia"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Tipo de Cliente *</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {CLIENT_TYPE_OPTIONS.map((option) => {
                          const isSelected = clientData.clientType === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setClientData({ ...clientData, clientType: option.value as ClientType })}
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left',
                                isSelected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              )}
                            >
                              <div className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center',
                                isSelected ? 'bg-primary/10' : 'bg-muted'
                              )}>
                                <option.icon className={cn(
                                  'w-4 h-4',
                                  isSelected ? 'text-primary' : 'text-muted-foreground'
                                )} />
                              </div>
                              <div>
                                <p className={cn('text-sm font-medium', isSelected ? 'text-primary' : 'text-foreground')}>
                                  {option.label}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Services Step */}
              {currentStep === 'services' && (
                <div>
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      Serviços da Proposta
                    </h1>
                    <p className="text-muted-foreground">
                      Adicione os serviços que serão prestados ao cliente
                    </p>
                  </div>

                  <ServicesList
                    services={servicesWithPricing}
                    onAddService={handleAddService}
                    onAddFromTemplate={handleAddFromTemplate}
                    onRemoveService={handleRemoveService}
                    onEditService={handleEditService}
                    onDuplicateService={handleDuplicateService}
                    onSaveAsTemplate={handleSaveAsTemplate}
                    onReorderServices={handleReorderServices}
                    totalValue={totalPricing?.totalFinalPrice}
                  />
                </div>
              )}

              {/* Locations Step */}
              {currentStep === 'locations' && (
                <div>
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      Localizações
                    </h1>
                    <p className="text-muted-foreground">
                      Onde os serviços serão executados
                    </p>
                  </div>

                  <div className="space-y-4">
                    {locations.map((location, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                          <Input
                            value={location}
                            onChange={(e) => updateLocation(index, e.target.value)}
                            placeholder="Ex: Luanda"
                            className="flex-1"
                          />
                        </div>
                        {locations.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLocation(index)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" onClick={addLocation} className="w-full">
                      + Adicionar Localização
                    </Button>
                  </div>
                </div>
              )}

              {/* Review Step */}
              {currentStep === 'review' && (
                <div>
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      Revisão da Proposta
                    </h1>
                    <p className="text-muted-foreground">
                      Confirme os detalhes antes de criar
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Client Summary */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h3 className="font-medium text-foreground mb-2">Cliente</h3>
                      <p className="text-lg font-semibold">{clientData.clientName}</p>
                      <p className="text-sm text-muted-foreground">{clientData.sector}</p>
                      {clientData.clientEmail && (
                        <p className="text-sm text-muted-foreground">{clientData.clientEmail}</p>
                      )}
                    </div>

                    {/* Services Summary */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h3 className="font-medium text-foreground mb-2">
                        Serviços ({services.length})
                      </h3>
                      <div className="space-y-2">
                        {servicesWithPricing.map((service, index) => (
                          <div key={service.id} className="flex items-center justify-between">
                            <span className="text-sm">{index + 1}. {service.serviceType}</span>
                            <span className="text-sm font-medium">
                              {service.serviceValue?.toLocaleString('pt-AO')} Kz
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Locations Summary */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h3 className="font-medium text-foreground mb-2">Localizações</h3>
                      <p className="text-sm">{locations.filter(Boolean).join(', ')}</p>
                    </div>

                    {/* Total */}
                    {totalPricing && (
                      <div className="bg-primary/10 rounded-lg p-4 text-center">
                        <p className="text-sm text-muted-foreground">Valor Total Estimado</p>
                        <p className="text-2xl font-bold text-primary">
                          {totalPricing.totalFinalPrice.toLocaleString('pt-AO')} Kz
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStepIndex === 0}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || isSubmitting}
                  className="gap-2 min-w-[140px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      A criar...
                    </>
                  ) : currentStep === 'review' ? (
                    <>
                      Criar Proposta
                      <CheckCircle className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Continuar
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pricing Preview Sidebar */}
        <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
          <MultiServicePricingPreview services={services} />
        </div>

        {/* Mobile Pricing Preview */}
        <div className="lg:hidden">
          <MultiServicePricingPreview services={services} />
        </div>
      </div>

      {/* Service Form Modal */}
      <ServiceFormModal
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setEditingService(null);
        }}
        onSave={handleSaveService}
        service={editingService || undefined}
        mode={editingService ? 'edit' : 'create'}
      />

      {/* Template Picker Dialog */}
      <TemplatePickerDialog
        isOpen={showTemplateDialog}
        onClose={() => setShowTemplateDialog(false)}
        onSelect={handleSelectTemplate}
      />

      {/* Save As Template Dialog */}
      <SaveAsTemplateDialog
        isOpen={showSaveTemplateDialog}
        onClose={() => {
          setShowSaveTemplateDialog(false);
          setServiceForTemplate(null);
        }}
        onSave={handleConfirmSaveTemplate}
        service={serviceForTemplate}
        isSaving={isCreatingTemplate}
      />
    </MainLayout>
  );
}
