"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { setCredentials } from "@/features/auth/authSlice";
import { useLoginMutation } from "@/features/auth/authApi";
import { defaultRouteForRole } from "@/features/auth/roleHome";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";
import { normalizeApiError } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";
import { safeRedirectPath } from "@/lib/utils/safeRedirect";
import { useAppDispatch } from "@/store/hooks";
import { AuthSocialButtons } from "./AuthSocialButtons";

const fieldClass =
  "w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none";
const fieldInvalidClass = "border-red-400 focus:border-red-500 focus:ring-red-500";

export function LoginForm() {
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
      // /vendor now exists (see features/auth/roleHome.ts) — a restaurant
      // owner lands there by default; everyone else still goes home. An
      // explicit ?redirect= (e.g. from a route guard) always wins.
      router.push(
        safeRedirectPath(searchParams.get("redirect"), defaultRouteForRole(response.user.role)),
      );
    } catch (err) {
      setError("root", { message: normalizeApiError(err as never).message });
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-medium text-neutral-900">Welcome back</h1>

      <form
        className="mt-6 space-y-4"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div>
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            aria-invalid={!!errors.email}
            className={cn(fieldClass, errors.email && fieldInvalidClass)}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            aria-invalid={!!errors.password}
            className={cn(fieldClass, errors.password && fieldInvalidClass)}
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {errors.root && (
          <p className="text-sm text-red-600">{errors.root.message}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-neutral-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Signing in…" : "Log in"}
        </button>
      </form>

      <AuthSocialButtons />

      <p className="mt-8 text-center text-sm text-neutral-600">
        New to TummyTime?{" "}
        <Link
          href="/signup"
          className="font-semibold text-neutral-900 underline underline-offset-2"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
