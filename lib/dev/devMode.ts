import { env } from "@/config/env";

const isProduction = process.env.NODE_ENV === "production";

/**
 * True once ANY real backend endpoint is configured — the gateway
 * (NEXT_PUBLIC_API_URL) or at least one of the per-service URLs
 * store/api/baseApi.ts can route directly to. A deployment that's moved
 * fully to direct-service URLs and dropped the gateway var entirely still
 * counts as "configured" here.
 */
const hasBackendConfigured = Boolean(
  env.apiUrl || env.userServiceUrl || env.restaurantServiceUrl || env.orderServiceUrl || env.notificationServiceUrl
);

/**
 * True when there is no real backend to talk to, so RTK Query endpoints
 * should route through the dev mock adapter (see lib/mocks/) instead of
 * making a real network request.
 *
 * This is the ONE place that decides mock-vs-real. Feature API slices
 * should branch on this flag rather than each inventing their own check,
 * so switching to a live backend later only ever means setting the
 * relevant NEXT_PUBLIC_*_URL var(s) and deleting this file's mock imports
 * feature by feature — never a scattered find-and-replace.
 *
 * No backend configured only falls back to mocks in non-production builds
 * (local dev / preview). In production it must NOT silently fall back to
 * the mock adapter's localStorage-backed data — see
 * `isApiUrlMissingInProduction` below, which baseApi uses to surface a
 * real error instead.
 */
export const isDevMode = env.useMocks || (!hasBackendConfigured && !isProduction);

/**
 * True when running a production build with no backend endpoint configured
 * at all (and mocks aren't explicitly forced on). baseApi checks this and
 * short-circuits every request with a clear config error rather than either
 * hitting a broken relative URL or quietly reading/writing mock data in
 * localStorage.
 */
export const isApiUrlMissingInProduction = isProduction && !hasBackendConfigured && !env.useMocks;

/** Simulates realistic network latency for mock responses. */
export function mockDelay(ms = 500 + Math.random() * 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
