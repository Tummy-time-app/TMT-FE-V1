"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegisterMutation } from "@/features/auth/authApi";
import { registerSchema, type RegisterFormValues } from "@/features/auth/schemas";
import { normalizeApiError } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const response = await registerUser({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      }).unwrap();
      router.push(`/verify?email=${encodeURIComponent(response.user.email)}`);
    } catch (err) {
      const { message, fieldErrors } = normalizeApiError(err as never);
      if (fieldErrors?.email) {
        setError("email", { message: fieldErrors.email[0] });
      } else {
        setError("root", { message });
      }
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
          height={100}
          priority
          className="auth-logo-img"
        />

        <h1 className="auth-heading">
          <span className="auth-heading-welcome">Welcome</span>
        </h1>

        <p className="auth-subtext">Create an account to get started</p>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="auth-field">
            <label htmlFor="name" className="auth-label">
              Username
            </label>
            <input
              id="name"
              type="text"
              className={cn("auth-input", errors.name && "auth-input--invalid")}
              placeholder="johndoe"
              autoComplete="username"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && <p className="auth-field-error">{errors.name.message}</p>}
          </div>

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
            <label htmlFor="phone" className="auth-label">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              className={cn("auth-input", errors.phone && "auth-input--invalid")}
              placeholder="+234 800 000 0000"
              autoComplete="tel"
              aria-invalid={!!errors.phone}
              {...register("phone")}
            />
            {errors.phone && <p className="auth-field-error">{errors.phone.message}</p>}
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
              Confirm Password
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

          <button
            type="submit"
            className={`auth-submit-btn${isLoading ? " auth-submit-btn--loading" : ""}`}
            disabled={isLoading}
            aria-busy={isLoading}
            aria-label={isLoading ? "Creating account…" : undefined}
          >
            {isLoading ? <span className="auth-spinner" /> : "Create Account"}
          </button>

          {errors.root && <p className="auth-error-text">{errors.root.message}</p>}
        </form>

        <p className="auth-switch-text">
          Already have an account ?{" "}
          <Link href="/login" className="auth-switch-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
