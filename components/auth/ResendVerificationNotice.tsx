"use client";

import { useState } from "react";
import { useResendVerificationMutation } from "@/features/auth/authApi";
import { getErrorMessage } from "@/lib/utils/apiError";

/**
 * The "go check your email" state shared by RegisterForm (right after
 * signing up) and LoginForm (when login 403s because the account isn't
 * verified yet — see features/auth/types.ts's UnverifiedLoginError).
 *
 * Not part of the `frontend` branch's design — that branch's verify page
 * was a 6-digit OTP screen, which doesn't match TMT-BE-V1's real
 * verification (an emailed link the backend confirms server-side, not a
 * code the user types into this app). This fills the equivalent role using
 * the same card/typography language as the rest of app/auth.css.
 */
export function ResendVerificationNotice({ email }: { email: string }) {
  const [resendVerification, { isLoading }] = useResendVerificationMutation();
  const [result, setResult] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const handleResend = async () => {
    setResult(null);
    try {
      const response = await resendVerification({ email }).unwrap();
      setResult({ kind: "success", message: response.message });
    } catch (err) {
      setResult({ kind: "error", message: getErrorMessage(err as never) });
    }
  };

  return (
    <div className="auth-verify-notice">
      <p className="auth-verify-email">{email}</p>

      <button
        type="button"
        className="auth-submit-btn"
        onClick={handleResend}
        disabled={isLoading}
      >
        {isLoading ? <span className="auth-spinner" /> : "Resend verification email"}
      </button>

      {result && (
        <p className={result.kind === "success" ? "auth-success-text" : "auth-error-text"}>
          {result.message}
        </p>
      )}
    </div>
  );
}
