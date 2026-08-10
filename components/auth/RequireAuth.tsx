"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks";
import type { UserRole } from "@/features/auth/types";
import { PageSpinner } from "@/components/feedback/PageSpinner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ShieldAlert } from "lucide-react";

interface RequireAuthProps {
  children: ReactNode;
  /** Restricts access to specific roles; any authenticated user is allowed if omitted. */
  allowedRoles?: UserRole[];
}

/**
 * Gates a route (or route group layout) behind an authenticated session.
 * Holds off rendering protected content until session restoration resolves
 * (spec §11 — never flash protected content before auth state is known),
 * then redirects unauthenticated users to /login with a `redirect` back-link.
 */
export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { isAuthenticated, isSessionLoading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isSessionLoading, isAuthenticated, pathname, router]);

  if (isSessionLoading) {
    return <PageSpinner label="Checking your session…" />;
  }

  if (!isAuthenticated) {
    // Redirect effect above is already firing; render nothing in the meantime.
    return null;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="You don't have access to this page"
        description="This area is restricted to a different account type."
        action={{ label: "Go home", onClick: () => router.replace("/") }}
      />
    );
  }

  return <>{children}</>;
}
