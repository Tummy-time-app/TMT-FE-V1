"use client";

import Link from "next/link";
import { ExternalLinkIcon } from "@/components/icons";
import { useAuth } from "@/features/auth/hooks";

/** "Become a rider" / Log in / Sign up — pre-auth marketing + entry points, hidden once signed in. */
export function HeroAuthNav() {
  const { isAuthenticated, isSessionLoading } = useAuth();

  // Hide during the boot-time session check too, so a returning signed-in
  // user never sees these flash on before disappearing.
  if (isSessionLoading || isAuthenticated) return null;

  return (
    <nav className="flex items-center gap-2 sm:gap-5">
      <Link
        href="/riders"
        className="hidden items-center gap-1.5 text-sm font-medium text-neutral-900 hover:underline sm:flex"
      >
        Become a rider
        <ExternalLinkIcon className="size-3.5" />
      </Link>
      <Link
        href="/login"
        className="rounded-full bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-neutral-900 shadow-sm shadow-black/5 transition-colors hover:bg-neutral-100 sm:px-5 sm:py-2.5"
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-neutral-800 sm:px-5 sm:py-2.5"
      >
        Sign up
      </Link>
    </nav>
  );
}
