import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ─── Domain types ─────────────────────────────────────────────────────────────

export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'expired';

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  trialEndsAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  bfaReference: string | null;
  bfaEntity: string | null;
  amountAoa: number;
  status: PaymentStatus;
  periodStart: string | null;
  periodEnd: string | null;
  confirmedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface GenerateReferenceResult {
  paymentId: string;
  entity: string;
  reference: string;
  amountAoa: number;
  expiresAt: string;
  reused: boolean;
}

// ─── Plan catalogue ───────────────────────────────────────────────────────────

export const PLANS: Record<
  SubscriptionPlan,
  { name: string; priceAoa: number; features: string[] }
> = {
  free: {
    name: 'Free',
    priceAoa: 0,
    features: ['Até 3 propostas/mês', 'Exportação PDF básica', 'Suporte por e-mail'],
  },
  starter: {
    name: 'Starter',
    priceAoa: 15_000,
    features: ['Até 20 propostas/mês', 'Exportação PDF personalizada', 'Histórico completo', 'Envio por e-mail'],
  },
  pro: {
    name: 'Pro',
    priceAoa: 35_000,
    features: ['Propostas ilimitadas', 'Multi-serviço', 'Branding personalizado', 'Modelos de templates', 'Suporte prioritário'],
  },
  enterprise: {
    name: 'Enterprise',
    priceAoa: 75_000,
    features: ['Tudo do Pro', 'Múltiplos utilizadores', 'Relatórios avançados', 'API access', 'SLA dedicado'],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapSubscription(row: Record<string, unknown>): Subscription {
  return {
    id:                  row.id as string,
    userId:              row.user_id as string,
    plan:                row.plan as SubscriptionPlan,
    status:              row.status as SubscriptionStatus,
    trialEndsAt:         row.trial_ends_at as string | null,
    currentPeriodStart:  row.current_period_start as string | null,
    currentPeriodEnd:    row.current_period_end as string | null,
    canceledAt:          row.canceled_at as string | null,
    createdAt:           row.created_at as string,
    updatedAt:           row.updated_at as string,
  };
}

function mapPayment(row: Record<string, unknown>): Payment {
  return {
    id:            row.id as string,
    bfaReference:  row.bfa_reference as string | null,
    bfaEntity:     row.bfa_entity as string | null,
    amountAoa:     Number(row.amount_aoa),
    status:        row.status as PaymentStatus,
    periodStart:   row.period_start as string | null,
    periodEnd:     row.period_end as string | null,
    confirmedAt:   row.confirmed_at as string | null,
    expiresAt:     row.expires_at as string | null,
    createdAt:     row.created_at as string,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Subscrição activa
  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data ? mapSubscription(data as Record<string, unknown>) : null;
    },
    enabled: !!user?.id,
  });

  // Histórico de pagamentos (mais recente primeiro)
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []).map((r) => mapPayment(r as Record<string, unknown>));
    },
    enabled: !!user?.id,
  });

  // Gerar referência BFA
  const generateReference = useMutation({
    mutationFn: async (plan: Exclude<SubscriptionPlan, 'free'>) => {
      const { data, error } = await supabase.functions.invoke('bfa-generate-reference', {
        body: { plan },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error ?? 'Falha ao gerar referência');
      return data.data as GenerateReferenceResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['payments', user?.id] });
      if (result.reused) {
        toast.info('Referência activa reutilizada', {
          description: 'Já tens uma referência pendente válida.',
        });
      } else {
        toast.success('Referência gerada com sucesso!');
      }
    },
    onError: (err: Error) => {
      toast.error('Erro ao gerar referência', { description: err.message });
    },
  });

  // ── Computed helpers ───────────────────────────────────────────────────────

  const now = new Date();

  const isTrialActive =
    subscription?.status === 'trialing' &&
    !!subscription.trialEndsAt &&
    new Date(subscription.trialEndsAt) > now;

  const isActive = subscription?.status === 'active' || isTrialActive;

  // Utilizador pode aceder à plataforma
  const canAccess = isActive;

  const daysLeft = (() => {
    if (!subscription) return null;
    const end =
      subscription.status === 'trialing'
        ? subscription.trialEndsAt
        : subscription.currentPeriodEnd;
    if (!end) return null;
    const diff = new Date(end).getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();

  const pendingPayment = payments.find(
    (p) => p.status === 'pending' && p.expiresAt && new Date(p.expiresAt) > now,
  ) ?? null;

  return {
    subscription,
    payments,
    pendingPayment,
    isLoading:  subLoading || paymentsLoading,
    isActive,
    isTrial:    subscription?.status === 'trialing',
    isTrialActive,
    canAccess,
    daysLeft,
    generateReference,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['payments', user?.id] });
    },
  };
}
