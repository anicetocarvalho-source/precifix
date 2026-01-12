import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Proposal, ProposalStatus } from '@/types/proposal';
import { formatCurrency } from '@/lib/pricing';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { pt } from 'date-fns/locale';

interface DashboardChartsProps {
  proposals: Proposal[];
}

const CHART_COLORS = {
  primary: 'hsl(24, 91%, 54%)', // Orange #F37021
  primaryLight: 'hsl(24, 91%, 70%)',
  success: 'hsl(142, 71%, 45%)',
  warning: 'hsl(38, 92%, 50%)',
  info: 'hsl(199, 89%, 48%)',
  muted: 'hsl(215, 16%, 47%)',
  destructive: 'hsl(0, 84%, 60%)',
};

const STATUS_COLORS: Record<ProposalStatus, string> = {
  draft: CHART_COLORS.muted,
  pending: CHART_COLORS.warning,
  sent: CHART_COLORS.info,
  approved: CHART_COLORS.success,
  rejected: CHART_COLORS.destructive,
};

const STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: 'Rascunho',
  pending: 'Pendente',
  sent: 'Enviada',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
};

export function DashboardCharts({ proposals }: DashboardChartsProps) {
  // Generate monthly data for the last 6 months
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      
      const monthProposals = proposals.filter(p => 
        isWithinInterval(new Date(p.createdAt), { start, end })
      );
      
      const totalValue = monthProposals.reduce((sum, p) => sum + p.pricing.finalPrice, 0);
      const approvedCount = monthProposals.filter(p => p.status === 'approved').length;
      const rejectedCount = monthProposals.filter(p => p.status === 'rejected').length;
      const conversionRate = monthProposals.length > 0 
        ? Math.round((approvedCount / monthProposals.length) * 100)
        : 0;
      
      months.push({
        month: format(date, 'MMM', { locale: pt }),
        fullMonth: format(date, 'MMMM yyyy', { locale: pt }),
        propostas: monthProposals.length,
        valor: totalValue,
        aprovadas: approvedCount,
        rejeitadas: rejectedCount,
        conversao: conversionRate,
      });
    }
    return months;
  }, [proposals]);

  // Status distribution data
  const statusData = useMemo(() => {
    const statusCounts: Record<ProposalStatus, number> = {
      draft: 0,
      pending: 0,
      sent: 0,
      approved: 0,
      rejected: 0,
    };
    
    proposals.forEach(p => {
      statusCounts[p.status]++;
    });
    
    return Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: STATUS_LABELS[status as ProposalStatus],
        value: count,
        color: STATUS_COLORS[status as ProposalStatus],
      }));
  }, [proposals]);

  // Custom tooltip for value chart
  const ValueTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground capitalize">{payload[0]?.payload?.fullMonth}</p>
          <p className="text-sm text-muted-foreground">
            Valor: <span className="font-semibold text-primary">{formatCurrency(payload[0]?.value || 0)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for proposals chart
  const ProposalsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground capitalize">{payload[0]?.payload?.fullMonth}</p>
          <p className="text-sm text-muted-foreground">
            Propostas: <span className="font-semibold text-primary">{payload[0]?.value}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Aprovadas: <span className="font-semibold text-success">{payload[0]?.payload?.aprovadas}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for conversion chart
  const ConversionTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground capitalize">{payload[0]?.payload?.fullMonth}</p>
          <p className="text-sm text-muted-foreground">
            Taxa de conversão: <span className="font-semibold text-primary">{payload[0]?.value}%</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Aprovadas: <span className="text-success">{payload[0]?.payload?.aprovadas}</span> | 
            Rejeitadas: <span className="text-destructive"> {payload[0]?.payload?.rejeitadas}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
      {/* Monthly Value Chart */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Valor Mensal de Propostas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs fill-muted-foreground"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<ValueTooltip />} />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Proposals Evolution Chart */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Evolução de Propostas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs fill-muted-foreground"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs fill-muted-foreground"
                />
                <Tooltip content={<ProposalsTooltip />} />
                <Bar 
                  dataKey="propostas" 
                  fill={CHART_COLORS.primary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rate Chart */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Taxa de Conversão (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConversao" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs fill-muted-foreground"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs fill-muted-foreground"
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<ConversionTooltip />} />
                <Area
                  type="monotone"
                  dataKey="conversao"
                  stroke={CHART_COLORS.success}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorConversao)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution Chart */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Distribuição por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [value, name]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend 
                    verticalAlign="middle" 
                    align="right"
                    layout="vertical"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-sm text-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full text-center text-muted-foreground">
                Sem dados para exibir
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
