"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { setCredentials } from "@/features/auth/authSlice";
import { useLoginMutation } from "@/features/auth/authApi";
import { defaultRouteForRole } from "@/features/auth/roleHome";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";
import type { UnverifiedLoginError } from "@/features/auth/types";
import { normalizeApiError } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";
import { safeRedirectPath } from "@/lib/utils/safeRedirect";
import { useAppDispatch } from "@/store/hooks";
import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { ResendVerificationNotice } from "./ResendVerificationNotice";

/**
 * Ported from the `frontend` branch's app/(auth)/login/page.tsx — markup,
 * field set, and the show/hide password eye button kept faithful (see
 * app/auth.css). Deliberate departures:
 *
 * 1. Real react-hook-form + zod validation and a real useLoginMutation call
 *    in place of the source's local useState fields and a `setTimeout`
 *    that faked success — the source had no backend at all, and its
 *    success-modal-then-redirect never showed a real error either.
 * 2. Handles the 403 UnverifiedLoginError TMT-BE-V1 now sends when the
 *    account hasn't clicked its verification email yet (see authApi.ts's
 *    doc comment) — swaps to the same "resend the link" state
 *    RegisterForm uses, instead of surfacing it as a generic error.
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await login(values).unwrap();
      dispatch(setCredentials(response));
      // /vendor now exists (see features/auth/roleHome.ts) — a restaurant
      // owner lands there by default; everyone else still goes home. An
      // explicit ?redirect= (e.g. from a route guard) always wins.
      router.push(
        safeRedirectPath(searchParams.get("redirect"), defaultRouteForRole(response.user.role)),
      );
    } catch (err) {
      const data = (err as { data?: Partial<UnverifiedLoginError> } | undefined)?.data;
      if (data?.requiresVerification) {
        setUnverifiedEmail(data.email ?? values.email);
        return;
      }
      setError("root", { message: normalizeApiError(err as never).message });
    }
  };

  if (unverifiedEmail) {
    return (
      <>
        <h1 className="auth-heading">Verify your email</h1>
        <p className="auth-subtext">
          This account hasn&apos;t been verified yet. We can resend the verification link below.
        </p>

        <ResendVerificationNotice email={unverifiedEmail} />

        <p className="auth-footer-text">
          <button type="button" className="auth-footer-link" onClick={() => setUnverifiedEmail(null)}>
            Back to login
          </button>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="auth-heading">Welcome back</h1>
      <p className="auth-subtext">Sign in to your account to continue</p>

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
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
          <label htmlFor="password" className="auth-label">
            Password
          </label>
          <div className="auth-input-wrap">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
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

        <div className="auth-forgot-wrap">
          <Link href="/forgot-password" className="auth-forgot-link">
            Forgot password?
          </Link>
        </div>

        {errors.root && <p className="auth-error-text">{errors.root.message}</p>}

        <button type="submit" disabled={isLoading} className="auth-submit-btn">
          {isLoading ? <span className="auth-spinner" /> : "Log in"}
        </button>
      </form>

      <p className="auth-footer-text">
        New to TummyTime?{" "}
        <Link href="/signup" className="auth-footer-link">
          Sign up
        </Link>
      </p>
    </>
  );
}
