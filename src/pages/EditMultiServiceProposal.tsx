import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProposal } from '@/hooks/useProposal';
import { useProposals } from '@/hooks/useProposals';
import { useProposalServices } from '@/hooks/useProposalServices';
import { ProposalService } from '@/types/proposalService';
import { ServicesList } from '@/components/proposal/ServicesList';
import { ServiceFormModal } from '@/components/proposal/ServiceFormModal';
import { MultiServicePricingPreview } from '@/components/proposal/MultiServicePricingPreview';
import { SaveAsTemplateDialog } from '@/components/proposal/SaveAsTemplateDialog';
import { TemplatePickerDialog } from '@/components/proposal/TemplatePickerDialog';
import { useServiceTemplates } from '@/hooks/useServiceTemplates';
import { calculateMultiServicePricing, updateServicesWithPricing } from '@/lib/pricingMultiService';
import { usePricingParameters, toPricingParams } from '@/hooks/usePricingParameters';
import { DEFAULT_PRICING_PARAMS } from '@/lib/pricing';
import { ClientType } from '@/types/proposal';
import {
  ArrowLeft,
  ArrowRight,
  Building,
  CheckCircle,
  Building2,
  Landmark,
  Heart,
  Rocket,
  Loader2,
  MapPin,
  Plus,
  X,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { EditMultiServiceProposalSkeleton } from '@/components/skeletons/EditProposalSkeleton';

type Step = 'client' | 'services' | 'locations' | 'review';

const STEPS: Step[] = ['client', 'services', 'locations', 'review'];

const STEP_LABELS: Record<Step, string> = {
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

export default function EditMultiServiceProposal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: proposal, isLoading: isLoadingProposal } = useProposal(id);
  const { updateMultiServiceProposal } = useProposals();
  const { data: existingServices, isLoading: isLoadingServices } = useProposalServices(id);
  const { parameters } = usePricingParameters();
  const { createTemplate, isCreating: isCreatingTemplate } = useServiceTemplates();

  const [currentStep, setCurrentStep] = useState<Step>('client');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<ProposalService | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [serviceForTemplate, setServiceForTemplate] = useState<ProposalService | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  const [clientData, setClientData] = useState<ClientFormData>({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientType: 'private',
    sector: '',
  });
  
  const [services, setServices] = useState<ProposalService[]>([]);
  const [locations, setLocations] = useState<string[]>(['']);

  // Initialize form data from existing proposal
  useEffect(() => {
    if (proposal && existingServices && !initialized) {
      setClientData({
        clientName: proposal.formData.clientName || '',
        clientEmail: proposal.formData.clientEmail || '',
        clientPhone: proposal.formData.clientPhone || '',
        clientType: proposal.formData.clientType || 'private',
        sector: proposal.formData.sector || '',
      });
      setServices(existingServices);
      setLocations(proposal.formData.locations.length > 0 ? proposal.formData.locations : ['']);
      setInitialized(true);
    }
  }, [proposal, existingServices, initialized]);

  const currentStepIndex = STEPS.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

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

  const handleEditService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setEditingService(service);
      setShowServiceModal(true);
    }
  };

  const handleRemoveService = (serviceId: string) => {
    setServices(services.filter(s => s.id !== serviceId));
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
      // Submit - update proposal with all services
      setIsSubmitting(true);
      
      try {
        await updateMultiServiceProposal.mutateAsync({
          id: id!,
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
        
        navigate(`/proposta/${id}`);
      } catch (error) {
        console.error('Error updating proposal:', error);
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

  if (isLoadingProposal || isLoadingServices || !initialized) {
    return (
      <MainLayout>
        <EditMultiServiceProposalSkeleton />
      </MainLayout>
    );
  }

  if (!proposal) {
    return (
      <MainLayout>
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-foreground mb-4">Proposta não encontrada</h1>
          <Button onClick={() => navigate('/historico')}>Voltar ao Histórico</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Main Form */}
        <div className="flex-1 max-w-3xl mx-auto lg:mx-0">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/proposta/${id}`)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold">Editar Proposta Multi-Serviços</h1>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {STEP_LABELS[currentStep]} ({currentStepIndex + 1} de {STEPS.length})
              </span>
              <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
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
              {/* Client Step */}
              {currentStep === 'client' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      Informações do Cliente
                    </h1>
                    <p className="text-muted-foreground">
                      Atualize os dados do cliente
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
                      <Label>Tipo de Cliente *</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {CLIENT_TYPE_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setClientData({ ...clientData, clientType: option.value as ClientType })}
                            className={cn(
                              "flex items-start gap-3 p-4 rounded-xl border transition-all text-left",
                              clientData.clientType === option.value
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              clientData.clientType === option.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            )}>
                              <option.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm">{option.label}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{option.description}</p>
                            </div>
                          </button>
                        ))}
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
                  </div>
                </div>
              )}

              {/* Services Step */}
              {currentStep === 'services' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      Serviços da Proposta
                    </h1>
                    <p className="text-muted-foreground">
                      Adicione, remova ou modifique os serviços
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
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      Localizações
                    </h1>
                    <p className="text-muted-foreground">
                      Onde os serviços serão executados
                    </p>
                  </div>

                  <div className="space-y-3">
                    {locations.map((loc, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="relative flex-1">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            value={loc}
                            onChange={(e) => updateLocation(index, e.target.value)}
                            placeholder="Ex: Luanda"
                            className="pl-10"
                          />
                        </div>
                        {locations.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLocation(index)}
                            className="shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addLocation}
                      className="w-full gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Localização
                    </Button>
                  </div>
                </div>
              )}

              {/* Review Step */}
              {currentStep === 'review' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      Revisão Final
                    </h1>
                    <p className="text-muted-foreground">
                      Confirme as alterações antes de guardar
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3 mb-3">
                        <Building className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Cliente</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Nome:</span>
                          <span className="ml-2 font-medium">{clientData.clientName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tipo:</span>
                          <span className="ml-2 font-medium">
                            {CLIENT_TYPE_OPTIONS.find(o => o.value === clientData.clientType)?.label}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sector:</span>
                          <span className="ml-2 font-medium">{clientData.sector}</span>
                        </div>
                        {clientData.clientEmail && (
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                            <span className="ml-2 font-medium">{clientData.clientEmail}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3 mb-3">
                        <Plus className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Serviços ({services.length})</h3>
                      </div>
                      <div className="space-y-2">
                        {servicesWithPricing.map((service, index) => (
                          <div key={service.id} className="flex justify-between text-sm">
                            <span>{index + 1}. {service.serviceType}</span>
                            <span className="font-medium">
                              {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(service.serviceValue)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3 mb-3">
                        <MapPin className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Localizações</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {locations.filter(Boolean).map((loc, index) => (
                          <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                            {loc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStepIndex === 0}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Anterior
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      A guardar...
                    </>
                  ) : currentStepIndex === STEPS.length - 1 ? (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar Alterações
                    </>
                  ) : (
                    <>
                      Próximo
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pricing Preview Sidebar */}
        <div className="lg:w-80 lg:shrink-0">
          <div className="lg:sticky lg:top-24">
            <MultiServicePricingPreview services={servicesWithPricing} />
          </div>
        </div>
      </div>

      {/* Service Modal */}
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

      <TemplatePickerDialog
        isOpen={showTemplateDialog}
        onClose={() => setShowTemplateDialog(false)}
        onSelect={handleSelectTemplate}
      />

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
