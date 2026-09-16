"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/hooks";
import { useGetRiderProfileQuery } from "@/features/rider/riderProfileApi";
import type { UserRole } from "@/features/auth/types";

export const RIDER_ROLES: UserRole[] = ["rider"];

/**
 * Mirrors components/vendor-portal/useVendorGuard.ts exactly — bounces a
 * logged-out visitor to login, but a logged-in customer account isn't
 * bounced, just told this isn't a rider account (no PATCH /users/me exists
 * to change roles, same reasoning as the vendor guard). Additionally fetches
 * the rider's profile so RiderPortalShell can gate on verification status —
 * riders have that extra step vendors don't.
 */
export function useRiderGuard() {
  const router = useRouter();
  const { user, isAuthenticated, isSessionLoading } = useAuth();

  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.replace("/login?redirect=/rider");
    }
  }, [isSessionLoading, isAuthenticated, router]);

  const isRider = !!user && RIDER_ROLES.includes(user.role);

  const { data: riderProfile, isLoading: isLoadingProfile } = useGetRiderProfileQuery(user?.id ?? "", { skip: !isRider });

  return {
    user,
    isAuthenticated,
    isSessionLoading,
    isRider,
    riderProfile,
    isLoadingProfile,
    isReady: !isSessionLoading && isAuthenticated,
  };
}
