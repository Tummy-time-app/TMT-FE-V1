import type { UserRole } from "./types";

/** Where a role lands after login when there's no `?redirect=` to honor. */
export function defaultRouteForRole(role: UserRole): string {
  switch (role) {
    case "vendor":
      return "/vendor";
    case "rider":
      return "/rider";
    case "admin":
    case "super_admin":
      return "/admin";
    default:
      return "/";
  }
}
