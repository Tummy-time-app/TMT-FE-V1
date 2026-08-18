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

/** Decorative — not wired to a real provider yet. Shared between the login and register forms. */
export function AuthSocialButtons() {
  return (
    <>
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
    </>
  );
}
