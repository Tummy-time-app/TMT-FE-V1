"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { useRequestPasswordResetMutation } from "@/features/auth/authApi";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/features/auth/schemas";
import { normalizeApiError } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [requestReset, { isLoading }] = useRequestPasswordResetMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await requestReset(values).unwrap();
      setSentTo(values.email);
    } catch (err) {
      setError("root", { message: normalizeApiError(err as never).message });
    }
  };

  if (sentTo) {
    return (
      <div className="auth-root">
        <div className="auth-bg" />
        <div className="auth-card">
          <div className="auth-confirm-icon">
            <MailCheck size={28} aria-hidden />
          </div>
          <h1 className="auth-heading" style={{ color: "#1A1A1A" }}>
            Check your email
          </h1>
          <p className="auth-subtext">
            If an account exists for <span className="auth-confirm-email">{sentTo}</span>, we&apos;ve sent a link to
            reset your password.
          </p>
          <Link href="/login" className="auth-submit-btn" style={{ textDecoration: "none" }}>
            Back to login
          </Link>
          <p className="auth-switch-text">
            Wrong email?{" "}
            <button type="button" className="auth-switch-link" style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setSentTo(null)}>
              Try again
            </button>
          </p>
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
          Forgot password?
        </h1>
        <p className="auth-subtext">Enter your email and we&apos;ll send you a reset link.</p>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="auth-field">
            <label htmlFor="email" className="auth-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={cn("auth-input", errors.email && "auth-input--invalid")}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && <p className="auth-field-error">{errors.email.message}</p>}
          </div>

          <button type="submit" className={`auth-submit-btn${isLoading ? " auth-submit-btn--loading" : ""}`} disabled={isLoading}>
            {isLoading ? <span className="auth-spinner" /> : "Send reset link"}
          </button>

          {errors.root && <p className="auth-error-text">{errors.root.message}</p>}
        </form>

        <p className="auth-switch-text">
          Remembered your password?{" "}
          <Link href="/login" className="auth-switch-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
