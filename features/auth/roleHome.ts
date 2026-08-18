import type { UserRole } from "./types";

/**
 * Where a role lands after login when there's no `?redirect=` to honor.
 * Not wired into LoginForm yet — none of /vendor or /admin exist as pages
 * in this branch, so login always sends everyone to "/" for now. Kept
 * up to date with TMT-BE-V1's actual role set for when those areas exist.
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
