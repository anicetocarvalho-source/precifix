import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  CalendarDays,
} from 'lucide-react';
import { useSubscription, PLANS, SubscriptionPlan, SubscriptionStatus } from '@/hooks/useSubscription';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatAOA = (amount: number) =>
  new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = (iso: string | null) =>
  iso ? format(new Date(iso), "d 'de' MMMM 'de' yyyy", { locale: pt }) : '—';

const STATUS_CONFIG: Record<SubscriptionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  trialing:  { label: 'Trial',           variant: 'secondary'   },
  active:    { label: 'Activa',          variant: 'default'     },
  past_due:  { label: 'Pagamento em atraso', variant: 'destructive' },
  canceled:  { label: 'Cancelada',       variant: 'outline'     },
  unpaid:    { label: 'Não paga',        variant: 'destructive' },
};

const PAYMENT_STATUS_CONFIG = {
  pending:   { label: 'Pendente',    color: 'text-amber-600'  },
  confirmed: { label: 'Confirmado',  color: 'text-green-600'  },
  failed:    { label: 'Falhado',     color: 'text-destructive' },
  expired:   { label: 'Expirado',    color: 'text-muted-foreground' },
};

// ─── Plan cards (upgrade) ─────────────────────────────────────────────────────

function PlanCard({
  planId,
  current,
  onSelect,
  isLoading,
}: {
  planId: Exclude<SubscriptionPlan, 'free'>;
  current: boolean;
  onSelect: () => void;
  isLoading: boolean;
}) {
  const plan = PLANS[planId];
  return (
    <div className={`rounded-xl border-2 p-4 flex flex-col gap-3 transition-all ${
      current ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
    }`}>
      <div className="flex items-center justify-between">
        <p className="font-semibold">{plan.name}</p>
        {current && <Badge>Actual</Badge>}
      </div>
      <p className="text-2xl font-bold text-primary">
        {formatAOA(plan.priceAoa)}
        <span className="text-muted-foreground text-sm font-normal">/mês</span>
      </p>
      <ul className="space-y-1 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      {!current && (
        <Button
          size="sm"
          variant="outline"
          className="w-full mt-1"
          onClick={onSelect}
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <ArrowUpRight className="w-3.5 h-3.5 mr-1.5" />
          )}
          Subscrever
        </Button>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BillingSettings() {
  const { subscription, payments, pendingPayment, isLoading, daysLeft, generateReference, refetch } =
    useSubscription();

  const [generatingFor, setGeneratingFor] = useState<SubscriptionPlan | null>(null);

  function handleSubscribe(plan: Exclude<SubscriptionPlan, 'free'>) {
    setGeneratingFor(plan);
    generateReference.mutate(plan, {
      onSuccess: () => {
        refetch();
        setGeneratingFor(null);
      },
      onError: () => setGeneratingFor(null),
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
        <AlertCircle className="w-8 h-8" />
        <p>Subscrição não encontrada.</p>
      </div>
    );
  }

  const statusConf = STATUS_CONFIG[subscription.status];
  const planInfo   = PLANS[subscription.plan];

  return (
    <div className="space-y-8">

      {/* ── Subscrição actual ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Subscrição actual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-2xl font-bold">{planInfo.name}</span>
            <Badge variant={statusConf.variant}>{statusConf.label}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {subscription.status === 'trialing' && subscription.trialEndsAt && (
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Trial termina em
                </p>
                <p className="font-medium">
                  {formatDate(subscription.trialEndsAt)}
                  {daysLeft !== null && (
                    <span className="text-muted-foreground ml-1">({daysLeft} dias)</span>
                  )}
                </p>
              </div>
            )}

            {subscription.status === 'active' && (
              <>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" /> Início do período
                  </p>
                  <p className="font-medium">{formatDate(subscription.currentPeriodStart)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" /> Próxima renovação
                  </p>
                  <p className="font-medium">
                    {formatDate(subscription.currentPeriodEnd)}
                    {daysLeft !== null && (
                      <span className="text-muted-foreground ml-1">({daysLeft} dias)</span>
                    )}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Referência pendente em aberto */}
          {pendingPayment?.bfaReference && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-3 text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-300 mb-1">
                Referência de pagamento activa
              </p>
              <div className="font-mono text-amber-900 dark:text-amber-200 space-y-0.5">
                <p>Entidade: <strong>{pendingPayment.bfaEntity}</strong></p>
                <p>Referência: <strong>{pendingPayment.bfaReference}</strong></p>
                <p>Valor: <strong>{formatAOA(pendingPayment.amountAoa)}</strong></p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* ── Planos disponíveis ── */}
      <div>
        <h3 className="font-semibold mb-1">Planos disponíveis</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Ao clicar em "Subscrever" é gerada uma referência multibanco BFA para pagamento.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['starter', 'pro', 'enterprise'] as const).map((planId) => (
            <PlanCard
              key={planId}
              planId={planId}
              current={subscription.plan === planId && subscription.status === 'active'}
              onSelect={() => handleSubscribe(planId)}
              isLoading={generatingFor === planId && generateReference.isPending}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* ── Histórico de pagamentos ── */}
      <div>
        <h3 className="font-semibold mb-4">Histórico de pagamentos</h3>

        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ainda não há pagamentos registados.</p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Referência</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => {
                  const sc = PAYMENT_STATUS_CONFIG[p.status];
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(p.createdAt), 'dd/MM/yyyy', { locale: pt })}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {p.bfaReference ?? '—'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatAOA(p.amountAoa)}
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-medium ${sc.color}`}>
                          {sc.label}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
