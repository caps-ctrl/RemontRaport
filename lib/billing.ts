import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  createStripeCustomer,
  getStripeConfiguration,
  listStripeSubscriptions,
  retrieveStripeCustomer,
  StripeRequestError,
  type StripeSubscription,
} from "@/lib/stripe";

export const BILLING_PROFILE_COLUMNS =
  "id,stripe_customer_id,stripe_subscription_id,stripe_subscription_status,stripe_price_id,stripe_current_period_end";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

type BillingSupabaseClient = Pick<SupabaseClient, "from">;

export type BillingProfile = {
  id: string;
  stripe_current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_price_id: string | null;
  stripe_subscription_id: string | null;
  stripe_subscription_status: string | null;
};

export type BillingProfileUpdate = Partial<
  Omit<BillingProfile, "id">
>;

export type BillingSubscriptionSummary = {
  cancel_at_period_end: boolean;
  current_period_end: string | null;
  id: string | null;
  price_id: string | null;
  status: string;
};

export type BillingOverview = {
  canManageSubscription: boolean;
  canStartCheckout: boolean;
  customerId: string | null;
  isProActive: boolean;
  missingConfiguration: string[];
  planName: string;
  statusLabel: string;
  stripeSecretConfigured: boolean;
  subscription: BillingSubscriptionSummary | null;
  syncError: string | null;
};

export class BillingError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "BillingError";
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nullableString(row: Record<string, unknown>, key: string) {
  const value = row[key];

  return typeof value === "string" && value ? value : null;
}

function mapBillingProfile(row: Record<string, unknown>): BillingProfile {
  return {
    id: String(row.id),
    stripe_current_period_end: nullableString(row, "stripe_current_period_end"),
    stripe_customer_id: nullableString(row, "stripe_customer_id"),
    stripe_price_id: nullableString(row, "stripe_price_id"),
    stripe_subscription_id: nullableString(row, "stripe_subscription_id"),
    stripe_subscription_status: nullableString(
      row,
      "stripe_subscription_status",
    ),
  };
}

function emptyBillingProfile(userId: string): BillingProfile {
  return {
    id: userId,
    stripe_current_period_end: null,
    stripe_customer_id: null,
    stripe_price_id: null,
    stripe_subscription_id: null,
    stripe_subscription_status: null,
  };
}

function getDatabaseBillingError(error: unknown) {
  if (isRecord(error) && typeof error.message === "string") {
    if (
      error.message.includes("stripe_customer_id") ||
      error.message.includes("stripe_subscription")
    ) {
      return "Brakuje kolumn billingowych w tabeli profiles. Uruchom migrację Supabase.";
    }
  }

  return "Nie udało się pobrać danych płatności.";
}

export async function getBillingProfileForUser(
  supabase: BillingSupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("profiles")
    .select(BILLING_PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new BillingError(getDatabaseBillingError(error), 500);
  }

  return data ? mapBillingProfile(data) : emptyBillingProfile(userId);
}

export function getUserBillingName(user: User) {
  const metadata = user.user_metadata ?? {};
  const metadataName =
    typeof metadata.full_name === "string" && metadata.full_name.trim()
      ? metadata.full_name.trim()
      : typeof metadata.name === "string" && metadata.name.trim()
        ? metadata.name.trim()
        : null;

  return metadataName ?? user.email?.split("@")[0] ?? "Klient RemontRaport";
}

function cleanBillingUpdate(values: BillingProfileUpdate) {
  const payload: Record<string, string | null> = {};

  for (const [key, value] of Object.entries(values)) {
    payload[key] = value ?? null;
  }

  return payload;
}

export async function saveBillingProfileForUser(
  supabase: BillingSupabaseClient,
  userId: string,
  values: BillingProfileUpdate,
) {
  const payload = cleanBillingUpdate(values);
  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select(BILLING_PROFILE_COLUMNS)
    .maybeSingle();

  if (error) {
    throw new BillingError(getDatabaseBillingError(error), 500);
  }

  if (data) {
    return mapBillingProfile(data);
  }

  const { data: inserted, error: insertError } = await supabase
    .from("profiles")
    .insert({
      ...payload,
      created_at: new Date().toISOString(),
      id: userId,
    })
    .select(BILLING_PROFILE_COLUMNS)
    .single();

  if (insertError || !inserted) {
    throw new BillingError(
      "Nie udało się zapisać danych płatności w profilu.",
      500,
    );
  }

  return mapBillingProfile(inserted);
}

export async function saveBillingProfileForCustomer(
  supabase: BillingSupabaseClient,
  customerId: string,
  values: BillingProfileUpdate,
) {
  const { error } = await supabase
    .from("profiles")
    .update(cleanBillingUpdate(values))
    .eq("stripe_customer_id", customerId);

  if (error) {
    throw new BillingError(getDatabaseBillingError(error), 500);
  }
}

function subscriptionPriceId(subscription: StripeSubscription) {
  return subscription.items?.data?.[0]?.price?.id ?? null;
}

export function billingValuesFromSubscription(
  subscription: StripeSubscription,
): BillingProfileUpdate {
  const periodEnd =
    typeof subscription.current_period_end === "number"
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null;

  return {
    stripe_current_period_end: periodEnd,
    stripe_price_id: subscriptionPriceId(subscription),
    stripe_subscription_id: subscription.id,
    stripe_subscription_status: subscription.status ?? "unknown",
  };
}

function mapSubscriptionSummary(
  subscription: StripeSubscription,
): BillingSubscriptionSummary {
  return {
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    current_period_end:
      billingValuesFromSubscription(subscription).stripe_current_period_end ??
      null,
    id: subscription.id,
    price_id: subscriptionPriceId(subscription),
    status: subscription.status ?? "unknown",
  };
}

function storedSubscriptionSummary(
  profile: BillingProfile,
): BillingSubscriptionSummary | null {
  if (!profile.stripe_subscription_id && !profile.stripe_subscription_status) {
    return null;
  }

  return {
    cancel_at_period_end: false,
    current_period_end: profile.stripe_current_period_end,
    id: profile.stripe_subscription_id,
    price_id: profile.stripe_price_id,
    status: profile.stripe_subscription_status ?? "unknown",
  };
}

function pickRelevantSubscription(
  subscriptions: StripeSubscription[],
  proPriceId: string | null,
) {
  const withConfiguredPrice = proPriceId
    ? subscriptions.filter(
        (subscription) => subscriptionPriceId(subscription) === proPriceId,
      )
    : [];
  const candidates = withConfiguredPrice.length
    ? withConfiguredPrice
    : subscriptions;

  return (
    candidates.find((subscription) =>
      ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status ?? ""),
    ) ??
    candidates.find((subscription) => subscription.status !== "canceled") ??
    candidates[0] ??
    null
  );
}

function statusLabel(status?: string | null) {
  switch (status) {
    case "active":
      return "Aktywna";
    case "trialing":
      return "Okres próbny";
    case "past_due":
      return "Płatność zaległa";
    case "incomplete":
      return "Oczekuje na płatność";
    case "incomplete_expired":
      return "Płatność wygasła";
    case "canceled":
      return "Anulowana";
    case "unpaid":
      return "Nieopłacona";
    case "paused":
      return "Wstrzymana";
    default:
      return "Plan darmowy";
  }
}

export function isSubscriptionActive(status?: string | null) {
  return ACTIVE_SUBSCRIPTION_STATUSES.has(status ?? "");
}

export async function ensureStripeCustomerForUser({
  supabase,
  user,
}: {
  supabase: BillingSupabaseClient;
  user: User;
}) {
  if (!user.email) {
    throw new BillingError("Konto nie ma adresu e-mail do płatności.", 400);
  }

  const profile = await getBillingProfileForUser(supabase, user.id);

  if (profile.stripe_customer_id) {
    try {
      const customer = await retrieveStripeCustomer(profile.stripe_customer_id);

      if (!customer.deleted && customer.email === user.email) {
        return customer.id;
      }
    } catch (error) {
      if (!(error instanceof StripeRequestError) || error.status !== 404) {
        throw error;
      }
    }
  }

  const customer = await createStripeCustomer({
    email: user.email,
    name: getUserBillingName(user),
    userId: user.id,
  });

  await saveBillingProfileForUser(supabase, user.id, {
    stripe_customer_id: customer.id,
  });

  return customer.id;
}

export async function getBillingOverviewForUser({
  supabase,
  user,
}: {
  supabase: BillingSupabaseClient;
  user: User;
}): Promise<BillingOverview> {
  const configuration = getStripeConfiguration();
  const profile = await getBillingProfileForUser(supabase, user.id);
  let syncError: string | null = null;
  let subscription = storedSubscriptionSummary(profile);

  if (configuration.secretKeyConfigured && profile.stripe_customer_id) {
    try {
      const subscriptions = await listStripeSubscriptions(
        profile.stripe_customer_id,
      );
      const liveSubscription = pickRelevantSubscription(
        subscriptions.data ?? [],
        configuration.proPriceId,
      );

      if (liveSubscription) {
        subscription = mapSubscriptionSummary(liveSubscription);
        await saveBillingProfileForUser(supabase, user.id, {
          stripe_customer_id: profile.stripe_customer_id,
          ...billingValuesFromSubscription(liveSubscription),
        });
      }
    } catch {
      syncError = "Nie udało się odświeżyć statusu subskrypcji ze Stripe.";
    }
  }

  const active = isSubscriptionActive(subscription?.status);

  return {
    canManageSubscription: Boolean(
      configuration.secretKeyConfigured && profile.stripe_customer_id,
    ),
    canStartCheckout: configuration.missing.length === 0,
    customerId: profile.stripe_customer_id,
    isProActive: active,
    missingConfiguration: configuration.missing,
    planName: active ? "Pro" : "Starter",
    statusLabel: statusLabel(subscription?.status),
    stripeSecretConfigured: configuration.secretKeyConfigured,
    subscription,
    syncError,
  };
}
