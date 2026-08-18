import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/config/env";

/**
 * Browser Supabase client — identity/auth only (see backend architecture §3:
 * "Supabase Auth as the identity provider, NestJS as the authorization layer").
 *
 * The frontend talks to Supabase Auth *directly* for sign-up/login/OTP/password
 * reset/session refresh (that's the one piece of backend logic Supabase owns
 * outright — see `features/auth/authApi.ts`'s real-mode branches). Every other
 * domain call (orders, vendors, wallet, ...) goes through the NestJS REST API
 * via `store/api/baseApi.ts`, never through this client — this client only ever
 * uses the public anon key, which is safe to ship to the browser because RLS
 * plus NestJS's own RBAC guard everything else.
 *
 * Lazily constructed (not a module-level singleton created unconditionally) so
 * that dev-mode — the default until `NEXT_PUBLIC_API_URL` is set — never pays
 * for or requires real Supabase credentials. Calling `getSupabaseClient()` in
 * dev mode is a bug; every call site must be gated behind `!isDevMode` first
 * (see `lib/dev/devMode.ts`).
 */
let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      "[lib/supabase/client] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. " +
        "This should only be reached when NEXT_PUBLIC_API_URL is also set (real-backend mode) — " +
        "check lib/dev/devMode.ts's isDevMode gate at the call site."
    );
  }

  client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: false, // the app manages its own persistence (see features/auth/authListeners.ts)
      autoRefreshToken: true,
      detectSessionInUrl: true, // needed for the password-recovery + OAuth redirect flows
    },
  });
  return client;
}
