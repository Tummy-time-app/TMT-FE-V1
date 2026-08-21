import { env } from "@/config/env";

const isProduction = process.env.NODE_ENV === "production";

/**
 * True when there is no real backend to talk to, so RTK Query endpoints
 * should route through the dev mock adapter (see lib/mocks/) instead of
 * making a real network request.
 *
 * This is the ONE place that decides mock-vs-real. Feature API slices
 * should branch on this flag rather than each inventing their own check,
 * so switching to a live backend later only ever means setting
 * NEXT_PUBLIC_API_URL and deleting this file's mock imports feature by
 * feature — never a scattered find-and-replace.
 *
 * A missing NEXT_PUBLIC_API_URL only falls back to mocks in non-production
 * builds (local dev / preview). In production it must NOT silently fall
 * back to the mock adapter's localStorage-backed data — see
 * `isApiUrlMissingInProduction` below, which baseApi uses to surface a
 * real error instead.
 */
export const isDevMode = env.useMocks || (!env.apiUrl && !isProduction);

/**
 * True when running a production build with no API URL configured (and
 * mocks aren't explicitly forced on). baseApi checks this and short-
 * circuits every request with a clear config error rather than either
 * hitting a broken relative URL or quietly reading/writing mock data in
 * localStorage.
 */
export const isApiUrlMissingInProduction = isProduction && !env.apiUrl && !env.useMocks;

/** Simulates realistic network latency for mock responses. */
export function mockDelay(ms = 500 + Math.random() * 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
