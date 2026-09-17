"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/hooks";
import type { UserRole } from "@/features/auth/types";

export const ADMIN_ROLES: UserRole[] = ["admin"];

/**
 * Mirrors components/rider-portal/useRiderGuard.ts / components/vendor-portal/
 * useVendorGuard.ts, minus the verification-status branch (doesn't apply to
 * admin accounts) — admin accounts aren't self-service (see auth.ts's
 * ALLOWED_ROLES, which deliberately excludes "admin"), so there's no
 * equivalent of a rider's "pending" state and no "Become an admin" CTA to
 * offer a logged-in non-admin.
 */
export function useAdminGuard() {
  const router = useRouter();
  const { user, isAuthenticated, isSessionLoading } = useAuth();

  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.replace("/login?redirect=/admin");
    }
  }, [isSessionLoading, isAuthenticated, router]);

  const isAdmin = !!user && ADMIN_ROLES.includes(user.role);

  return {
    user,
    isAuthenticated,
    isSessionLoading,
    isAdmin,
    isReady: !isSessionLoading && isAuthenticated,
  };
}
