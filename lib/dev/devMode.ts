import { env } from "@/config/env";

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
 */
export const isDevMode = env.useMocks || !env.apiUrl;

/** Simulates realistic network latency for mock responses. */
export function mockDelay(ms = 500 + Math.random() * 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
