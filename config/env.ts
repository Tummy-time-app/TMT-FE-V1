import { z } from "zod";

/**
 * Central, validated access to public runtime configuration.
 *
 * Only NEXT_PUBLIC_* variables belong here — anything read by this module
 * is shipped to the browser. Never add secrets (service role keys, payment
 * secret keys, etc.) to this file or to NEXT_PUBLIC_* env vars.
 *
 * NEXT_PUBLIC_API_URL is the TMT-BE-V1 API gateway's root URL (e.g. its
 * Render URL) — no version prefix, see store/api/baseApi.ts. Every value is
 * optional at the schema level because the app must keep running against
 * the mock adapter (see lib/dev/devMode.ts) before that URL is set.
 * Missing-but-required values are surfaced as console warnings in
 * development rather than crashes.
 *
 * NEXT_PUBLIC_{USER,RESTAURANT,ORDER,NOTIFICATION}_SERVICE_URL are each
 * microservice's own standalone Render URL (see the gateway's GET /health,
 * whose `routes` object lists exactly these) — named to mirror api-gateway's
 * own USER_SERVICE_URL/etc. env vars. All optional: when a given service's
 * URL isn't set, store/api/baseApi.ts routes that service's calls through
 * the gateway (NEXT_PUBLIC_API_URL) instead, same as before these existed.
 */
const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_USER_SERVICE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_RESTAURANT_SERVICE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_ORDER_SERVICE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_NOTIFICATION_SERVICE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_USE_MOCKS: z.string().optional(),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_USER_SERVICE_URL: process.env.NEXT_PUBLIC_USER_SERVICE_URL,
  NEXT_PUBLIC_RESTAURANT_SERVICE_URL: process.env.NEXT_PUBLIC_RESTAURANT_SERVICE_URL,
  NEXT_PUBLIC_ORDER_SERVICE_URL: process.env.NEXT_PUBLIC_ORDER_SERVICE_URL,
  NEXT_PUBLIC_NOTIFICATION_SERVICE_URL: process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL,
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  NEXT_PUBLIC_USE_MOCKS: process.env.NEXT_PUBLIC_USE_MOCKS,
});

if (!parsed.success && process.env.NODE_ENV !== "production") {
  console.warn(
    "[config/env] Invalid environment variables:",
    parsed.error.flatten().fieldErrors
  );
}

const raw = parsed.success ? parsed.data : {};

export const env = {
  apiUrl: raw.NEXT_PUBLIC_API_URL || "",
  userServiceUrl: raw.NEXT_PUBLIC_USER_SERVICE_URL || "",
  restaurantServiceUrl: raw.NEXT_PUBLIC_RESTAURANT_SERVICE_URL || "",
  orderServiceUrl: raw.NEXT_PUBLIC_ORDER_SERVICE_URL || "",
  notificationServiceUrl: raw.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || "",
  googleMapsApiKey: raw.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  useMocks: raw.NEXT_PUBLIC_USE_MOCKS === "true",
} as const;
