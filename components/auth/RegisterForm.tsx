"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRegisterMutation } from "@/features/auth/authApi";
import { registerSchema, type RegisterFormValues } from "@/features/auth/schemas";
import type { RegisterPayload } from "@/features/auth/types";
import { normalizeApiError } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";
import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { ResendVerificationNotice } from "./ResendVerificationNotice";

/**
 * Ported from the `frontend` branch's app/(auth)/register/page.tsx —
 * markup, field set, and the show/hide password eye button kept faithful
 * (see app/auth.css). Deliberate departures:
 *
 * 1. Real react-hook-form + zod validation and a real useRegisterMutation
 *    call in place of the source's local useState fields and a
 *    `setTimeout` that faked success — the source had no backend at all.
 * 2. Registration never logs the user in. TMT-BE-V1's user-service now
 *    requires email verification (added after this app was first wired up
 *    — see authApi.ts's doc comment): every register response is
 *    `{message, requiresVerification: true, user}` with no session, so on
 *    success this swaps to a "check your email" state instead of
 *    dispatching credentials and redirecting. The source's OTP-code verify
 *    page doesn't apply — TMT-BE-V1 confirms via an emailed link, not a
 *    code typed into this app.
 */
export function RegisterForm({
  role = "customer",
  redirectTo,
  heading = "Create your account",
}: {
  /** Defaults to "customer" — pass "restaurant_owner" from the vendor signup page. */
  role?: RegisterPayload["role"];
  /** Where the post-verification login link should eventually send them. */
  redirectTo?: string;
  heading?: string;
}) {
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const { confirmPassword: _confirmPassword, ...rest } = values;
      await registerUser({ ...rest, role }).unwrap();
      setSubmittedEmail(values.email);
    } catch (err) {
      setError("root", { message: normalizeApiError(err as never).message });
    }
  };

  if (submittedEmail) {
    const loginHref = redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login";
    return (
      <>
        <h1 className="auth-heading">Check your email</h1>
        <p className="auth-subtext">
          We sent a verification link to the address below. Click it to activate your account,
          then log in.
        </p>

        <ResendVerificationNotice email={submittedEmail} />

        <p className="auth-footer-text">
          Wrong email?{" "}
          <button type="button" className="auth-footer-link" onClick={() => setSubmittedEmail(null)}>
            Go back
          </button>
        </p>
        <p className="auth-footer-text">
          Already verified?{" "}
          <Link href={loginHref} className="auth-footer-link">
            Log in
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="auth-heading">{heading}</h1>
      <p className="auth-subtext">Create an account to get started</p>

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="auth-field">
          <label htmlFor="name" className="auth-label">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="John Doe"
            aria-invalid={!!errors.name}
            className={cn("auth-input", errors.name && "auth-input--invalid")}
            {...register("name")}
          />
          {errors.name && <p className="auth-error-text">{errors.name.message}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="email" className="auth-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            className={cn("auth-input", errors.email && "auth-input--invalid")}
            {...register("email")}
          />
          {errors.email && <p className="auth-error-text">{errors.email.message}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="phone" className="auth-label">
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 (555) 000-0000"
            aria-invalid={!!errors.phone}
            className={cn("auth-input", errors.phone && "auth-input--invalid")}
            {...register("phone")}
          />
          {errors.phone && <p className="auth-error-text">{errors.phone.message}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="password" className="auth-label">
            Password
          </label>
          <div className="auth-input-wrap">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              className={cn("auth-input", errors.password && "auth-input--invalid")}
              {...register("password")}
            />
            <button
              type="button"
              className="auth-eye-btn"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon className="size-[18px]" /> : <EyeIcon className="size-[18px]" />}
            </button>
          </div>
          {errors.password && <p className="auth-error-text">{errors.password.message}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="confirmPassword" className="auth-label">
            Confirm password
          </label>
          <div className="auth-input-wrap">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={!!errors.confirmPassword}
              className={cn("auth-input", errors.confirmPassword && "auth-input--invalid")}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              className="auth-eye-btn"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <EyeOffIcon className="size-[18px]" />
              ) : (
                <EyeIcon className="size-[18px]" />
              )}
            </button>
          </div>
          {errors.confirmPassword && <p className="auth-error-text">{errors.confirmPassword.message}</p>}
        </div>

        {errors.root && <p className="auth-error-text">{errors.root.message}</p>}

        <button type="submit" disabled={isLoading} className="auth-submit-btn">
          {isLoading ? <span className="auth-spinner" /> : "Create account"}
        </button>
      </form>

      <p className="auth-footer-text">
        Already have an account?{" "}
        <Link href="/login" className="auth-footer-link">
          Log in
        </Link>
      </p>
    </>
  );
}
