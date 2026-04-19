import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GenerateReferenceRequest {
  plan: "starter" | "pro" | "enterprise";
}

interface BfaReferenceResult {
  entity: string;
  reference: string;
  amount_aoa: number;
  expires_at: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PLAN_PRICES_AOA: Record<string, number> = {
  starter:    15_000,
  pro:        35_000,
  enterprise: 75_000,
};

// Referência caduca ao fim de 5 dias úteis
const REFERENCE_EXPIRY_DAYS = 5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function jsonResponse<T>(body: ApiResponse<T>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

/**
 * Mock BFA reference generation.
 * Substituir pela chamada real à API BFA quando a documentação estiver disponível.
 * A API real deverá receber: entidade, valor, descrição e devolver a referência.
 */
async function generateBfaReference(
  amount_aoa: number,
  description: string,
): Promise<BfaReferenceResult> {
  const BFA_API_KEY    = Deno.env.get("BFA_API_KEY");
  const BFA_ENTITY     = Deno.env.get("BFA_ENTITY") ?? "00000";
  const BFA_API_URL    = Deno.env.get("BFA_API_URL");
  const isMock         = !BFA_API_KEY || !BFA_API_URL;

  const expires_at = new Date(
    Date.now() + REFERENCE_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  if (isMock) {
    // ── MOCK ─────────────────────────────────────────────────────────────────
    console.log("[bfa-generate-reference] MOCK mode — BFA_API_KEY not set");
    const mockReference = String(Math.floor(100_000_000 + Math.random() * 900_000_000));
    return { entity: BFA_ENTITY, reference: mockReference, amount_aoa, expires_at };
  }

  // ── LIVE (preencher quando a documentação BFA chegar) ─────────────────────
  const res = await fetch(`${BFA_API_URL}/references`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${BFA_API_KEY}`,
    },
    body: JSON.stringify({ entity: BFA_ENTITY, amount: amount_aoa, description }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BFA API error ${res.status}: ${text}`);
  }

  const payload = await res.json();
  // Adaptar os campos conforme a resposta real da API BFA
  return {
    entity:      payload.entity    ?? BFA_ENTITY,
    reference:   payload.reference ?? payload.ref,
    amount_aoa:  payload.amount    ?? amount_aoa,
    expires_at:  payload.expires_at ?? expires_at,
  };
}

// ─── Handler ─────────────────────────────────────────────────────────────────

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const requestId = crypto.randomUUID();
  console.log(`[bfa-generate-reference] [${requestId}] START ${req.method}`);

  try {
    // 1. Auth ─────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ success: false, error: "Missing Authorization header" }, 401);
    }

    const supabaseUrl    = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey    = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Verificar JWT do utilizador
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      console.error(`[bfa-generate-reference] [${requestId}] Auth error:`, authError?.message);
      return jsonResponse({ success: false, error: "Unauthorized" }, 401);
    }

    console.log(`[bfa-generate-reference] [${requestId}] user=${user.id}`);

    // 2. Parse body ───────────────────────────────────────────────────────────
    let body: GenerateReferenceRequest;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ success: false, error: "Invalid JSON body" }, 400);
    }

    const { plan } = body;
    if (!plan || !PLAN_PRICES_AOA[plan]) {
      return jsonResponse(
        { success: false, error: `Invalid plan. Valid options: ${Object.keys(PLAN_PRICES_AOA).join(", ")}` },
        400,
      );
    }

    const amount_aoa = PLAN_PRICES_AOA[plan];

    // 3. Garantir que o utilizador tem subscrição ──────────────────────────────
    const { data: subscription, error: subError } = await supabaseClient
      .from("subscriptions")
      .select("id, status")
      .eq("user_id", user.id)
      .single();

    if (subError || !subscription) {
      console.error(`[bfa-generate-reference] [${requestId}] No subscription:`, subError?.message);
      return jsonResponse({ success: false, error: "Subscription not found" }, 404);
    }

    // 4. Verificar se já existe um pagamento pendente para este plano ──────────
    const { data: existingPending } = await supabaseClient
      .from("payments")
      .select("id, bfa_reference, bfa_entity, amount_aoa, expires_at")
      .eq("subscription_id", subscription.id)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (existingPending) {
      console.log(`[bfa-generate-reference] [${requestId}] Reusing existing pending payment ${existingPending.id}`);
      return jsonResponse({
        success: true,
        data: {
          payment_id:   existingPending.id,
          entity:       existingPending.bfa_entity,
          reference:    existingPending.bfa_reference,
          amount_aoa:   existingPending.amount_aoa,
          expires_at:   existingPending.expires_at,
          reused:       true,
        },
      }, 200);
    }

    // 5. Gerar referência BFA ──────────────────────────────────────────────────
    console.log(`[bfa-generate-reference] [${requestId}] Generating BFA reference for plan=${plan} amount=${amount_aoa}`);
    const bfaResult = await generateBfaReference(amount_aoa, `PRECIFIX ${plan.toUpperCase()}`);
    console.log(`[bfa-generate-reference] [${requestId}] Reference generated: entity=${bfaResult.entity} ref=${bfaResult.reference}`);

    // 6. Persistir o pagamento ─────────────────────────────────────────────────
    const periodStart = new Date();
    const periodEnd   = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { data: payment, error: insertError } = await supabaseClient
      .from("payments")
      .insert({
        user_id:         user.id,
        subscription_id: subscription.id,
        bfa_reference:   bfaResult.reference,
        bfa_entity:      bfaResult.entity,
        amount_aoa:      bfaResult.amount_aoa,
        status:          "pending",
        period_start:    periodStart.toISOString(),
        period_end:      periodEnd.toISOString(),
        expires_at:      bfaResult.expires_at,
      })
      .select("id")
      .single();

    if (insertError || !payment) {
      console.error(`[bfa-generate-reference] [${requestId}] Insert error:`, insertError?.message);
      return jsonResponse({ success: false, error: "Failed to save payment record" }, 500);
    }

    console.log(`[bfa-generate-reference] [${requestId}] Payment record created: ${payment.id}`);

    // 7. Resposta ─────────────────────────────────────────────────────────────
    return jsonResponse({
      success: true,
      data: {
        payment_id:  payment.id,
        entity:      bfaResult.entity,
        reference:   bfaResult.reference,
        amount_aoa:  bfaResult.amount_aoa,
        expires_at:  bfaResult.expires_at,
        reused:      false,
      },
    }, 200);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error(`[bfa-generate-reference] [${requestId}] UNHANDLED:`, message);
    return jsonResponse({ success: false, error: message }, 500);
  }
});
