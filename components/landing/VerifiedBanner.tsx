"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CloseIcon } from "@/components/icons";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_or_expired_token: "That verification link is invalid or has expired.",
};

/**
 * Shows the outcome of clicking an emailed verification link. TMT-BE-V1's
 * GET /users/verify-email confirms the token server-side and redirects the
 * browser straight to `${FRONTEND_URL}/?verified=true` or
 * `?verified=false&error=...` — no frontend route ever calls that endpoint
 * directly (see features/auth/authApi.ts's doc comment), so "/" is the only
 * place that can react to the outcome. New here, not ported from the
 * `frontend` branch (its verify page assumed an in-app OTP flow instead).
 */
export function VerifiedBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  const verified = searchParams.get("verified");
  if (!verified || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    // Drop ?verified=/&error= from the URL so a refresh or back-navigation
    // doesn't keep re-showing this.
    router.replace(pathname, { scroll: false });
  };

  if (verified === "true") {
    return (
      <div className="verified-banner verified-banner--success" role="status">
        <span>
          Your email has been verified —{" "}
          <Link href="/login" className="verified-banner__link">
            log in
          </Link>{" "}
          to continue.
        </span>
        <button type="button" className="verified-banner__dismiss" onClick={dismiss} aria-label="Dismiss">
          <CloseIcon className="size-4" />
        </button>
      </div>
    );
  }

  const errorCode = searchParams.get("error") ?? "";
  const message = ERROR_MESSAGES[errorCode] ?? "We couldn't verify your email.";

  return (
    <div className="verified-banner verified-banner--error" role="alert">
      <span>
        {message}{" "}
        <Link href="/login" className="verified-banner__link">
          Log in
        </Link>{" "}
        to request a new link.
      </span>
      <button type="button" className="verified-banner__dismiss" onClick={dismiss} aria-label="Dismiss">
        <CloseIcon className="size-4" />
      </button>
    </div>
  );
}
