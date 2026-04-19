import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  ArrowRight,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSubscription, PLANS, SubscriptionPlan } from '@/hooks/useSubscription';
import { format, formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatAOA = (amount: number) =>
  new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
  }).format(amount);

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text).then(() => toast.success(`${label} copiado!`));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ReferenceCard({
  entity,
  reference,
  amountAoa,
  expiresAt,
}: {
  entity: string;
  reference: string;
  amountAoa: number;
  expiresAt: string;
}) {
  const expiryDate = new Date(expiresAt);
  const isExpiringSoon = expiryDate.getTime() - Date.now() < 24 * 60 * 60 * 1000;

  return (
    <Card className="border-2 border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Referência Multibanco BFA
          </CardTitle>
          <Badge variant={isExpiringSoon ? 'destructive' : 'secondary'}>
            <Clock className="w-3 h-3 mr-1" />
            {isExpiringSoon
              ? 'Expira em breve'
              : `Válida até ${format(expiryDate, 'dd/MM', { locale: pt })}`}
          </Badge>
        </div>
        <CardDescription>
          Expira {formatDistanceToNow(expiryDate, { addSuffix: true, locale: pt })}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Entidade */}
          <div className="bg-background rounded-lg p-3 border">
            <p className="text-xs text-muted-foreground mb-1">Entidade</p>
            <div className="flex items-center justify-between">
              <span className="text-xl font-mono font-bold tracking-widest">{entity}</span>
              <button
                onClick={() => copyToClipboard(entity, 'Entidade')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Referência */}
          <div className="bg-background rounded-lg p-3 border sm:col-span-1">
            <p className="text-xs text-muted-foreground mb-1">Referência</p>
            <div className="flex items-center justify-between">
              <span className="text-xl font-mono font-bold tracking-widest">{reference}</span>
              <button
                onClick={() => copyToClipboard(reference, 'Referência')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Valor */}
          <div className="bg-background rounded-lg p-3 border">
            <p className="text-xs text-muted-foreground mb-1">Valor</p>
            <span className="text-xl font-bold text-primary">{formatAOA(amountAoa)}</span>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-200">
          Confirma sempre que o valor apresentado no ATM ou Internet Banking corresponde a{' '}
          <strong>{formatAOA(amountAoa)}</strong> antes de confirmar o pagamento.
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentSteps() {
  const steps = [
    { n: '1', title: 'Acede ao ATM ou Internet Banking do BFA', desc: 'Selecciona "Pagamentos e Transferências" → "Pagamento de Serviços".' },
    { n: '2', title: 'Insere a Entidade e a Referência', desc: 'Digita os números acima exactamente como aparecem, sem espaços.' },
    { n: '3', title: 'Confirma o valor', desc: 'Verifica que o valor apresentado corresponde ao indicado. Confirma o pagamento.' },
    { n: '4', title: 'Aguarda a activação automática', desc: 'Após confirmação pelo BFA, a tua conta é activada automaticamente em menos de 1 hora.' },
  ];

  return (
    <div className="space-y-3">
      {steps.map((s) => (
        <div key={s.n} className="flex gap-3">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            {s.n}
          </div>
          <div>
            <p className="font-medium text-sm">{s.title}</p>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PlanSelector({
  selected,
  onChange,
}: {
  selected: Exclude<SubscriptionPlan, 'free'>;
  onChange: (p: Exclude<SubscriptionPlan, 'free'>) => void;
}) {
  const options = (['starter', 'pro', 'enterprise'] as const).map((id) => ({
    id,
    ...PLANS[id],
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {options.map((plan) => (
        <button
          key={plan.id}
          onClick={() => onChange(plan.id)}
          className={`rounded-xl border-2 p-4 text-left transition-all ${
            selected === plan.id
              ? 'border-primary bg-primary/5 shadow-md'
              : 'border-border hover:border-primary/40 hover:bg-muted/40'
          }`}
        >
          <p className="font-semibold">{plan.name}</p>
          <p className="text-primary font-bold mt-1">{formatAOA(plan.priceAoa)}<span className="text-muted-foreground font-normal text-xs">/mês</span></p>
          <ul className="mt-2 space-y-1">
            {plan.features.slice(0, 3).map((f) => (
              <li key={f} className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </button>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PagamentoPendente() {
  const navigate = useNavigate();
  const { subscription, pendingPayment, isLoading, generateReference, refetch } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<Exclude<SubscriptionPlan, 'free'>>('starter');

  const statusConfig: Record<string, { label: string; icon: typeof AlertCircle; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    trialing:  { label: 'Trial expirado', icon: Clock,        variant: 'secondary'   },
    past_due:  { label: 'Pagamento em atraso', icon: AlertCircle, variant: 'destructive' },
    unpaid:    { label: 'Pagamento em falta',  icon: AlertCircle, variant: 'destructive' },
    canceled:  { label: 'Subscrição cancelada', icon: AlertCircle, variant: 'destructive' },
  };

  const currentStatus = subscription?.status ?? 'unpaid';
  const config = statusConfig[currentStatus] ?? statusConfig.unpaid;
  const StatusIcon = config.icon;

  function handleGenerate() {
    generateReference.mutate(selectedPlan, {
      onSuccess: () => refetch(),
    });
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-12 flex justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Activar Subscrição</h1>
          </div>
          <p className="text-muted-foreground">
            Completa o pagamento por referência bancária para continuar a usar o PRECIFIX.
          </p>
        </div>

        {/* Status banner */}
        <div className={`flex items-center gap-3 rounded-lg px-4 py-3 border ${
          config.variant === 'destructive'
            ? 'bg-destructive/10 border-destructive/30 text-destructive'
            : 'bg-muted border-border text-muted-foreground'
        }`}>
          <StatusIcon className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{config.label}</span>
        </div>

        {/* Se já existe referência pendente válida */}
        {pendingPayment?.bfaReference && pendingPayment.bfaEntity && pendingPayment.expiresAt ? (
          <div className="space-y-6">
            <ReferenceCard
              entity={pendingPayment.bfaEntity}
              reference={pendingPayment.bfaReference}
              amountAoa={pendingPayment.amountAoa}
              expiresAt={pendingPayment.expiresAt}
            />

            <Separator />

            <div>
              <h2 className="font-semibold mb-3">Como pagar</h2>
              <PaymentSteps />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => refetch()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Verificar pagamento
              </Button>
              <Button
                className="flex-1"
                onClick={() => navigate('/')}
              >
                Voltar ao início
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          /* Sem referência pendente — mostrar selector de plano */
          <div className="space-y-6">
            <div>
              <h2 className="font-semibold mb-1">Escolhe o teu plano</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Será gerada uma referência multibanco BFA para pagamento mensal.
              </p>
              <PlanSelector selected={selectedPlan} onChange={setSelectedPlan} />
            </div>

            <Separator />

            <div>
              <h2 className="font-semibold mb-3">Como funciona</h2>
              <PaymentSteps />
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleGenerate}
              disabled={generateReference.isPending}
            >
              {generateReference.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              Gerar referência para {PLANS[selectedPlan].name} — {formatAOA(PLANS[selectedPlan].priceAoa)}/mês
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
