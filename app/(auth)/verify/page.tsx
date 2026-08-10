"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { useResendOtpMutation, useVerifyOtpMutation } from "@/features/auth/authApi";
import { setCredentials } from "@/features/auth/authSlice";
import { otpSchema } from "@/features/auth/schemas";
import { normalizeApiError } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

function VerifyEmailForm() {
  const email = useSearchParams().get("email") ?? "";
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const focusNext = (index: number) => {
    if (index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const focusPrev = (index: number) => {
    if (index > 0) inputs.current[index - 1]?.focus();
  };

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value) focusNext(index);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const next = [...otp];
        next[index] = "";
        setOtp(next);
      } else {
        focusPrev(index);
      }
    } else if (e.key === "ArrowLeft") {
      focusPrev(index);
    } else if (e.key === "ArrowRight") {
      focusNext(index);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...otp];
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setOtp(next);
    const lastIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputs.current[lastIndex]?.focus();
  };

  const handleConfirm = async () => {
    const code = otp.join("");
    const result = otpSchema.safeParse({ code });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Please enter all 6 digits.");
      return;
    }

    setError("");
    try {
      const response = await verifyOtp({ email, code }).unwrap();
      dispatch(setCredentials(response));
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push("/");
      }, 1200);
    } catch (err) {
      setError(normalizeApiError(err as never).message);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      await resendOtp({ email }).unwrap();
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setError("");
    } catch (err) {
      setError(normalizeApiError(err as never).message);
    }
  };

  const isFilled = otp.every((d) => d !== "");

  if (!email) {
    return (
      <div className="auth-root">
        <div className="auth-bg" />
        <div className="auth-card">
          <Image
            src="/images/logo/tummytime-logo.png"
            alt="TummyTime"
            width={200}
            height={150}
            priority
            className="auth-logo-img"
          />
          <h1 className="auth-heading" style={{ color: "#1A1A1A" }}>
            Nothing to verify
          </h1>
          <p className="auth-subtext">Create an account first to get a verification code.</p>
          <Link href="/register" className="auth-submit-btn" style={{ textDecoration: "none" }}>
            Go to registration
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-root">
      <div className="auth-bg" />

      <div className="auth-card">
        <Image
          src="/images/logo/tummytime-logo.png"
          alt="TummyTime"
          width={200}
          height={150}
          priority
          className="auth-logo-img"
        />

        <h1 className="auth-heading" style={{ color: "#1A1A1A" }}>
          Verify Email Address
        </h1>
        <p className="auth-subtext" style={{ maxWidth: 280 }}>
          Enter the six digit code sent to <span className="auth-confirm-email">{email}</span>
        </p>

        <div className={cn("auth-otp-row", error && "auth-otp-row--invalid")}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              className={`auth-otp-box${digit ? " auth-otp-box--filled" : ""}`}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        <div className="auth-resend-row">
          <span>Didn&apos;t get a code?</span>
          <button
            type="button"
            className="auth-resend-btn"
            onClick={handleResend}
            disabled={isResending || cooldown > 0}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : isResending ? "Sending…" : "Resend"}
          </button>
        </div>

        <button
          type="button"
          className="auth-submit-btn"
          onClick={handleConfirm}
          disabled={!isFilled || isLoading}
          style={{ marginBottom: 20 }}
        >
          {isLoading ? <span className="auth-spinner" /> : "Confirm code"}
        </button>

        {error && <p className="auth-error-text">{error}</p>}

        {showSuccess && (
          <div className="auth-modal-overlay">
            <div className="auth-success-modal">
              <h2>Success!</h2>
              <p>Your email has been verified. Redirecting…</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="auth-root" />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
