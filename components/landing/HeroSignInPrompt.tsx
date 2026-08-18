"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/hooks";

/** "Or Sign In" — pointless once you already are. */
export function HeroSignInPrompt() {
  const { isAuthenticated, isSessionLoading } = useAuth();

  if (isSessionLoading || isAuthenticated) return null;

  return (
    <p className="mt-5 text-sm text-neutral-800">
      Or{" "}
      <Link href="/login" className="font-semibold underline underline-offset-2">
        Sign In
      </Link>
    </p>
  );
}
