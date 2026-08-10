"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "@/store/hooks";
import { useLoginMutation } from "@/features/auth/authApi";
import { setCredentials } from "@/features/auth/authSlice";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";
import { normalizeApiError } from "@/lib/utils/apiError";
import { safeRedirectPath } from "@/lib/utils/safeRedirect";
import { cn } from "@/lib/utils/cn";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

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
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        if (!response.user.emailVerified) {
          router.push(`/verify?email=${encodeURIComponent(response.user.email)}`);
          return;
        }
        router.push(safeRedirectPath(searchParams.get("redirect")));
      }, 1000);
    } catch (err) {
      const { message } = normalizeApiError(err as never);
      setError("root", { message });
    }
  };

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

        <h1 className="auth-heading">
          <span className="auth-heading-welcome">Welcome</span>{" "}
          <span className="auth-heading-back">back</span>
        </h1>

        <p className="auth-subtext">Sign in to your account to continue</p>

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

          <div className="auth-field">
            <label htmlFor="password" className="auth-label">
              Password
            </label>
            <div className="auth-input-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={cn("auth-input", errors.password && "auth-input--invalid")}
                placeholder="••••••••"
                autoComplete="current-password"
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

          <div className="auth-forgot-wrap">
            <Link href="/forgot-password" className="auth-forgot-link">
              Forgot password ?
            </Link>
          </div>

          <button
            type="submit"
            className={`auth-submit-btn${isLoading ? " auth-submit-btn--loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? <span className="auth-spinner" /> : "Login"}
          </button>

          {errors.root && <p className="auth-error-text">{errors.root.message}</p>}

          {showSuccess && (
            <div className="auth-modal-overlay">
              <div className="auth-success-modal">
                <h2>Login Successful</h2>
                <p>Redirecting…</p>
              </div>
            </div>
          )}
        </form>

        <p className="auth-switch-text">
          No account yet ?{" "}
          <Link href="/register" className="auth-switch-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-root" />}>
      <LoginForm />
    </Suspense>
  );
}
