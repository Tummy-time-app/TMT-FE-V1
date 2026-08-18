import type { ReactNode } from "react";
import { AppleIcon, GoogleIcon, QrCodeIcon } from "@/components/icons";

function Divider({ label }: { label: string }) {
  return (
    <div className="my-5 flex items-center gap-4">
      <div className="h-px flex-1 bg-neutral-200" />
      <span className="text-xs text-neutral-500">{label}</span>
      <div className="h-px flex-1 bg-neutral-200" />
    </div>
  );
}

function SocialButton({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-3 rounded-lg bg-neutral-100 py-3.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
    >
      <span className="shrink-0">{icon}</span>
      {children}
    </button>
  );
}

export function AuthCard({
  heading,
  footer,
}: {
  heading: string;
  footer: ReactNode;
}) {
  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-medium text-neutral-900">{heading}</h1>

      <form className="mt-6">
        <label htmlFor="identifier" className="sr-only">
          Phone number or email
        </label>
        <input
          id="identifier"
          type="text"
          autoComplete="username"
          placeholder="Enter phone number or email"
          className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
        />
        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-neutral-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
        >
          Continue
        </button>
      </form>

      <Divider label="or" />

      <div className="space-y-3">
        <SocialButton icon={<GoogleIcon className="size-5" />}>
          Continue with Google
        </SocialButton>
        <SocialButton icon={<AppleIcon className="size-5" />}>
          Continue with Apple
        </SocialButton>
      </div>

      <Divider label="or" />

      <SocialButton icon={<QrCodeIcon className="size-5" />}>
        Log in with QR code
      </SocialButton>

      <p className="mt-6 text-xs leading-relaxed text-neutral-500">
        You consent to receive a verification code by text or WhatsApp.
        Message and data rates may apply.
      </p>

      <p className="mt-8 text-sm text-neutral-600">{footer}</p>
    </div>
  );
}
