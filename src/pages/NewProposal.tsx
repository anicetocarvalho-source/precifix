import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useProposals } from '@/hooks/useProposals';
import { useProposalStore } from '@/stores/proposalStore';
import {
  ProposalFormData,
  ClientType,
  Complexity,
  ServiceType,
  Methodology,
  SERVICE_CATEGORIES,
  ServiceCategory,
} from '@/types/proposal';
import {
  ArrowLeft,
  ArrowRight,
  Building,
  Briefcase,
  MapPin,
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ServiceSelector } from '@/components/proposal/ServiceSelector';
import { EventFields } from '@/components/proposal/EventFields';
import { WebSystemsFields } from '@/components/proposal/WebSystemsFields';
import { DesignFields } from '@/components/proposal/DesignFields';
import { PricingPreview } from '@/components/proposal/PricingPreview';

interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface Question {
  id: keyof ProposalFormData | 'intro' | 'sectorSpecific';
  type: 'intro' | 'select' | 'multi-select' | 'text' | 'number' | 'locations' | 'service-selector' | 'sector-specific';
  title: string;
  subtitle?: string;
  options?: QuestionOption[];
  placeholder?: string;
  suffix?: string;
  condition?: (data: Partial<ProposalFormData>) => boolean;
}

// Get questions dynamically based on service category
const getQuestions = (formData: Partial<ProposalFormData>): Question[] => {
  const serviceCategory = formData.serviceType ? SERVICE_CATEGORIES[formData.serviceType] : null;
  
  const questions: Question[] = [
    {
      id: 'intro',
      type: 'intro',
      title: 'Vamos criar a sua proposta',
      subtitle: 'Responda algumas perguntas para gerar uma cotação precisa e documentos profissionais.',
    },
    {
      id: 'clientName',
      type: 'text',
      title: 'Qual é o nome do cliente?',
      subtitle: 'Insira o nome da organização ou empresa',
      placeholder: 'Ex: Ministério da Saúde',
    },
    {
      id: 'clientEmail',
      type: 'text',
      title: 'Qual é o email do cliente?',
      subtitle: 'Para envio da proposta (opcional)',
      placeholder: 'Ex: cliente@empresa.com',
    },
    {
      id: 'clientPhone',
      type: 'text',
      title: 'Qual é o telefone do cliente?',
      subtitle: 'Formato angolano: 9 dígitos começando com 9 (opcional)',
      placeholder: 'Ex: 923456789',
    },
    {
      id: 'clientType',
      type: 'select',
      title: 'Qual o tipo de cliente?',
      subtitle: 'Selecione a categoria que melhor descreve o cliente',
      options: [
        { value: 'public', label: 'Instituição Pública', description: 'Ministérios, autarquias, agências governamentais', icon: Landmark },
        { value: 'private', label: 'Empresa Privada', description: 'Sociedades comerciais, multinacionais', icon: Building2 },
        { value: 'ngo', label: 'ONG', description: 'Organizações sem fins lucrativos, fundações', icon: Heart },
        { value: 'startup', label: 'Startup', description: 'Empresas inovadoras em fase de crescimento', icon: Rocket },
      ],
    },
    {
      id: 'sector',
      type: 'text',
      title: 'Qual o sector de atuação?',
      subtitle: 'Descreva o sector ou indústria do cliente',
      placeholder: 'Ex: Saúde, Energia, Tecnologia, Construção',
    },
    {
      id: 'serviceType',
      type: 'service-selector',
      title: 'Qual tipo de serviço será prestado?',
      subtitle: 'Escolha o serviço principal',
    },
  ];

  // Add sector-specific fields only for non-consulting services
  if (serviceCategory && serviceCategory !== 'consulting') {
    questions.push({
      id: 'sectorSpecific',
      type: 'sector-specific',
      title: 'Detalhes do Serviço',
      subtitle: 'Configure os detalhes específicos do serviço selecionado',
    });
  }

  // Duration question varies by category
  if (serviceCategory === 'consulting') {
    questions.push({
      id: 'estimatedDuration',
      type: 'number',
      title: 'Qual a duração estimada do projecto?',
      subtitle: 'Duração total do projecto de consultoria',
      placeholder: '6',
      suffix: 'meses',
    });
  } else if (serviceCategory === 'technology') {
    questions.push({
      id: 'estimatedDuration',
      type: 'number',
      title: 'Qual o prazo estimado de desenvolvimento?',
      subtitle: 'Tempo necessário para entregar o projecto',
      placeholder: '3',
      suffix: 'meses',
    });
  } else if (serviceCategory === 'creative') {
    questions.push({
      id: 'estimatedDuration',
      type: 'number',
      title: 'Qual o prazo estimado de entrega?',
      subtitle: 'Tempo para conclusão dos materiais criativos',
      placeholder: '1',
      suffix: 'meses',
    });
  } else if (serviceCategory === 'events') {
    // Events already have event-specific duration in sector-specific fields
    questions.push({
      id: 'estimatedDuration',
      type: 'number',
      title: 'Quantos meses até o evento?',
      subtitle: 'Tempo de preparação e planeamento',
      placeholder: '2',
      suffix: 'meses',
    });
  } else {
    // Default for services not yet selected
    questions.push({
      id: 'estimatedDuration',
      type: 'number',
      title: 'Qual a duração estimada?',
      subtitle: 'Em meses',
      placeholder: '6',
      suffix: 'meses',
    });
  }

  // Location question
  questions.push({
    id: 'locations',
    type: 'locations',
    title: serviceCategory === 'events' 
      ? 'Onde será realizado o evento?' 
      : 'Quais as localizações envolvidas?',
    subtitle: serviceCategory === 'events'
      ? 'Adicione as cidades ou locais onde o evento será realizado'
      : 'Adicione todas as cidades ou regiões onde o projecto será executado',
    placeholder: 'Ex: Luanda',
  });

  // Complexity - adapted per category
  questions.push({
    id: 'complexity',
    type: 'select',
    title: serviceCategory === 'events'
      ? 'Qual a escala do evento?'
      : serviceCategory === 'technology'
      ? 'Qual o nível de complexidade técnica?'
      : serviceCategory === 'creative'
      ? 'Qual o nível de exigência criativa?'
      : 'Qual o nível de complexidade?',
    subtitle: serviceCategory === 'events'
      ? 'Tamanho e complexidade do evento'
      : serviceCategory === 'technology'
      ? 'Avalie a complexidade técnica do projecto'
      : serviceCategory === 'creative'
      ? 'Nível de detalhe e sofisticação esperado'
      : 'Avalie a complexidade geral do projecto',
    options: [
      { 
        value: 'low', 
        label: 'Baixa', 
        description: serviceCategory === 'events' 
          ? 'Evento pequeno, até 50 pessoas, local simples'
          : serviceCategory === 'technology'
          ? 'Funcionalidades básicas, sem integrações complexas'
          : serviceCategory === 'creative'
          ? 'Design simples, poucas variações'
          : 'Projeto simples, poucos stakeholders, escopo definido'
      },
      { 
        value: 'medium', 
        label: 'Média', 
        description: serviceCategory === 'events'
          ? 'Evento médio, 50-200 pessoas, múltiplas áreas'
          : serviceCategory === 'technology'
          ? 'Algumas integrações, funcionalidades customizadas'
          : serviceCategory === 'creative'
          ? 'Design detalhado, múltiplas aplicações'
          : 'Complexidade moderada, múltiplas áreas envolvidas'
      },
      { 
        value: 'high', 
        label: 'Alta', 
        description: serviceCategory === 'events'
          ? 'Evento grande, +200 pessoas, produção elaborada'
          : serviceCategory === 'technology'
          ? 'Sistema complexo, múltiplas integrações, alta performance'
          : serviceCategory === 'creative'
          ? 'Produção premium, animações, efeitos avançados'
          : 'Projeto complexo, alto risco, muitos stakeholders'
      },
    ],
  });

  // Client maturity - only for consulting and technology
  if (serviceCategory === 'consulting' || serviceCategory === 'technology') {
    questions.push({
      id: 'clientMaturity',
      type: 'select',
      title: serviceCategory === 'technology'
        ? 'Qual o nível de maturidade tecnológica do cliente?'
        : 'Qual o nível de maturidade do cliente?',
      subtitle: serviceCategory === 'technology'
        ? 'Experiência do cliente com soluções tecnológicas'
        : 'Em termos de gestão de projectos',
      options: [
        { 
          value: 'low', 
          label: 'Baixo', 
          description: serviceCategory === 'technology'
            ? 'Sem sistemas existentes, pouca literacia digital'
            : 'Sem processos formais, pouca experiência'
        },
        { 
          value: 'medium', 
          label: 'Médio', 
          description: serviceCategory === 'technology'
            ? 'Alguns sistemas básicos, equipa técnica limitada'
            : 'Alguns processos estabelecidos'
        },
        { 
          value: 'high', 
          label: 'Alto', 
          description: serviceCategory === 'technology'
            ? 'Infraestrutura estabelecida, equipa técnica experiente'
            : 'Processos maduros, equipa experiente'
        },
      ],
    });
  }

  // Deliverables - adapted per category
  const deliverableOptions = getDeliverableOptions(serviceCategory);
  questions.push({
    id: 'deliverables',
    type: 'multi-select',
    title: 'Quais entregáveis são esperados?',
    subtitle: 'Selecione todos que se aplicam',
    options: deliverableOptions,
  });

  // Existing team - mainly for consulting and technology
  if (serviceCategory === 'consulting' || serviceCategory === 'technology') {
    questions.push({
      id: 'hasExistingTeam',
      type: 'select',
      title: serviceCategory === 'technology'
        ? 'O cliente tem equipa técnica existente?'
        : 'O cliente tem equipa de projecto existente?',
      subtitle: 'Isso influencia a composição da nossa equipa',
      options: [
        { value: 'true', label: 'Sim', description: 'Existe uma equipa interna para apoiar' },
        { value: 'false', label: 'Não', description: 'Precisaremos de equipa completa' },
      ],
    });
  }

  // Methodology - only for consulting and technology
  if (serviceCategory === 'consulting' || serviceCategory === 'technology') {
    questions.push({
      id: 'methodology',
      type: 'select',
      title: 'Qual metodologia será utilizada?',
      subtitle: 'Escolha a abordagem metodológica',
      options: serviceCategory === 'technology' ? [
        { value: 'traditional', label: 'Waterfall', description: 'Fases sequenciais, documentação completa' },
        { value: 'agile', label: 'Ágil', description: 'Scrum, Kanban, entregas incrementais' },
        { value: 'hybrid', label: 'Híbrida', description: 'Combinação de métodos' },
      ] : [
        { value: 'traditional', label: 'Tradicional', description: 'Waterfall, PMBOK, PRINCE2' },
        { value: 'agile', label: 'Ágil', description: 'Scrum, Kanban, Lean' },
        { value: 'hybrid', label: 'Híbrida', description: 'Combinação de métodos tradicionais e ágeis' },
      ],
    });
  }

  return questions;
};

// Get deliverable options based on service category
const getDeliverableOptions = (category: ServiceCategory | null): QuestionOption[] => {
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

// Validation rules with clear error messages
interface ValidationError {
  field: string;
  message: string;
}

const validateField = (
  questionId: string, 
  value: unknown, 
  formData: Partial<ProposalFormData>
): ValidationError | null => {
  switch (questionId) {
    case 'clientName':
      if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        return { field: questionId, message: 'O nome do cliente é obrigatório' };
      }
      if (typeof value === 'string' && value.trim().length < 2) {
        return { field: questionId, message: 'O nome deve ter pelo menos 2 caracteres' };
      }
      if (typeof value === 'string' && value.trim().length > 100) {
        return { field: questionId, message: 'O nome não pode exceder 100 caracteres' };
      }
      break;
    case 'clientEmail':
      if (value && typeof value === 'string' && value.trim().length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return { field: questionId, message: 'Formato de email inválido' };
        }
      }
      break;
    case 'clientPhone':
      if (value && typeof value === 'string' && value.trim().length > 0) {
        const cleaned = value.replace(/\s/g, '');
        const phoneRegex = /^9[0-9]{8}$/;
        if (!phoneRegex.test(cleaned)) {
          return { field: questionId, message: 'Formato: 9XXXXXXXX (9 dígitos começando com 9)' };
        }
      }
      break;
    case 'sector':
      if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        return { field: questionId, message: 'O sector é obrigatório' };
      }
      break;
    case 'estimatedDuration':
      if (!value || (typeof value === 'number' && value <= 0)) {
        return { field: questionId, message: 'A duração deve ser maior que 0' };
      }
      if (typeof value === 'number' && value > 60) {
        return { field: questionId, message: 'A duração não pode exceder 60 meses' };
      }
      break;
    case 'locations':
      const locations = value as string[];
      if (!locations || !locations.some(l => l && l.trim().length > 0)) {
        return { field: questionId, message: 'Adicione pelo menos uma localização' };
      }
      break;
    case 'deliverables':
      const deliverables = value as string[];
      if (!deliverables || deliverables.length === 0) {
        return { field: questionId, message: 'Selecione pelo menos um entregável' };
      }
      break;
  }
  return null;
};


const DRAFT_STORAGE_KEY = 'precifix-proposal-draft';

interface DraftState {
  formData: Partial<ProposalFormData>;
  locations: string[];
  currentStep: number;
  savedAt: number;
}

export default function NewProposal() {
  const navigate = useNavigate();
  const { createProposal } = useProposals();
  const { setDraft, currentDraft, clearDraft } = useProposalStore();
  
  // Load saved draft from localStorage on mount
  const loadSavedDraft = useCallback((): DraftState | null => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved) as DraftState;
        // Only restore if saved within the last 24 hours
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        if (draft.savedAt > oneDayAgo) {
          return draft;
        }
        // Clear expired draft
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error loading draft:', e);
    }
    return null;
  }, []);

  const savedDraft = loadSavedDraft();
  
  const [currentStep, setCurrentStep] = useState(savedDraft?.currentStep || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<ProposalFormData>>(
    savedDraft?.formData || {
      locations: [''],
      deliverables: [],
    }
  );
  const [locations, setLocations] = useState<string[]>(
    savedDraft?.locations || ['']
  );
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showDraftRestored, setShowDraftRestored] = useState(!!savedDraft);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(savedDraft ? new Date(savedDraft.savedAt) : null);
  const [isSaving, setIsSaving] = useState(false);

  // Format relative time
  const formatLastSaved = useCallback((date: Date | null): string => {
    if (!date) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffSecs < 10) return 'agora mesmo';
    if (diffSecs < 60) return `há ${diffSecs} segundos`;
    if (diffMins === 1) return 'há 1 minuto';
    if (diffMins < 60) return `há ${diffMins} minutos`;
    if (diffHours === 1) return 'há 1 hora';
    return `há ${diffHours} horas`;
  }, []);

  // Auto-save draft to localStorage whenever form data changes
  useEffect(() => {
    setIsSaving(true);
    
    const timeoutId = setTimeout(() => {
      const draftState: DraftState = {
        formData,
        locations,
        currentStep,
        savedAt: Date.now(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftState));
      
      // Also save to store for potential cross-tab sync
      setDraft(formData as Partial<ProposalFormData>);
      setLastSavedAt(new Date());
      setIsSaving(false);
    }, 500); // Debounce save by 500ms
    
    return () => clearTimeout(timeoutId);
  }, [formData, locations, currentStep, setDraft]);

  // Clear draft notification after 3 seconds
  useEffect(() => {
    if (showDraftRestored) {
      const timer = setTimeout(() => setShowDraftRestored(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showDraftRestored]);

  // Clear draft when form is successfully submitted
  const clearSavedDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    clearDraft();
  }, [clearDraft]);

  // Check if form has meaningful data
  const hasFormData = useCallback(() => {
    return !!(
      formData.clientName?.trim() ||
      formData.clientEmail?.trim() ||
      formData.sector?.trim() ||
      formData.serviceType ||
      (formData.deliverables && formData.deliverables.length > 0) ||
      locations.some(loc => loc.trim())
    );
  }, [formData, locations]);

  // Warn user before leaving page with unsaved data
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasFormData() && !isSubmitting) {
        e.preventDefault();
        // Modern browsers require returnValue to be set
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasFormData, isSubmitting]);

  // Get questions dynamically based on service type
  const questions = getQuestions(formData);
  
  const currentQuestion = questions[currentStep];
  const progress = ((currentStep) / (questions.length - 1)) * 100;
  
  // Get current field value and error
  const getCurrentValue = () => {
    if (currentQuestion.id === 'locations') {
      return locations;
    }
    return formData[currentQuestion.id as keyof ProposalFormData];
  };

  const getCurrentError = (): string | null => {
    const questionId = currentQuestion.id as string;
    if (!touchedFields.has(questionId)) return null;
    
    const value = getCurrentValue();
    const error = validateField(questionId, value, formData);
    return error?.message || null;
  };

  const currentError = getCurrentError();

  // Mark field as touched when user interacts
  const markFieldTouched = () => {
    const questionId = currentQuestion.id as string;
    if (!touchedFields.has(questionId)) {
      setTouchedFields(prev => new Set(prev).add(questionId));
    }
  };

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsSubmitting(true);
      const finalData: ProposalFormData = {
        clientType: (formData.clientType as ClientType) || 'private',
        clientName: formData.clientName || '',
        clientEmail: formData.clientEmail || undefined,
        clientPhone: formData.clientPhone || undefined,
        sector: formData.sector || '',
        serviceType: (formData.serviceType as ServiceType) || 'pmo',
        estimatedDuration: formData.estimatedDuration || 6,
        locations: locations.filter(Boolean),
        complexity: (formData.complexity as Complexity) || 'medium',
        clientMaturity: (formData.clientMaturity as 'low' | 'medium' | 'high') || 'medium',
        deliverables: formData.deliverables || [],
        hasExistingTeam: formData.hasExistingTeam === true,
        methodology: (formData.methodology as Methodology) || 'hybrid',
        eventType: formData.eventType,
        coverageDuration: formData.coverageDuration,
        eventDays: formData.eventDays,
        eventExtras: formData.eventExtras,
        eventStaffing: formData.eventStaffing,
        includesPostProduction: formData.includesPostProduction,
        eventDate: formData.eventDate,
        webSystemsData: formData.webSystemsData,
        designData: formData.designData,
      };
      
      try {
        const result = await createProposal.mutateAsync(finalData);
        clearSavedDraft(); // Clear draft on successful submission
        navigate(`/proposta/${result.id}`);
      } catch (error) {
        console.error('Error creating proposal:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSelect = (value: string) => {
    const questionId = currentQuestion.id as keyof ProposalFormData;
    if (questionId === 'hasExistingTeam') {
      setFormData({ ...formData, [questionId]: value === 'true' });
    } else {
      setFormData({ ...formData, [questionId]: value });
    }
    setTimeout(() => handleNext(), 300);
  };

  const handleServiceSelect = (value: ServiceType) => {
    setFormData({ ...formData, serviceType: value });
    setTimeout(() => handleNext(), 300);
  };

  const handleMultiSelect = (value: string) => {
    const current = formData.deliverables || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFormData({ ...formData, deliverables: updated });
  };

  const handleTextInput = (value: string) => {
    setFormData({ ...formData, [currentQuestion.id]: value });
  };

  const handleNumberInput = (value: string) => {
    setFormData({ ...formData, [currentQuestion.id]: parseInt(value) || 0 });
  };

  const addLocation = () => {
    setLocations([...locations, '']);
  };

  const updateLocation = (index: number, value: string) => {
    const updated = [...locations];
    updated[index] = value;
    setLocations(updated);
    setFormData({ ...formData, locations: updated.filter(Boolean) });
  };

  const removeLocation = (index: number) => {
    const updated = locations.filter((_, i) => i !== index);
    setLocations(updated.length ? updated : ['']);
  };

  const canProceed = () => {
    if (currentQuestion.type === 'intro') return true;
    if (currentQuestion.type === 'sector-specific') return true;
    if (currentQuestion.type === 'service-selector') return !!formData.serviceType;
    if (currentQuestion.type === 'text') {
      const questionId = currentQuestion.id as string;
      const value = formData[currentQuestion.id as keyof ProposalFormData] as string || '';
      
      // Optional fields (email and phone) - just need to be valid if filled
      if (questionId === 'clientEmail' || questionId === 'clientPhone') {
        const error = validateField(questionId, value, formData);
        return error === null;
      }
      
      // Required text fields
      const error = validateField(questionId, value, formData);
      return error === null;
    }
    if (currentQuestion.type === 'number') {
      const value = formData[currentQuestion.id as keyof ProposalFormData];
      return typeof value === 'number' && value > 0;
    }
    if (currentQuestion.type === 'locations') {
      return locations.some((l) => l.trim().length > 0);
    }
    if (currentQuestion.type === 'multi-select') {
      return (formData.deliverables?.length || 0) > 0;
    }
    return formData[currentQuestion.id as keyof ProposalFormData] !== undefined;
  };

  const getServiceCategory = () => {
    if (!formData.serviceType) return null;
    return SERVICE_CATEGORIES[formData.serviceType];
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
                <span className="text-sm text-primary">
                  Rascunho restaurado automaticamente
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearSavedDraft();
                  setFormData({ locations: [''], deliverables: [] });
                  setLocations(['']);
                  setCurrentStep(0);
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
              Passo {currentStep + 1} de {questions.length}
            </span>
            <div className="flex items-center gap-3">
              {/* Auto-save indicator */}
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
              <span className="text-sm font-medium text-primary">
                {Math.round(progress)}%
              </span>
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
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-2xl border border-border p-8 shadow-card"
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {currentQuestion.title}
              </h1>
              {currentQuestion.subtitle && (
                <p className="text-muted-foreground">{currentQuestion.subtitle}</p>
              )}
            </div>

            {/* Intro */}
            {currentQuestion.type === 'intro' && (
              <div className="flex flex-col items-center py-8">
                <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center mb-6 shadow-brand">
                  <FileText className="w-10 h-10 text-primary-foreground" />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-8 w-full">
                  <div className="text-center p-4 rounded-xl bg-muted">
                    <Building className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Diagnóstico</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted">
                    <Briefcase className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Proposta Técnica</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted">
                    <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Orçamento</p>
                  </div>
                </div>
              </div>
            )}

            {/* Service Selector */}
            {currentQuestion.type === 'service-selector' && (
              <ServiceSelector
                value={formData.serviceType}
                onChange={handleServiceSelect}
              />
            )}

            {/* Sector-Specific Fields */}
            {currentQuestion.type === 'sector-specific' && (
              <div className="max-h-[60vh] overflow-y-auto pr-2">
                {getServiceCategory() === 'events' && (
                  <EventFields
                    formData={formData}
                    onChange={(data) => setFormData({ ...formData, ...data })}
                  />
                )}
                {getServiceCategory() === 'technology' && (
                  <WebSystemsFields
                    formData={formData}
                    onChange={(data) => setFormData({ ...formData, ...data })}
                  />
                )}
                {getServiceCategory() === 'creative' && (
                  <DesignFields
                    formData={formData}
                    onChange={(data) => setFormData({ ...formData, ...data })}
                  />
                )}
              </div>
            )}

            {/* Select */}
            {currentQuestion.type === 'select' && (
              <div className="grid gap-3">
                {currentQuestion.options?.map((option) => {
                  const isSelected =
                    formData[currentQuestion.id as keyof ProposalFormData] === option.value ||
                    (currentQuestion.id === 'hasExistingTeam' &&
                      String(formData.hasExistingTeam) === option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left',
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      )}
                    >
                      {option.icon && (
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            isSelected ? 'bg-primary/10' : 'bg-muted'
                          )}
                        >
                          <option.icon
                            className={cn(
                              'w-5 h-5',
                              isSelected ? 'text-primary' : 'text-muted-foreground'
                            )}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{option.label}</p>
                        {option.description && (
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        )}
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Multi-select */}
            {currentQuestion.type === 'multi-select' && (
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options?.map((option) => {
                  const isSelected = formData.deliverables?.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleMultiSelect(option.value)}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left',
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded border-2 flex items-center justify-center',
                          isSelected ? 'bg-primary border-primary' : 'border-border'
                        )}
                      >
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <span className={cn('font-medium', isSelected ? 'text-primary' : 'text-foreground')}>
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Text Input */}
            {currentQuestion.type === 'text' && (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={currentQuestion.id === 'clientEmail' ? 'email' : 'text'}
                    value={(formData[currentQuestion.id as keyof ProposalFormData] as string) || ''}
                    onChange={(e) => handleTextInput(e.target.value)}
                    onBlur={markFieldTouched}
                    placeholder={currentQuestion.placeholder}
                    className={cn(
                      "w-full px-4 py-4 text-lg rounded-xl border-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                      currentError
                        ? 'border-destructive focus:border-destructive'
                        : 'border-border focus:border-primary'
                    )}
                    autoFocus
                  />
                  {currentError && (
                    <div className="flex items-center gap-2 mt-2 text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{currentError}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Number Input */}
            {currentQuestion.type === 'number' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={(formData[currentQuestion.id as keyof ProposalFormData] as number) || ''}
                    onChange={(e) => handleNumberInput(e.target.value)}
                    onBlur={markFieldTouched}
                    placeholder={currentQuestion.placeholder}
                    className={cn(
                      "w-32 px-4 py-4 text-2xl font-bold text-center rounded-xl border-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20",
                      currentError
                        ? 'border-destructive focus:border-destructive'
                        : 'border-border focus:border-primary'
                    )}
                    autoFocus
                  />
                  {currentQuestion.suffix && (
                    <span className="text-lg text-muted-foreground">{currentQuestion.suffix}</span>
                  )}
                </div>
                {currentError && (
                  <div className="flex items-center justify-center gap-2 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{currentError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Locations Input */}
            {currentQuestion.type === 'locations' && (
              <div className="space-y-4">
                {locations.map((location, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => updateLocation(index, e.target.value)}
                        placeholder={currentQuestion.placeholder}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                <Button
                  variant="outline"
                  onClick={addLocation}
                  className="w-full"
                >
                  + Adicionar Localização
                </Button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
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
                ) : currentStep === questions.length - 1 ? (
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
          <PricingPreview formData={formData} />
        </div>

        {/* Mobile Pricing Preview */}
        <div className="lg:hidden">
          <PricingPreview formData={formData} />
        </div>
      </div>
    </MainLayout>
  );
}
