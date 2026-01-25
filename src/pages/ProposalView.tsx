import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProposals } from '@/hooks/useProposals';
import { useProposal } from '@/hooks/useProposal';
import { useProposalServices } from '@/hooks/useProposalServices';
import { ProposalVersionHistory } from '@/components/ProposalVersionHistory';
import { useProposalVersions, ProposalVersion } from '@/hooks/useProposalVersions';
import { usePricingParameters } from '@/hooks/usePricingParameters';
import { useUserRole } from '@/hooks/useUserRole';
import { formatCurrency, formatNumber } from '@/lib/pricing';
import { exportProposalToPDF, exportSingleDocument } from '@/lib/pdfExport';
import { exportMultiServiceProposalToPDF } from '@/lib/pdfExportMultiService';
import { useBranding } from '@/hooks/useBranding';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { SectorDetailsView } from '@/components/proposal/SectorDetailsView';
import { ProposalServicesView } from '@/components/proposal/ProposalServicesView';
import { SERVICE_LABELS, SERVICE_CATEGORIES, DurationUnit } from '@/types/proposal';
import { ProposalViewSkeleton } from '@/components/skeletons/ProposalViewSkeleton';

// Helper function to format duration in a friendly way
const formatDuration = (duration: number, unit: DurationUnit = 'months'): string => {
  const labels: Record<DurationUnit, { singular: string; plural: string }> = {
    days: { singular: 'dia', plural: 'dias' },
    weeks: { singular: 'semana', plural: 'semanas' },
    months: { singular: 'mês', plural: 'meses' },
  };
  const label = duration === 1 ? labels[unit].singular : labels[unit].plural;
  return `${duration} ${label}`;
};
import {
  ArrowLeft,
  Download,
  FileText,
  Printer,
  Send,
  Check,
  Building,
  Calendar,
  MapPin,
  Users,
  Target,
  TrendingUp,
  Clock,
  Loader2,
  Copy,
  Pencil,
  Mail,
  Phone,
  User,
} from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type DocumentTab = 'diagnostic' | 'technical' | 'budget';

export default function ProposalView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateProposalStatus, duplicateProposal } = useProposals();
  const { data: proposal, isLoading } = useProposal(id);
  const { data: proposalServices = [], isLoading: isLoadingServices } = useProposalServices(id);
  const { restoreVersion } = useProposalVersions(id);
  const { parameters: currentPricingParams } = usePricingParameters();
  const { canViewAllProposals, canEditAllProposals } = useUserRole();
  const { branding } = useBranding();
  const [activeTab, setActiveTab] = useState<DocumentTab>('diagnostic');
  const [versionToRestore, setVersionToRestore] = useState<ProposalVersion | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const hasMultipleServices = proposalServices.length > 1;
  const [clientEmail, setClientEmail] = useState(proposal?.formData?.clientEmail || '');

  if (isLoading) {
    return (
      <MainLayout>
        <ProposalViewSkeleton />
      </MainLayout>
    );
  }

  if (!proposal) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold text-foreground mb-4">Proposta não encontrada</h1>
          <Button onClick={() => navigate('/')}>Voltar ao Dashboard</Button>
        </div>
      </MainLayout>
    );
  }

  const { formData, pricing, pricingParams: savedPricingParams } = proposal;

  // Use saved pricing params from proposal if available, otherwise use current params
  const displayPricingParams = savedPricingParams ? {
    rateSeniorManager: savedPricingParams.hourlyRates.seniorManager,
    rateConsultant: savedPricingParams.hourlyRates.consultant,
    rateAnalyst: savedPricingParams.hourlyRates.analyst,
    rateCoordinator: savedPricingParams.hourlyRates.coordinator,
    rateTrainer: savedPricingParams.hourlyRates.trainer,
    multiplierLow: savedPricingParams.complexityMultipliers.low,
    multiplierMedium: savedPricingParams.complexityMultipliers.medium,
    multiplierHigh: savedPricingParams.complexityMultipliers.high,
    overheadPercentage: savedPricingParams.overheadPercentage,
    marginPercentage: savedPricingParams.marginPercentage,
  } : currentPricingParams;

  const handleSendEmail = async () => {
    if (!clientEmail) {
      toast.error('Por favor, introduza o email do cliente');
      return;
    }

    setIsSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-proposal-email', {
        body: {
          clientEmail,
          clientName: formData.clientName,
          proposalId: proposal.id,
          serviceType: formData.serviceType,
          sector: formData.sector,
          totalValue: pricing.finalPrice,
          duration: formData.estimatedDuration,
          deliverables: formData.deliverables,
          methodology: formData.methodology,
          customMessage: customMessage || undefined,
        },
      });

      if (error) throw error;

      toast.success('Proposta enviada com sucesso!');
      setShowEmailDialog(false);
      setClientEmail('');
      setCustomMessage('');
      updateProposalStatus.mutate({ id: proposal.id, status: 'sent' });
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Erro ao enviar proposta');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const tabs = [
    { id: 'diagnostic' as const, label: 'Diagnóstico', icon: Target },
    { id: 'technical' as const, label: 'Proposta Técnica', icon: FileText },
    { id: 'budget' as const, label: 'Proposta Orçamental', icon: TrendingUp },
  ];

  // Use SERVICE_LABELS from types
  const serviceLabels = SERVICE_LABELS;
  const category = SERVICE_CATEGORIES[formData.serviceType];

  const complexityLabels: Record<string, string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
  };

  const methodologyLabels: Record<string, string> = {
    traditional: 'Tradicional (Waterfall)',
    agile: 'Ágil (Scrum/Kanban)',
    hybrid: 'Híbrida',
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-slide-up">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/');
                }
              }} 
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">
                  {formData.clientName || 'Proposta'}
                </h1>
                {/* Author Badge - only visible to admins/gestores and for proposals not owned by current user */}
                {canViewAllProposals && !proposal.isOwner && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {proposal.authorName}
                  </Badge>
                )}
                {proposal.isOwner && canViewAllProposals && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Você
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {serviceLabels[formData.serviceType]} • {formatDuration(formData.estimatedDuration, formData.durationUnit)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ProposalVersionHistory 
              proposalId={proposal.id} 
              onRestoreVersion={(version) => setVersionToRestore(version)}
            />
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => navigate(
                hasMultipleServices 
                  ? `/proposta/${proposal.id}/editar-multi`
                  : `/proposta/${proposal.id}/editar`
              )}
            >
              <Pencil className="w-4 h-4" />
              Editar
            </Button>
            <Button
              variant="outline" 
              className="gap-2"
              onClick={() => duplicateProposal.mutate(proposal.id)}
            >
              <Copy className="w-4 h-4" />
              Duplicar
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Exportar PDF
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {hasMultipleServices && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => exportMultiServiceProposalToPDF(proposal, proposalServices, branding)}
                      className="font-medium"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      PDF Profissional (Completo)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => exportProposalToPDF(proposal, 'all', proposalServices.length > 1 ? proposalServices : undefined)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Exportar Tudo
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => exportSingleDocument(proposal, 'diagnostic', proposalServices.length > 1 ? proposalServices : undefined)}>
                  <Target className="w-4 h-4 mr-2" />
                  Diagnostico
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportSingleDocument(proposal, 'technical', proposalServices.length > 1 ? proposalServices : undefined)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Proposta Tecnica
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportSingleDocument(proposal, 'budget', proposalServices.length > 1 ? proposalServices : undefined)}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Proposta Orcamental
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={() => setShowEmailDialog(true)}
              className="gap-2"
            >
              <Mail className="w-4 h-4" />
              Enviar por Email
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-semibold text-foreground truncate">{formData.clientName}</p>
                {(formData.clientEmail || formData.clientPhone) && (
                  <div className="flex flex-col gap-0.5 mt-1">
                    {formData.clientEmail && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{formData.clientEmail}</span>
                      </p>
                    )}
                    {formData.clientPhone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        {formData.clientPhone}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duração</p>
                <p className="font-semibold text-foreground">{formatDuration(formData.estimatedDuration, formData.durationUnit)}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Equipa</p>
                <p className="font-semibold text-foreground">{pricing.teamMembers.length} perfis</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border gradient-brand text-primary-foreground lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-primary-foreground/80">Valor Total</p>
                <p className="font-bold text-lg">{formatCurrency(pricing.finalPrice)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Document Tabs */}
        <div className="bg-card rounded-xl border border-border overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 font-medium transition-colors relative',
                  activeTab === tab.id
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 gradient-brand" />
                )}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Diagnostic Document */}
            {activeTab === 'diagnostic' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Documento 1</p>
                    <h2 className="text-xl font-bold text-foreground">Diagnóstico de Necessidades</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-medium">{new Date().toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full gradient-brand text-primary-foreground text-sm flex items-center justify-center">1</span>
                    Contexto e Desafios
                  </h3>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <p className="text-foreground">
                      A <strong>{formData.clientName}</strong>, {formData.clientType === 'public' ? 'instituição pública' : formData.clientType === 'private' ? 'empresa privada' : formData.clientType === 'ngo' ? 'organização não-governamental' : 'startup'} do sector de {formData.sector}, 
                      procura apoio especializado em gestão de projectos para {formData.serviceType === 'pmo' ? 'implementar um escritório de projectos (PMO)' : formData.serviceType === 'restructuring' ? 'reestruturar os seus processos organizacionais' : formData.serviceType === 'monitoring' ? 'estabelecer um sistema de monitorização contínua' : formData.serviceType === 'training' ? 'capacitar a sua equipa' : formData.serviceType === 'audit' ? 'auditar os seus processos actuais' : 'definir a sua estratégia organizacional'}.
                    </p>
                    <p className="text-foreground">
                      O projecto envolve {formData.locations.length} localização(ões): <strong>{formData.locations.join(', ')}</strong>, 
                      com uma complexidade classificada como <strong>{complexityLabels[formData.complexity].toLowerCase()}</strong> e 
                      maturidade do cliente considerada <strong>{complexityLabels[formData.clientMaturity].toLowerCase()}</strong> em termos de gestão de projectos.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full gradient-brand text-primary-foreground text-sm flex items-center justify-center">2</span>
                    Objectivos do Projecto
                  </h3>
                  <ul className="space-y-2">
                    {[
                      `Implementar ${serviceLabels[formData.serviceType]} ao longo de ${formatDuration(formData.estimatedDuration, formData.durationUnit)}`,
                      `Garantir entregáveis de alta qualidade: ${formData.deliverables.join(', ')}`,
                      `Utilizar metodologia ${methodologyLabels[formData.methodology]}`,
                      formData.hasExistingTeam ? 'Trabalhar em colaboração com a equipa existente do cliente' : 'Fornecer equipa completa de consultoria',
                    ].map((objective, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full gradient-brand text-primary-foreground text-sm flex items-center justify-center">3</span>
                    Tipo de Apoio Necessário
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Equipa Alocada</p>
                      <p className="font-semibold text-foreground">{pricing.teamMembers.length} profissionais</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Total de Horas</p>
                      <p className="font-semibold text-foreground">{formatNumber(pricing.totalHours)} horas</p>
                    </div>
                  </div>
                </section>

                {/* Multi-service details */}
                {hasMultipleServices && (
                  <section>
                    <ProposalServicesView services={proposalServices} />
                  </section>
                )}

                {/* Sector-specific details (only for single-service proposals) */}
                {!hasMultipleServices && category !== 'consulting' && (
                  <section>
                    <SectorDetailsView formData={formData} />
                  </section>
                )}
              </div>
            )}

            {/* Technical Proposal */}
            {activeTab === 'technical' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Documento 2</p>
                    <h2 className="text-xl font-bold text-foreground">Proposta Técnica</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Referência</p>
                    <p className="font-medium">PT-{proposal.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>

                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Escopo Detalhado</h3>
                  <p className="text-foreground bg-muted/50 rounded-lg p-4">
                    {serviceLabels[formData.serviceType]} para {formData.clientName}, abrangendo {formData.locations.join(', ')}, 
                    com duração de {formatDuration(formData.estimatedDuration, formData.durationUnit)} e metodologia {methodologyLabels[formData.methodology].toLowerCase()}.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Metodologia</h3>
                  <div className={cn(
                    'rounded-lg p-4 border-l-4',
                    formData.methodology === 'traditional' ? 'bg-blue-50 border-blue-500' :
                    formData.methodology === 'agile' ? 'bg-green-50 border-green-500' :
                    'bg-amber-50 border-amber-500'
                  )}>
                    <p className="font-semibold text-foreground">{methodologyLabels[formData.methodology]}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.methodology === 'traditional' && 'Abordagem sequencial com fases bem definidas, ideal para projectos com escopo estável.'}
                      {formData.methodology === 'agile' && 'Abordagem iterativa com entregas incrementais, ideal para projectos com requisitos evolutivos.'}
                      {formData.methodology === 'hybrid' && 'Combinação de métodos tradicionais para planeamento macro e ágeis para execução, oferecendo flexibilidade.'}
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Entregáveis por Fase</h3>
                  <div className="grid gap-3">
                    {[
                      { phase: 'Fase 1 - Diagnóstico', items: ['Análise de situação actual', 'Identificação de gaps', 'Relatório de diagnóstico'] },
                      { phase: 'Fase 2 - Planeamento', items: ['Plano de projecto detalhado', 'Cronograma', 'Matriz RACI'] },
                      { phase: 'Fase 3 - Implementação', items: formData.deliverables.map(d => {
                        const labels: Record<string, string> = {
                          reports: 'Relatórios de progresso',
                          dashboards: 'Dashboards de acompanhamento',
                          kpis: 'Sistema de KPIs',
                          schedules: 'Cronogramas actualizados',
                          training: 'Sessões de formação',
                          documentation: 'Documentação de processos',
                        };
                        return labels[d] || d;
                      }) },
                      { phase: 'Fase 4 - Encerramento', items: ['Relatório final', 'Lições aprendidas', 'Transferência de conhecimento'] },
                    ].map((phase) => (
                      <div key={phase.phase} className="bg-muted/30 rounded-lg p-4">
                        <p className="font-semibold text-foreground mb-2">{phase.phase}</p>
                        <ul className="space-y-1">
                          {phase.items.map((item, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Equipa Alocada</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Perfil</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Dedicação</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Horas/Mês</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pricing.teamMembers.map((member, index) => (
                          <tr key={index} className="border-b border-border">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Users className="w-4 h-4 text-primary" />
                                </div>
                                <span className="font-medium text-foreground">{member.role}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {member.dedication}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center text-foreground">
                              {formatNumber(member.hoursPerMonth)}h
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}

            {/* Budget Proposal */}
            {activeTab === 'budget' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Documento 3</p>
                    <h2 className="text-xl font-bold text-foreground">Proposta Orçamental</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Válido até</p>
                    <p className="font-medium">
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Detalhe de Custos por Perfil</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Perfil</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Valor/Hora</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Horas Totais</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pricing.teamMembers.map((member, index) => {
                          const totalHours = member.hoursPerMonth * formData.estimatedDuration;
                          const subtotal = member.hourlyRate * totalHours;
                          return (
                            <tr key={index} className="border-b border-border">
                              <td className="py-3 px-4 font-medium text-foreground">{member.role}</td>
                              <td className="py-3 px-4 text-center text-muted-foreground">
                                {formatCurrency(member.hourlyRate)}
                              </td>
                              <td className="py-3 px-4 text-center text-muted-foreground">
                                {formatNumber(totalHours)}h
                              </td>
                              <td className="py-3 px-4 text-right font-medium text-foreground">
                                {formatCurrency(subtotal)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Resumo Financeiro</h3>
                  <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Custo Base</span>
                      <span className="font-medium text-foreground">{formatCurrency(pricing.baseCost)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">
                        Multiplicador de Complexidade ({complexityLabels[formData.complexity]})
                      </span>
                      <span className="font-medium text-foreground">×{pricing.complexityMultiplier}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-t border-border pt-4">
                      <span className="text-muted-foreground">Custo Ajustado</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(pricing.baseCost * pricing.complexityMultiplier)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Overhead (15%)</span>
                      <span className="font-medium text-foreground">{formatCurrency(pricing.overhead)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Margem Nodix (25%)</span>
                      <span className="font-medium text-foreground">{formatCurrency(pricing.margin)}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-t-2 border-primary">
                      <span className="text-lg font-bold text-foreground">VALOR TOTAL</span>
                      <span className="text-2xl font-bold text-primary">{formatCurrency(pricing.finalPrice)}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Modelo de Pagamento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { phase: 'Assinatura', percent: 20 },
                      { phase: 'Fase 1-2', percent: 30 },
                      { phase: 'Fase 3', percent: 30 },
                      { phase: 'Encerramento', percent: 20 },
                    ].map((payment, index) => (
                      <div key={index} className="bg-muted/50 rounded-lg p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-1">{payment.phase}</p>
                        <p className="text-lg font-bold text-foreground">{payment.percent}%</p>
                        <p className="text-sm text-primary font-medium">
                          {formatCurrency(pricing.finalPrice * (payment.percent / 100))}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Parâmetros de Precificação Utilizados
                    {savedPricingParams && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
                        Guardados com a proposta
                      </span>
                    )}
                  </h3>
                  <div className="bg-muted/30 rounded-xl p-6 space-y-6">
                    {/* Hourly Rates */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Taxas Horárias</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="bg-background rounded-lg p-3 border border-border">
                          <p className="text-xs text-muted-foreground">Gestor Sénior</p>
                          <p className="font-semibold text-foreground">{formatCurrency(displayPricingParams.rateSeniorManager)}/h</p>
                        </div>
                        <div className="bg-background rounded-lg p-3 border border-border">
                          <p className="text-xs text-muted-foreground">Consultor</p>
                          <p className="font-semibold text-foreground">{formatCurrency(displayPricingParams.rateConsultant)}/h</p>
                        </div>
                        <div className="bg-background rounded-lg p-3 border border-border">
                          <p className="text-xs text-muted-foreground">Analista</p>
                          <p className="font-semibold text-foreground">{formatCurrency(displayPricingParams.rateAnalyst)}/h</p>
                        </div>
                        <div className="bg-background rounded-lg p-3 border border-border">
                          <p className="text-xs text-muted-foreground">Coordenador</p>
                          <p className="font-semibold text-foreground">{formatCurrency(displayPricingParams.rateCoordinator)}/h</p>
                        </div>
                        <div className="bg-background rounded-lg p-3 border border-border">
                          <p className="text-xs text-muted-foreground">Formador</p>
                          <p className="font-semibold text-foreground">{formatCurrency(displayPricingParams.rateTrainer)}/h</p>
                        </div>
                      </div>
                    </div>

                    {/* Complexity Multipliers */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Multiplicadores de Complexidade</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-background rounded-lg p-3 border border-border">
                          <p className="text-xs text-muted-foreground">Baixa</p>
                          <p className="font-semibold text-foreground">×{displayPricingParams.multiplierLow}</p>
                        </div>
                        <div className="bg-background rounded-lg p-3 border border-border">
                          <p className="text-xs text-muted-foreground">Média</p>
                          <p className="font-semibold text-foreground">×{displayPricingParams.multiplierMedium}</p>
                        </div>
                        <div className="bg-background rounded-lg p-3 border border-border">
                          <p className="text-xs text-muted-foreground">Alta</p>
                          <p className="font-semibold text-foreground">×{displayPricingParams.multiplierHigh}</p>
                        </div>
                      </div>
                    </div>

                    {/* Percentages */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Percentagens</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-background rounded-lg p-3 border border-border">
                          <p className="text-xs text-muted-foreground">Overhead</p>
                          <p className="font-semibold text-foreground">{(displayPricingParams.overheadPercentage * 100).toFixed(0)}%</p>
                        </div>
                        <div className="bg-background rounded-lg p-3 border border-border">
                          <p className="text-xs text-muted-foreground">Margem</p>
                          <p className="font-semibold text-foreground">{(displayPricingParams.marginPercentage * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Restore Version Confirmation Dialog */}
      <AlertDialog open={!!versionToRestore} onOpenChange={(open) => !open && setVersionToRestore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar versão {versionToRestore?.version_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá substituir os dados actuais da proposta pelos dados da versão {versionToRestore?.version_number}. 
              A versão actual será guardada no histórico antes do restauro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (versionToRestore) {
                  restoreVersion.mutate(versionToRestore);
                  setVersionToRestore(null);
                }
              }}
            >
              Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Enviar Proposta por Email</DialogTitle>
            <DialogDescription>
              Envie a proposta diretamente para o email do cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Email do Cliente *</Label>
              <Input
                id="clientEmail"
                type="email"
                placeholder="cliente@empresa.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customMessage">Mensagem Personalizada (opcional)</Label>
              <Textarea
                id="customMessage"
                placeholder="Adicione uma mensagem personalizada para o cliente..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
              />
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">Resumo da Proposta</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Cliente:</strong> {formData.clientName}</p>
                <p><strong>Serviço:</strong> {serviceLabels[formData.serviceType]}</p>
                <p><strong>Valor:</strong> {formatCurrency(pricing.finalPrice)}</p>
                <p><strong>Duração:</strong> {formData.estimatedDuration} meses</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendEmail} disabled={isSendingEmail} className="gap-2">
              {isSendingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  A enviar...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Proposta
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
