/**
 * Guards against open-redirect vectors in `?redirect=` query params — only
 * an in-app, absolute path is ever allowed through.
 */
export function safeRedirectPath(path: string | null | undefined, fallback = "/"): string {
  if (!path) return fallback;
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}
