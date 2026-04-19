-- ─────────────────────────────────────────────────────────────────────────────
-- Step 1: Subscriptions & Payments tables (BFA reference banking)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. ENUMS ────────────────────────────────────────────────────────────────────

CREATE TYPE public.subscription_plan AS ENUM (
  'free',
  'starter',
  'pro',
  'enterprise'
);

CREATE TYPE public.subscription_status AS ENUM (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid'
);

CREATE TYPE public.payment_status AS ENUM (
  'pending',
  'confirmed',
  'failed',
  'expired'
);

-- 2. TABLE: subscriptions ─────────────────────────────────────────────────────

CREATE TABLE public.subscriptions (
  id                    UUID                       NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID                       NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan                  public.subscription_plan   NOT NULL DEFAULT 'free',
  status                public.subscription_status NOT NULL DEFAULT 'trialing',
  trial_ends_at         TIMESTAMP WITH TIME ZONE,
  current_period_start  TIMESTAMP WITH TIME ZONE,
  current_period_end    TIMESTAMP WITH TIME ZONE,
  canceled_at           TIMESTAMP WITH TIME ZONE,
  created_at            TIMESTAMP WITH TIME ZONE   NOT NULL DEFAULT now(),
  updated_at            TIMESTAMP WITH TIME ZONE   NOT NULL DEFAULT now()
);

-- 3. TABLE: payments ──────────────────────────────────────────────────────────

CREATE TABLE public.payments (
  id                  UUID                  NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID                  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id     UUID                  NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  bfa_reference       TEXT                  UNIQUE,          -- referência multibanco BFA
  bfa_entity          TEXT,                                  -- entidade BFA (5 dígitos)
  amount_aoa          DECIMAL(15, 2)        NOT NULL,        -- valor em Kwanzas
  status              public.payment_status NOT NULL DEFAULT 'pending',
  period_start        TIMESTAMP WITH TIME ZONE,
  period_end          TIMESTAMP WITH TIME ZONE,
  confirmed_at        TIMESTAMP WITH TIME ZONE,
  expires_at          TIMESTAMP WITH TIME ZONE,              -- referência caduca após N dias
  bfa_webhook_payload JSONB,                                 -- payload bruto do webhook BFA (auditoria)
  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. INDEXES ──────────────────────────────────────────────────────────────────

CREATE INDEX idx_subscriptions_user_id  ON public.subscriptions (user_id);
CREATE INDEX idx_subscriptions_status   ON public.subscriptions (status);
CREATE INDEX idx_payments_user_id       ON public.payments (user_id);
CREATE INDEX idx_payments_subscription  ON public.payments (subscription_id);
CREATE INDEX idx_payments_bfa_reference ON public.payments (bfa_reference);
CREATE INDEX idx_payments_status        ON public.payments (status);

-- 5. updated_at trigger ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. Auto-create free subscription on user signup ─────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status, trial_ends_at)
  VALUES (
    NEW.id,
    'free',
    'trialing',
    now() + INTERVAL '14 days'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- 7. RLS — subscriptions ──────────────────────────────────────────────────────

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Utilizador vê a sua própria subscrição
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Escritas bloqueadas para utilizadores; apenas service_role (Edge Functions) pode escrever
CREATE POLICY "Users cannot insert subscriptions directly"
  ON public.subscriptions FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Users cannot update subscriptions directly"
  ON public.subscriptions FOR UPDATE
  USING (false);

-- Admins têm visibilidade total
CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 8. RLS — payments ───────────────────────────────────────────────────────────

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Utilizador vê os seus próprios pagamentos
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- Escritas bloqueadas para utilizadores; apenas service_role (Edge Functions/webhook) pode escrever
CREATE POLICY "Users cannot insert payments directly"
  ON public.payments FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Users cannot update payments directly"
  ON public.payments FOR UPDATE
  USING (false);

-- Admins têm visibilidade total
CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all payments"
  ON public.payments FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));
