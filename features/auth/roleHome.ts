import type { UserRole } from "./types";

/**
 * Where a role lands after login when there's no `?redirect=` to honor.
 * Wired into LoginForm.tsx. /admin doesn't exist as a page in this branch
 * yet, so an admin login still falls through to "/" in practice.
 */
export function defaultRouteForRole(role: UserRole): string {
  switch (role) {
    case "restaurant_owner":
    case "vendor_owner":
    case "vendor_manager":
    case "vendor_kitchen":
    case "vendor_accountant":
      return "/vendor";
    case "admin":
      return "/admin";
    default:
      return "/";
  }
}
