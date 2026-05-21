import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export const STRIPE_API_VERSION = "2026-04-22.dahlia";

const STRIPE_API_URL = "https://api.stripe.com/v1";
const WEBHOOK_TOLERANCE_SECONDS = 5 * 60;

export type StripeConfiguration = {
  missing: string[];
  proPriceId: string | null;
  secretKeyConfigured: boolean;
};

export type StripeCustomer = {
  deleted?: boolean;
  email?: string | null;
  id: string;
  metadata?: Record<string, string>;
  name?: string | null;
};

export type StripeCheckoutSession = {
  client_reference_id?: string | null;
  customer?: string | StripeCustomer | null;
  id: string;
  metadata?: Record<string, string>;
  mode?: string | null;
  subscription?: string | StripeSubscription | null;
  url?: string | null;
};

export type StripePortalSession = {
  id: string;
  url: string;
};

export type StripePrice = {
  currency?: string | null;
  id?: string;
  recurring?: {
    interval?: string | null;
  } | null;
  unit_amount?: number | null;
};

export type StripeSubscription = {
  cancel_at_period_end?: boolean | null;
  canceled_at?: number | null;
  current_period_end?: number | null;
  customer?: string | StripeCustomer | null;
  id: string;
  items?: {
    data?: Array<{
      price?: StripePrice | null;
    }>;
  };
  status?: string | null;
};

export type StripeSubscriptionList = {
  data: StripeSubscription[];
};

export type StripeEvent = {
  data: {
    object: unknown;
  };
  id: string;
  type: string;
};

export class StripeConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StripeConfigurationError";
  }
}

export class StripeRequestError extends Error {
  code?: string;
  status: number;

  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.name = "StripeRequestError";
    this.status = status;
    this.code = code;
  }
}

export class StripeWebhookSignatureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StripeWebhookSignatureError";
  }
}

function readEnv(name: string) {
  const value = process.env[name];

  return value && value.trim() ? value.trim() : null;
}

function requireStripeSecretKey() {
  const key = readEnv("STRIPE_SECRET_KEY");

  if (!key) {
    throw new StripeConfigurationError(
      "Brakuje STRIPE_SECRET_KEY w konfiguracji serwera.",
    );
  }

  return key;
}

export function getStripeConfiguration(): StripeConfiguration {
  const missing: string[] = [];
  const proPriceId = readEnv("STRIPE_PRO_PRICE_ID");
  const secretKeyConfigured = Boolean(readEnv("STRIPE_SECRET_KEY"));

  if (!secretKeyConfigured) {
    missing.push("STRIPE_SECRET_KEY");
  }

  if (!proPriceId) {
    missing.push("STRIPE_PRO_PRICE_ID");
  }

  return {
    missing,
    proPriceId,
    secretKeyConfigured,
  };
}

export function requireStripeCheckoutConfiguration() {
  const configuration = getStripeConfiguration();

  if (configuration.missing.length > 0 || !configuration.proPriceId) {
    throw new StripeConfigurationError(
      `Brakuje konfiguracji Stripe: ${configuration.missing.join(", ")}.`,
    );
  }

  return {
    proPriceId: configuration.proPriceId,
  };
}

export function requireStripeWebhookSecret() {
  const secret = readEnv("STRIPE_WEBHOOK_SECRET");

  if (!secret) {
    throw new StripeConfigurationError(
      "Brakuje STRIPE_WEBHOOK_SECRET w konfiguracji serwera.",
    );
  }

  return secret;
}

function getStripeObjectId(value: string | { id?: string } | null | undefined) {
  if (typeof value === "string") {
    return value;
  }

  return typeof value?.id === "string" ? value.id : null;
}

export function getCustomerId(value: StripeSubscription | StripeCheckoutSession) {
  return getStripeObjectId(value.customer);
}

export function getSubscriptionId(value: StripeCheckoutSession) {
  return getStripeObjectId(value.subscription);
}

async function stripeRequest<T>(
  path: string,
  {
    method = "POST",
    params,
  }: {
    method?: "GET" | "POST";
    params?: URLSearchParams;
  } = {},
): Promise<T> {
  const url = new URL(`${STRIPE_API_URL}${path}`);

  if (method === "GET" && params) {
    url.search = params.toString();
  }

  const response = await fetch(url, {
    body: method === "POST" ? params?.toString() : undefined,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${requireStripeSecretKey()}`,
      "Stripe-Version": STRIPE_API_VERSION,
      ...(method === "POST"
        ? { "Content-Type": "application/x-www-form-urlencoded" }
        : {}),
    },
    method,
  });
  const raw = await response.text();
  const payload = raw ? tryParseJson(raw) : null;

  if (!response.ok) {
    const error = isRecord(payload) && isRecord(payload.error)
      ? payload.error
      : null;
    const message =
      (typeof error?.message === "string" && error.message) ||
      "Nie udało się wykonać żądania do Stripe.";
    const code = typeof error?.code === "string" ? error.code : undefined;

    throw new StripeRequestError(message, response.status, code);
  }

  return payload as T;
}

function tryParseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function appendIfPresent(
  params: URLSearchParams,
  key: string,
  value?: string | null,
) {
  if (value) {
    params.set(key, value);
  }
}

export async function createStripeCustomer({
  email,
  name,
  userId,
}: {
  email: string;
  name?: string | null;
  userId: string;
}) {
  const params = new URLSearchParams();

  params.set("email", email);
  appendIfPresent(params, "name", name);
  params.set("metadata[user_id]", userId);

  return stripeRequest<StripeCustomer>("/customers", { params });
}

export async function retrieveStripeCustomer(customerId: string) {
  return stripeRequest<StripeCustomer>(
    `/customers/${encodeURIComponent(customerId)}`,
    {
      method: "GET",
    },
  );
}

export async function createStripeCheckoutSession({
  customerId,
  origin,
  priceId,
  userId,
}: {
  customerId: string;
  origin: string;
  priceId: string;
  userId: string;
}) {
  const params = new URLSearchParams();

  params.set("allow_promotion_codes", "true");
  params.set("billing_address_collection", "auto");
  params.set("client_reference_id", userId);
  params.set("customer", customerId);
  params.set("line_items[0][price]", priceId);
  params.set("line_items[0][quantity]", "1");
  params.set("locale", "pl");
  params.set("metadata[user_id]", userId);
  params.set("mode", "subscription");
  params.set("subscription_data[metadata][user_id]", userId);
  params.set(
    "success_url",
    `${origin}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
  );
  params.set("cancel_url", `${origin}/billing?checkout=cancel`);

  return stripeRequest<StripeCheckoutSession>("/checkout/sessions", {
    params,
  });
}

export async function createStripeBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const params = new URLSearchParams();

  params.set("customer", customerId);
  params.set("return_url", returnUrl);

  return stripeRequest<StripePortalSession>("/billing_portal/sessions", {
    params,
  });
}

export async function listStripeSubscriptions(customerId: string) {
  const params = new URLSearchParams();

  params.set("customer", customerId);
  params.set("limit", "10");
  params.set("status", "all");
  params.append("expand[]", "data.items.data.price");

  return stripeRequest<StripeSubscriptionList>("/subscriptions", {
    method: "GET",
    params,
  });
}

function parseSignatureHeader(signatureHeader: string) {
  const parts = signatureHeader.split(",");
  const signatures: string[] = [];
  let timestamp: number | null = null;

  for (const part of parts) {
    const [key, value] = part.split("=").map((entry) => entry.trim());

    if (key === "t" && value) {
      timestamp = Number(value);
    }

    if (key === "v1" && value) {
      signatures.push(value);
    }
  }

  return { signatures, timestamp };
}

function safeCompareHex(left: string, right: string) {
  if (!/^[0-9a-f]+$/i.test(left) || !/^[0-9a-f]+$/i.test(right)) {
    return false;
  }

  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyStripeWebhookPayload({
  payload,
  signatureHeader,
  webhookSecret,
}: {
  payload: string;
  signatureHeader: string;
  webhookSecret: string;
}) {
  const { signatures, timestamp } = parseSignatureHeader(signatureHeader);

  if (!timestamp || signatures.length === 0) {
    throw new StripeWebhookSignatureError("Brak poprawnego podpisu Stripe.");
  }

  const now = Math.floor(Date.now() / 1000);

  if (Math.abs(now - timestamp) > WEBHOOK_TOLERANCE_SECONDS) {
    throw new StripeWebhookSignatureError("Podpis Stripe wygasł.");
  }

  const expectedSignature = createHmac("sha256", webhookSecret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");

  const valid = signatures.some((signature) =>
    safeCompareHex(signature, expectedSignature),
  );

  if (!valid) {
    throw new StripeWebhookSignatureError("Niepoprawny podpis Stripe.");
  }

  const event = tryParseJson(payload);

  if (!isRecord(event) || typeof event.type !== "string") {
    throw new StripeWebhookSignatureError("Niepoprawny payload Stripe.");
  }

  return event as StripeEvent;
}
