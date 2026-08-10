import { z } from "zod";

/**
 * Central, validated access to public runtime configuration.
 *
 * Only NEXT_PUBLIC_* variables belong here — anything read by this module
 * is shipped to the browser. Never add secrets (service role keys, payment
 * secret keys, etc.) to this file or to NEXT_PUBLIC_* env vars.
 *
 * Every value is optional at the schema level because the app must keep
 * running against the mock adapter (see lib/dev/devMode.ts) before a real
 * backend/Supabase project exists. Missing-but-required values are
 * surfaced as console warnings in development rather than crashes.
 */
const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_USE_MOCKS: z.string().optional(),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
  supabaseUrl: raw.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: raw.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  googleMapsApiKey: raw.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  useMocks: raw.NEXT_PUBLIC_USE_MOCKS === "true",
} as const;
