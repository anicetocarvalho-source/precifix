import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProposals } from '@/hooks/useProposals';
import { useUserRole } from '@/hooks/useUserRole';
import { formatCurrency } from '@/lib/pricing';
import { getServiceLabel } from '@/lib/serviceLabels';
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
import { DashboardCharts } from '@/components/DashboardCharts';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo } from 'react';
import { DashboardStatsSkeleton, DashboardTableSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { STATUS_CONFIG, formatDuration } from '@/lib/statusLabels';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { startOfMonth, endOfMonth, subMonths, isWithinInterval, differenceInDays } from 'date-fns';

export default function Dashboard() {
  const { proposals, isLoading } = useProposals();
  const { canViewAllProposals } = useUserRole();
  const [showCharts, setShowCharts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter proposals by search
  const filteredProposals = useMemo(() => {
    if (!searchTerm.trim()) return proposals;
    const term = searchTerm.toLowerCase();
    return proposals.filter(p =>
      p.formData.clientName.toLowerCase().includes(term) ||
      getServiceLabel(p.formData.serviceType).toLowerCase().includes(term)
    );
  }, [proposals, searchTerm]);

  // Dynamic stats calculation
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const thisMonthProposals = proposals.filter(p =>
      isWithinInterval(new Date(p.createdAt), { start: thisMonthStart, end: thisMonthEnd })
    );
    const lastMonthProposals = proposals.filter(p =>
      isWithinInterval(new Date(p.createdAt), { start: lastMonthStart, end: lastMonthEnd })
    );

    // Count change
    const countChange = lastMonthProposals.length > 0
      ? Math.round(((thisMonthProposals.length - lastMonthProposals.length) / lastMonthProposals.length) * 100)
      : thisMonthProposals.length > 0 ? 100 : 0;

    // Value change
    const thisMonthValue = thisMonthProposals.reduce((sum, p) => sum + p.pricing.finalPrice, 0);
    const lastMonthValue = lastMonthProposals.reduce((sum, p) => sum + p.pricing.finalPrice, 0);
    const valueChange = lastMonthValue > 0
      ? Math.round(((thisMonthValue - lastMonthValue) / lastMonthValue) * 100)
      : thisMonthValue > 0 ? 100 : 0;

    // Approval rate (only finalized)
    const finalized = proposals.filter(p => p.status === 'approved' || p.status === 'rejected');
    const approved = proposals.filter(p => p.status === 'approved').length;
    const approvalRate = finalized.length > 0 ? Math.round((approved / finalized.length) * 100) : null;

    const lastMonthFinalized = lastMonthProposals.filter(p => p.status === 'approved' || p.status === 'rejected');
    const lastMonthApproved = lastMonthProposals.filter(p => p.status === 'approved').length;
    const lastApprovalRate = lastMonthFinalized.length > 0 ? Math.round((lastMonthApproved / lastMonthFinalized.length) * 100) : null;
    const approvalChange = approvalRate !== null && lastApprovalRate !== null
      ? approvalRate - lastApprovalRate
      : 0;

    // Average time from creation to approval
    const approvedProposals = proposals.filter(p => p.status === 'approved' || p.status === 'sent');
    let avgDays = 0;
    if (approvedProposals.length > 0) {
      const totalDays = approvedProposals.reduce((sum, p) => {
        return sum + differenceInDays(new Date(p.updatedAt), new Date(p.createdAt));
      }, 0);
      avgDays = Math.round((totalDays / approvedProposals.length) * 10) / 10;
    }

    const formatChange = (val: number) => val >= 0 ? `+${val}%` : `${val}%`;

    return [
      {
        label: 'Propostas este mês',
        value: thisMonthProposals.length,
        icon: FileText,
        change: formatChange(countChange),
        changeType: countChange >= 0 ? 'positive' : 'negative',
      },
      {
        label: 'Valor total (mês)',
        value: formatCurrency(thisMonthValue),
        icon: TrendingUp,
        change: formatChange(valueChange),
        changeType: valueChange >= 0 ? 'positive' : 'negative',
      },
      {
        label: 'Taxa de aprovação',
        value: approvalRate !== null ? `${approvalRate}%` : 'N/A',
        icon: CheckCircle,
        change: formatChange(approvalChange),
        changeType: approvalChange >= 0 ? 'positive' : 'negative',
      },
      {
        label: 'Tempo médio',
        value: avgDays > 0 ? `${avgDays} dias` : 'N/A',
        icon: Clock,
        change: '',
        changeType: 'positive' as const,
      },
    ];
  }, [proposals]);

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
                    {stat.change || '—'}
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64"
                  />
                </div>
              </div>
            </div>

            {filteredProposals.length === 0 ? (
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
              {filteredProposals.map((proposal) => (
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
                          getServiceLabel(proposal.formData.serviceType)
                        )}
                        {' • '}
                        {formatDuration(proposal.formData.estimatedDuration, proposal.formData.durationUnit)}
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
                        STATUS_CONFIG[proposal.status].color
                      )}
                    >
                      {STATUS_CONFIG[proposal.status].label}
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
