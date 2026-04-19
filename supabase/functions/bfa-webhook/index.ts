import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Estrutura esperada do webhook BFA.
 * Actualizar os campos quando a documentação real estiver disponível.
 */
interface BfaWebhookPayload {
  reference:  string;       // referência multibanco
  entity:     string;       // entidade BFA
  amount:     number;       // valor pago
  paid_at:    string;       // ISO timestamp de confirmação
  status:     string;       // "PAID" | "FAILED" | "EXPIRED" (a confirmar com a API BFA)
  [key: string]: unknown;   // campos adicionais preservados para auditoria
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// O webhook é chamado pelo servidor BFA — não usa CORS amplo.
// Apenas aceita POST; a autenticação é feita via assinatura HMAC ou token secreto.
const RESPONSE_HEADERS = { "Content-Type": "application/json" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function jsonResponse<T>(body: ApiResponse<T>, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: RESPONSE_HEADERS });
}

/**
 * Valida a assinatura do webhook BFA.
 * Substituir pela lógica real (HMAC-SHA256, token fixo, IP allowlist, etc.)
 * quando a documentação BFA estiver disponível.
 */
async function verifyBfaSignature(req: Request, rawBody: string): Promise<boolean> {
  const webhookSecret = Deno.env.get("BFA_WEBHOOK_SECRET");

  if (!webhookSecret) {
    // Em desenvolvimento sem secret configurado, aceitar (log de aviso)
    console.warn("[bfa-webhook] BFA_WEBHOOK_SECRET not set — skipping signature verification (dev mode)");
    return true;
  }

  // Exemplo com HMAC-SHA256; ajustar header name conforme a API BFA
  const signature = req.headers.get("x-bfa-signature") ?? req.headers.get("x-webhook-signature");
  if (!signature) {
    console.error("[bfa-webhook] Missing signature header");
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return signature === expected;
}

/**
 * Normaliza o status BFA para o enum interno payment_status.
 * Ajustar os valores conforme a documentação real da API BFA.
 */
function normalizeBfaStatus(bfaStatus: string): "confirmed" | "failed" | "expired" | null {
  const s = bfaStatus.toUpperCase();
  if (s === "PAID" || s === "CONFIRMED" || s === "SUCCESS") return "confirmed";
  if (s === "FAILED" || s === "ERROR" || s === "REJECTED")  return "failed";
  if (s === "EXPIRED" || s === "TIMEOUT")                   return "expired";
  return null;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

serve(async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID();
  console.log(`[bfa-webhook] [${requestId}] START ${req.method}`);

  // Webhook é sempre POST
  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch (err) {
    console.error(`[bfa-webhook] [${requestId}] Failed to read body:`, err);
    return jsonResponse({ success: false, error: "Cannot read request body" }, 400);
  }

  // 1. Verificar assinatura ──────────────────────────────────────────────────
  const isValid = await verifyBfaSignature(req, rawBody);
  if (!isValid) {
    console.error(`[bfa-webhook] [${requestId}] Invalid signature`);
    return jsonResponse({ success: false, error: "Invalid webhook signature" }, 401);
  }

  // 2. Parse payload ─────────────────────────────────────────────────────────
  let payload: BfaWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error(`[bfa-webhook] [${requestId}] Invalid JSON`);
    return jsonResponse({ success: false, error: "Invalid JSON payload" }, 400);
  }

  const { reference, entity, amount, paid_at, status: bfaStatus } = payload;

  console.log(`[bfa-webhook] [${requestId}] Received: ref=${reference} entity=${entity} amount=${amount} status=${bfaStatus}`);

  if (!reference || !bfaStatus) {
    return jsonResponse({ success: false, error: "Missing required fields: reference, status" }, 422);
  }

  // 3. Normalizar status ─────────────────────────────────────────────────────
  const internalStatus = normalizeBfaStatus(bfaStatus);
  if (!internalStatus) {
    console.warn(`[bfa-webhook] [${requestId}] Unknown BFA status: ${bfaStatus}`);
    return jsonResponse({ success: false, error: `Unknown BFA status: ${bfaStatus}` }, 422);
  }

  // 4. Supabase (service_role — sem RLS) ────────────────────────────────────
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 5. Localizar o pagamento pela referência ─────────────────────────────────
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("id, subscription_id, status, amount_aoa, period_start, period_end")
    .eq("bfa_reference", reference)
    .maybeSingle();

  if (paymentError) {
    console.error(`[bfa-webhook] [${requestId}] DB error fetching payment:`, paymentError.message);
    return jsonResponse({ success: false, error: "Database error" }, 500);
  }

  if (!payment) {
    console.warn(`[bfa-webhook] [${requestId}] No payment found for reference ${reference}`);
    // Devolver 200 para que o BFA não reenvie indefinidamente um webhook legítimo mas desconhecido
    return jsonResponse({ success: true, data: { message: "Reference not found — ignored" } }, 200);
  }

  if (payment.status !== "pending") {
    console.log(`[bfa-webhook] [${requestId}] Payment ${payment.id} already processed (${payment.status}) — idempotent skip`);
    return jsonResponse({ success: true, data: { payment_id: payment.id, status: payment.status } }, 200);
  }

  // 6. Actualizar o registo de pagamento ────────────────────────────────────
  const paymentUpdate: Record<string, unknown> = {
    status:              internalStatus,
    bfa_webhook_payload: payload,
  };
  if (internalStatus === "confirmed") {
    paymentUpdate.confirmed_at = paid_at ?? new Date().toISOString();
  }

  const { error: updatePaymentError } = await supabase
    .from("payments")
    .update(paymentUpdate)
    .eq("id", payment.id);

  if (updatePaymentError) {
    console.error(`[bfa-webhook] [${requestId}] Failed to update payment ${payment.id}:`, updatePaymentError.message);
    return jsonResponse({ success: false, error: "Failed to update payment" }, 500);
  }

  console.log(`[bfa-webhook] [${requestId}] Payment ${payment.id} updated to ${internalStatus}`);

  // 7. Activar / desactivar subscrição ──────────────────────────────────────
  if (internalStatus === "confirmed") {
    const subscriptionUpdate = {
      status:               "active",
      current_period_start: payment.period_start,
      current_period_end:   payment.period_end,
    };

    const { error: subError } = await supabase
      .from("subscriptions")
      .update(subscriptionUpdate)
      .eq("id", payment.subscription_id);

    if (subError) {
      console.error(`[bfa-webhook] [${requestId}] Failed to activate subscription ${payment.subscription_id}:`, subError.message);
      // Não falhar o webhook; o pagamento já está gravado — pode ser corrigido manualmente
      return jsonResponse({
        success: false,
        error:   "Payment confirmed but subscription activation failed — manual intervention required",
      }, 500);
    }

    console.log(`[bfa-webhook] [${requestId}] Subscription ${payment.subscription_id} activated`);
  } else if (internalStatus === "failed" || internalStatus === "expired") {
    // Marcar subscrição como unpaid se estava em estado activo ou trialing
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("id", payment.subscription_id)
      .single();

    if (sub && (sub.status === "active" || sub.status === "past_due")) {
      await supabase
        .from("subscriptions")
        .update({ status: "unpaid" })
        .eq("id", payment.subscription_id);

      console.log(`[bfa-webhook] [${requestId}] Subscription ${payment.subscription_id} marked as unpaid`);
    }
  }

  // 8. Resposta final ────────────────────────────────────────────────────────
  console.log(`[bfa-webhook] [${requestId}] DONE payment=${payment.id} status=${internalStatus}`);
  return jsonResponse({
    success: true,
    data: {
      payment_id:      payment.id,
      subscription_id: payment.subscription_id,
      status:          internalStatus,
    },
  }, 200);
});
