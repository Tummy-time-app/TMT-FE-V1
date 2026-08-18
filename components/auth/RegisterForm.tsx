"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { setCredentials } from "@/features/auth/authSlice";
import { useRegisterMutation } from "@/features/auth/authApi";
import { registerSchema, type RegisterFormValues } from "@/features/auth/schemas";
import { normalizeApiError } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";
import { useAppDispatch } from "@/store/hooks";
import { AuthSocialButtons } from "./AuthSocialButtons";

const fieldClass =
  "w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none";
const fieldInvalidClass = "border-red-400 focus:border-red-500 focus:ring-red-500";

export function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const { confirmPassword: _confirmPassword, ...payload } = values;
      const response = await registerUser(payload).unwrap();
      if (response.session) dispatch(setCredentials({ user: response.user, session: response.session }));
      // Real/dev-mode mock both set `requiresVerification` when the backend
      // would gate on an emailed OTP (see authApi.ts's register endpoint) —
      // frontend routes to a /verify screen at that point. This branch
      // doesn't have that screen yet, so every signup goes straight into
      // onboarding regardless; add the OTP step back here once /verify exists.
      router.push("/onboarding");
    } catch (err) {
      setError("root", { message: normalizeApiError(err as never).message });
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-medium text-neutral-900">
        Create your account
      </h1>

      <form
        className="mt-6 space-y-4"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div>
          <label htmlFor="name" className="sr-only">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Full name"
            aria-invalid={!!errors.name}
            className={cn(fieldClass, errors.name && fieldInvalidClass)}
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

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
          <label htmlFor="phone" className="sr-only">
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Phone number"
            aria-invalid={!!errors.phone}
            className={cn(fieldClass, errors.phone && fieldInvalidClass)}
            {...register("phone")}
          />
          {errors.phone && (
            <p className="mt-1.5 text-xs text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Password"
            aria-invalid={!!errors.password}
            className={cn(fieldClass, errors.password && fieldInvalidClass)}
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="sr-only">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm password"
            aria-invalid={!!errors.confirmPassword}
            className={cn(fieldClass, errors.confirmPassword && fieldInvalidClass)}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {errors.root && (
          <p className="text-sm text-red-600">{errors.root.message}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-neutral-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <AuthSocialButtons />

      <p className="mt-8 text-center text-sm text-neutral-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-neutral-900 underline underline-offset-2"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
