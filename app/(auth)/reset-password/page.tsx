"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "@/store/hooks";
import { useResetPasswordMutation } from "@/features/auth/authApi";
import { setCredentials } from "@/features/auth/authSlice";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/features/auth/schemas";
import { normalizeApiError } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";

function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      const response = await resetPassword({ token, password: values.password }).unwrap();
      dispatch(setCredentials(response));
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push("/");
      }, 1200);
    } catch (err) {
      setError("root", { message: normalizeApiError(err as never).message });
    }
  };

  if (!token) {
    return (
      <div className="auth-root">
        <div className="auth-bg" />
        <div className="auth-card">
          <Image
            src="/images/logo/tummytime-logo.png"
            alt="TummyTime"
            width={200}
            height={50}
            priority
            className="auth-logo-img"
          />
          <h1 className="auth-heading" style={{ color: "#1A1A1A" }}>
            Invalid reset link
          </h1>
          <p className="auth-subtext">This password reset link is missing or malformed.</p>
          <Link href="/forgot-password" className="auth-submit-btn" style={{ textDecoration: "none" }}>
            Request a new link
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
          height={50}
          priority
          className="auth-logo-img"
        />

        <h1 className="auth-heading" style={{ color: "#1A1A1A" }}>
          Set a new password
        </h1>
        <p className="auth-subtext">Choose a strong password you haven&apos;t used before.</p>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="auth-field">
            <label htmlFor="password" className="auth-label">
              New password
            </label>
            <div className="auth-input-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={cn("auth-input", errors.password && "auth-input--invalid")}
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="auth-field-error">{errors.password.message}</p>}
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword" className="auth-label">
              Confirm new password
            </label>
            <div className="auth-input-wrap">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className={cn("auth-input", errors.confirmPassword && "auth-input--invalid")}
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="auth-field-error">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" className={`auth-submit-btn${isLoading ? " auth-submit-btn--loading" : ""}`} disabled={isLoading}>
            {isLoading ? <span className="auth-spinner" /> : "Reset password"}
          </button>

          {errors.root && <p className="auth-error-text">{errors.root.message}</p>}

          {showSuccess && (
            <div className="auth-modal-overlay">
              <div className="auth-success-modal">
                <h2>Password updated</h2>
                <p>Redirecting…</p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="auth-root" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
