import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "@/components/icons";

export function OnboardingShell({
  step,
  totalSteps,
  onBack,
  children,
}: {
  /** 1-indexed current step. Omit (with totalSteps) to hide the progress bar entirely. */
  step?: number;
  totalSteps?: number;
  onBack?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center gap-4 px-4 py-5 sm:px-10">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="text-neutral-500 transition-colors hover:text-neutral-900"
          >
            <ArrowLeftIcon className="size-5" />
          </button>
        ) : (
          <div className="size-5" aria-hidden />
        )}
        <Image
          src="/tummytime-logo.png"
          alt="TummyTime"
          width={331}
          height={93}
          className="h-6 w-auto sm:h-7"
        />
      </header>

      {step && totalSteps ? (
        <div className="flex gap-1.5 px-4 sm:px-10">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < step ? "bg-neutral-900" : "bg-neutral-200"
              }`}
            />
          ))}
        </div>
      ) : null}

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
