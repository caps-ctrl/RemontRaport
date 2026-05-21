"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ensureStripeCustomerForUser,
  getBillingProfileForUser,
  BillingError,
} from "@/lib/billing";
import {
  createStripeBillingPortalSession,
  createStripeCheckoutSession,
  requireStripeCheckoutConfiguration,
  StripeConfigurationError,
  StripeRequestError,
} from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function redirectWithBillingError(message: string): never {
  const params = new URLSearchParams({ billingError: message });

  redirect(`/billing?${params.toString()}`);
}

function getActionErrorMessage(error: unknown) {
  if (
    error instanceof BillingError ||
    error instanceof StripeConfigurationError ||
    error instanceof StripeRequestError
  ) {
    return error.message;
  }

  return "Nie udało się rozpocząć operacji płatniczej.";
}

async function getBillingActionContext() {
  let supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>;

  try {
    supabase = await getSupabaseServerClient();
  } catch {
    redirectWithBillingError("Błąd po stronie serwera.");
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    const params = new URLSearchParams({
      message: "Zaloguj się, aby przejść do płatności.",
    });

    redirect(`/login?${params.toString()}`);
  }

  return { supabase, user };
}

async function getRequestOrigin() {
  const requestHeaders = await headers();
  const vercelUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : null;

  return (
    requestHeaders.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    vercelUrl ??
    "http://localhost:3000"
  );
}

export async function startCheckoutAction() {
  const { supabase, user } = await getBillingActionContext();
  const origin = await getRequestOrigin();
  let checkoutUrl: string | null | undefined;

  try {
    const { proPriceId } = requireStripeCheckoutConfiguration();
    const customerId = await ensureStripeCustomerForUser({ supabase, user });
    const session = await createStripeCheckoutSession({
      customerId,
      origin,
      priceId: proPriceId,
      userId: user.id,
    });

    checkoutUrl = session.url;
  } catch (error) {
    redirectWithBillingError(getActionErrorMessage(error));
  }

  if (!checkoutUrl) {
    redirectWithBillingError("Stripe nie zwrócił adresu płatności.");
  }

  redirect(checkoutUrl);
}

export async function openBillingPortalAction() {
  const { supabase, user } = await getBillingActionContext();
  const origin = await getRequestOrigin();
  let portalUrl: string | null | undefined;

  try {
    const profile = await getBillingProfileForUser(supabase, user.id);

    if (!profile.stripe_customer_id) {
      throw new BillingError("Najpierw aktywuj plan płatny w Stripe.");
    }

    const session = await createStripeBillingPortalSession({
      customerId: profile.stripe_customer_id,
      returnUrl: `${origin}/billing`,
    });

    portalUrl = session.url;
  } catch (error) {
    redirectWithBillingError(getActionErrorMessage(error));
  }

  if (!portalUrl) {
    redirectWithBillingError("Stripe nie zwrócił adresu panelu klienta.");
  }

  revalidatePath("/billing");
  redirect(portalUrl);
}
