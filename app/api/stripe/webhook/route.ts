import {
  billingValuesFromSubscription,
  saveBillingProfileForCustomer,
  saveBillingProfileForUser,
} from "@/lib/billing";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getCustomerId,
  getSubscriptionId,
  requireStripeWebhookSecret,
  verifyStripeWebhookPayload,
  StripeConfigurationError,
  StripeWebhookSignatureError,
  type StripeCheckoutSession,
  type StripeEvent,
  type StripeSubscription,
} from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCheckoutSession(value: unknown): value is StripeCheckoutSession {
  return isRecord(value) && typeof value.id === "string";
}

function isSubscription(value: unknown): value is StripeSubscription {
  return isRecord(value) && typeof value.id === "string";
}

function userIdFromSession(session: StripeCheckoutSession) {
  return session.client_reference_id ?? session.metadata?.user_id ?? null;
}

async function handleCheckoutCompleted(event: StripeEvent) {
  if (!isCheckoutSession(event.data.object)) {
    return;
  }

  const session = event.data.object;
  const userId = userIdFromSession(session);
  const customerId = getCustomerId(session);

  if (!userId || !customerId) {
    return;
  }

  const subscriptionId = getSubscriptionId(session);
  const supabase = getSupabaseAdminClient();

  await saveBillingProfileForUser(supabase, userId, {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
  });
}

async function handleSubscriptionChanged(event: StripeEvent) {
  if (!isSubscription(event.data.object)) {
    return;
  }

  const subscription = event.data.object;
  const customerId = getCustomerId(subscription);

  if (!customerId) {
    return;
  }

  const supabase = getSupabaseAdminClient();

  await saveBillingProfileForCustomer(supabase, customerId, {
    stripe_customer_id: customerId,
    ...billingValuesFromSubscription(subscription),
  });
}

async function handleStripeEvent(event: StripeEvent) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event);
      break;
    case "customer.subscription.created":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
    case "customer.subscription.updated":
      await handleSubscriptionChanged(event);
      break;
  }
}

export async function POST(request: Request) {
  const signatureHeader = request.headers.get("stripe-signature");

  if (!signatureHeader) {
    return Response.json({ error: "Brak podpisu Stripe." }, { status: 400 });
  }

  const payload = await request.text();
  let event: StripeEvent;

  try {
    event = verifyStripeWebhookPayload({
      payload,
      signatureHeader,
      webhookSecret: requireStripeWebhookSecret(),
    });
  } catch (error) {
    const message =
      error instanceof StripeWebhookSignatureError ||
      error instanceof StripeConfigurationError
        ? error.message
        : "Nie udało się zweryfikować webhooka Stripe.";

    return Response.json({ error: message }, { status: 400 });
  }

  try {
    await handleStripeEvent(event);
  } catch {
    return Response.json(
      { error: "Nie udało się obsłużyć webhooka Stripe." },
      { status: 500 },
    );
  }

  return Response.json({ received: true });
}
