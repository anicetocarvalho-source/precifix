import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProposals } from '@/hooks/useProposals';
import { useUserRole } from '@/hooks/useUserRole';
import { formatCurrency } from '@/lib/pricing';
import {
  Plus,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Building,
  ArrowUpRight,
  BarChart3,
  User,
  Layers,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProposalStatus } from '@/types/proposal';
import { DashboardCharts } from '@/components/DashboardCharts';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { DashboardStatsSkeleton, DashboardTableSkeleton } from '@/components/skeletons/DashboardSkeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const statusConfig: Record<ProposalStatus, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-muted text-muted-foreground' },
  pending: { label: 'Pendente', color: 'bg-warning/10 text-warning' },
  sent: { label: 'Enviada', color: 'bg-info/10 text-info' },
  approved: { label: 'Aprovada', color: 'bg-success/10 text-success' },
  rejected: { label: 'Rejeitada', color: 'bg-destructive/10 text-destructive' },
};

export default function Dashboard() {
  const { proposals, isLoading } = useProposals();
  const { canViewAllProposals } = useUserRole();
  const [showCharts, setShowCharts] = useState(true);

  const stats = [
    {
      label: 'Propostas este mês',
      value: proposals.length,
      icon: FileText,
      change: '+12%',
      changeType: 'positive',
    },
    {
      label: 'Valor total',
      value: formatCurrency(proposals.reduce((sum, p) => sum + p.pricing.finalPrice, 0)),
      icon: TrendingUp,
      change: '+8%',
      changeType: 'positive',
    },
    {
      label: 'Taxa de aprovação',
      value: proposals.length > 0 
        ? `${Math.round((proposals.filter(p => p.status === 'approved').length / proposals.length) * 100)}%`
        : '0%',
      icon: CheckCircle,
      change: '+5%',
      changeType: 'positive',
    },
    {
      label: 'Tempo médio',
      value: '2.4 dias',
      icon: Clock,
      change: '-15%',
      changeType: 'positive',
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              A inteligência por trás das tuas propostas
            </h1>
            <p className="text-muted-foreground mt-1">
              Crie cotações precisas e documentos profissionais em minutos
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={() => setShowCharts(!showCharts)}
            >
              <BarChart3 className="w-5 h-5" />
              {showCharts ? 'Ocultar Gráficos' : 'Ver Gráficos'}
            </Button>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/orcamento-rapido">
                    <Button variant="ghost" size="lg" className="gap-2">
                      <Zap className="w-5 h-5" />
                      Orçamento Rápido
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs p-3">
                  <p className="font-medium mb-1">Orçamento Rápido</p>
                  <p className="text-xs text-muted-foreground">
                    Para cotações instantâneas sem detalhes técnicos. 
                    Apenas cliente, serviço e valor — pronto em segundos.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/nova-proposta">
                    <Button variant="outline" size="lg" className="gap-2">
                      <Plus className="w-5 h-5" />
                      Nova Cotação
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs p-3">
                  <p className="font-medium mb-1">Cotação Simples (Diagnóstico)</p>
                  <p className="text-xs text-muted-foreground">
                    Ideal para orçamentos rápidos de um único serviço. 
                    Responda algumas perguntas e obtenha uma cotação precisa em minutos.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/nova-proposta-multi">
                    <Button size="lg" className="gap-2">
                      <Layers className="w-5 h-5" />
                      Proposta Multi-Serviços
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs p-3">
                  <p className="font-medium mb-1">Proposta Técnica Completa</p>
                  <p className="text-xs text-muted-foreground">
                    Crie propostas profissionais com múltiplos serviços independentes, 
                    preços detalhados e documentação completa para projectos complexos.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Stats */}
        {isLoading ? (
          <DashboardStatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="bg-card rounded-xl p-5 border border-border shadow-card card-hover"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-1 rounded-full',
                      stat.changeType === 'positive'
                        ? 'bg-success/10 text-success'
                        : 'bg-destructive/10 text-destructive'
                    )}
                  >
                    {stat.change}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Charts Section */}
        {showCharts && proposals.length > 0 && (
          <DashboardCharts proposals={proposals} />
        )}

        {/* Proposals Table */}
        {isLoading ? (
          <DashboardTableSkeleton />
        ) : (
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Propostas Recentes</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar propostas..."
                    className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64"
                  />
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros
                </Button>
              </div>
            </div>

            {proposals.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma proposta ainda
              </h3>
              <p className="text-muted-foreground mb-6">
                Comece criando a sua primeira cotação inteligente
              </p>
              <Link to="/nova-proposta">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Criar Primeira Proposta
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {proposals.map((proposal) => (
                <Link
                  key={proposal.id}
                  to={`/proposta/${proposal.id}`}
                  className="flex items-center justify-between p-5 hover:bg-muted/50 transition-colors group"
                >
                    <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      {proposal.servicesCount > 1 ? (
                        <Layers className="w-5 h-5 text-primary" />
                      ) : (
                        <Building className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {proposal.formData.clientName || 'Cliente sem nome'}
                        </h3>
                        {proposal.servicesCount > 1 && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Layers className="w-3 h-3" />
                            {proposal.servicesCount} serviços
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {proposal.servicesCount > 1 ? (
                          'Multi-serviços'
                        ) : (
                          <>
                            {proposal.formData.serviceType === 'pmo' && 'PMO'}
                            {proposal.formData.serviceType === 'restructuring' && 'Reestruturação'}
                            {proposal.formData.serviceType === 'monitoring' && 'Acompanhamento'}
                            {proposal.formData.serviceType === 'training' && 'Formação'}
                            {proposal.formData.serviceType === 'audit' && 'Auditoria'}
                            {proposal.formData.serviceType === 'strategy' && 'Estratégia'}
                          </>
                        )}
                        {' • '}
                        {proposal.formData.estimatedDuration} meses
                      </p>
                      {/* Author indicator for admins/gestores */}
                      {canViewAllProposals && !proposal.isOwner && (
                        <div className="flex items-center gap-1 mt-1">
                          <User className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            por {proposal.authorName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {formatCurrency(proposal.pricing.finalPrice)}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(proposal.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        statusConfig[proposal.status].color
                      )}
                    >
                      {statusConfig[proposal.status].label}
                    </span>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
