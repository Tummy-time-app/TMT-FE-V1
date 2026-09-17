import type { UserRole } from "./types";

/**
 * Where a role lands after login when there's no `?redirect=` to honor.
 * Wired into LoginForm.tsx.
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
    case "rider":
      return "/rider";
    default:
      return "/";
  }
}
