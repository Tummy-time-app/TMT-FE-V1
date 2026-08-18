"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/hooks";
import type { UserRole } from "@/features/auth/types";

export const VENDOR_ROLES: UserRole[] = [
  "restaurant_owner",
  "vendor_owner",
  "vendor_manager",
  "vendor_kitchen",
  "vendor_accountant",
];

/**
 * Shared by every /vendor page: bounces a logged-out visitor to login
 * (same pattern as onboarding/orders), but — unlike those — a logged-in
 * customer account isn't bounced, just told this isn't a vendor account.
 * There's no way to change roles after registration (no PATCH /users/me
 * on TMT-BE-V1 at all), so a customer genuinely needs a separate vendor
 * account, not a redirect loop.
 */
export function useVendorGuard() {
  const router = useRouter();
  const { user, isAuthenticated, isSessionLoading } = useAuth();

  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.replace("/login?redirect=/vendor");
    }
  }, [isSessionLoading, isAuthenticated, router]);

  const isVendor = !!user && VENDOR_ROLES.includes(user.role);

  return {
    user,
    isAuthenticated,
    isSessionLoading,
    isVendor,
    isReady: !isSessionLoading && isAuthenticated,
  };
}
