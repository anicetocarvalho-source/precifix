import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useProposalStore } from '@/stores/proposalStore';
import {
  ProposalFormData,
  ClientType,
  Complexity,
  ServiceType,
  Methodology,
} from '@/types/proposal';
import {
  ArrowLeft,
  ArrowRight,
  Building,
  Briefcase,
  MapPin,
  Clock,
  Users,
  FileText,
  CheckCircle,
  Building2,
  Landmark,
  Heart,
  Rocket,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface Question {
  id: keyof ProposalFormData | 'intro';
  type: 'intro' | 'select' | 'multi-select' | 'text' | 'number' | 'locations';
  title: string;
  subtitle?: string;
  options?: QuestionOption[];
  placeholder?: string;
  suffix?: string;
}

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
    type: 'select',
    title: 'Qual tipo de serviço será prestado?',
    subtitle: 'Escolha o serviço principal da consultoria',
    options: [
      { value: 'pmo', label: 'PMO', description: 'Gestão de Portfólio de Projectos' },
      { value: 'restructuring', label: 'Reestruturação', description: 'Reorganização de processos e equipas' },
      { value: 'monitoring', label: 'Acompanhamento', description: 'Monitorização e suporte contínuo' },
      { value: 'training', label: 'Formação', description: 'Capacitação e desenvolvimento de competências' },
      { value: 'audit', label: 'Auditoria', description: 'Avaliação e diagnóstico de processos' },
      { value: 'strategy', label: 'Estratégia', description: 'Planeamento estratégico e roadmaps' },
    ],
  },
  {
    id: 'estimatedDuration',
    type: 'number',
    title: 'Qual a duração estimada do projecto?',
    subtitle: 'Em meses',
    placeholder: '6',
    suffix: 'meses',
  },
  {
    id: 'locations',
    type: 'locations',
    title: 'Quais as localizações envolvidas?',
    subtitle: 'Adicione todas as cidades ou regiões onde o projecto será executado',
    placeholder: 'Ex: Luanda',
  },
  {
    id: 'complexity',
    type: 'select',
    title: 'Qual o nível de complexidade?',
    subtitle: 'Avalie a complexidade geral do projecto',
    options: [
      { value: 'low', label: 'Baixa', description: 'Projeto simples, poucos stakeholders, escopo definido' },
      { value: 'medium', label: 'Média', description: 'Complexidade moderada, múltiplas áreas envolvidas' },
      { value: 'high', label: 'Alta', description: 'Projeto complexo, alto risco, muitos stakeholders' },
    ],
  },
  {
    id: 'clientMaturity',
    type: 'select',
    title: 'Qual o nível de maturidade do cliente?',
    subtitle: 'Em termos de gestão de projectos',
    options: [
      { value: 'low', label: 'Baixo', description: 'Sem processos formais, pouca experiência' },
      { value: 'medium', label: 'Médio', description: 'Alguns processos estabelecidos' },
      { value: 'high', label: 'Alto', description: 'Processos maduros, equipa experiente' },
    ],
  },
  {
    id: 'deliverables',
    type: 'multi-select',
    title: 'Quais entregáveis são esperados?',
    subtitle: 'Selecione todos que se aplicam',
    options: [
      { value: 'reports', label: 'Relatórios' },
      { value: 'dashboards', label: 'Dashboards' },
      { value: 'kpis', label: 'KPIs' },
      { value: 'schedules', label: 'Cronogramas' },
      { value: 'training', label: 'Materiais de Formação' },
      { value: 'documentation', label: 'Documentação de Processos' },
    ],
  },
  {
    id: 'hasExistingTeam',
    type: 'select',
    title: 'O cliente tem equipa de projecto existente?',
    subtitle: 'Isso influencia a composição da nossa equipa',
    options: [
      { value: 'true', label: 'Sim', description: 'Existe uma equipa interna para apoiar' },
      { value: 'false', label: 'Não', description: 'Precisaremos de equipa completa' },
    ],
  },
  {
    id: 'methodology',
    type: 'select',
    title: 'Qual metodologia será utilizada?',
    subtitle: 'Escolha a abordagem metodológica',
    options: [
      { value: 'traditional', label: 'Tradicional', description: 'Waterfall, PMBOK, PRINCE2' },
      { value: 'agile', label: 'Ágil', description: 'Scrum, Kanban, Lean' },
      { value: 'hybrid', label: 'Híbrida', description: 'Combinação de métodos tradicionais e ágeis' },
    ],
  },
];

export default function NewProposal() {
  const navigate = useNavigate();
  const { createProposal } = useProposalStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<ProposalFormData>>({
    locations: [''],
    deliverables: [],
  });
  const [locations, setLocations] = useState<string[]>(['']);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep) / (questions.length - 1)) * 100;

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit form
      const finalData: ProposalFormData = {
        clientType: (formData.clientType as ClientType) || 'private',
        clientName: formData.clientName || '',
        sector: formData.sector || '',
        serviceType: (formData.serviceType as ServiceType) || 'pmo',
        estimatedDuration: formData.estimatedDuration || 6,
        locations: locations.filter(Boolean),
        complexity: (formData.complexity as Complexity) || 'medium',
        clientMaturity: (formData.clientMaturity as 'low' | 'medium' | 'high') || 'medium',
        deliverables: formData.deliverables || [],
        hasExistingTeam: formData.hasExistingTeam === true,
        methodology: (formData.methodology as Methodology) || 'hybrid',
      };
      const proposal = createProposal(finalData);
      navigate(`/proposta/${proposal.id}`);
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
    // Auto-advance after selection
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
    if (currentQuestion.type === 'text') {
      const value = formData[currentQuestion.id as keyof ProposalFormData];
      return typeof value === 'string' && value.trim().length > 0;
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

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Passo {currentStep + 1} de {questions.length}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}%
            </span>
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
                          'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                          isSelected
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        )}
                      >
                        {isSelected && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <span className="font-medium text-foreground">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Text input */}
            {currentQuestion.type === 'text' && (
              <input
                type="text"
                value={(formData[currentQuestion.id as keyof ProposalFormData] as string) || ''}
                onChange={(e) => handleTextInput(e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="w-full text-xl p-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                autoFocus
              />
            )}

            {/* Number input */}
            {currentQuestion.type === 'number' && (
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={(formData[currentQuestion.id as keyof ProposalFormData] as number) || ''}
                  onChange={(e) => handleNumberInput(e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="flex-1 text-xl p-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                  autoFocus
                  min={1}
                />
                {currentQuestion.suffix && (
                  <span className="text-lg text-muted-foreground">{currentQuestion.suffix}</span>
                )}
              </div>
            )}

            {/* Locations */}
            {currentQuestion.type === 'locations' && (
              <div className="space-y-3">
                {locations.map((location, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => updateLocation(index, e.target.value)}
                      placeholder={currentQuestion.placeholder}
                      className="flex-1 text-lg p-3 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                      autoFocus={index === locations.length - 1}
                    />
                    {locations.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLocation(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addLocation}
                  className="w-full mt-2"
                >
                  + Adicionar localização
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>

          {(currentQuestion.type !== 'select' || currentStep === 0) && (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2"
            >
              {currentStep === questions.length - 1 ? 'Gerar Proposta' : 'Continuar'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
