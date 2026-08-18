import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "@/components/icons";

export function ProfileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-5 sm:px-10">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            aria-label="Back home"
            className="text-neutral-500 transition-colors hover:text-neutral-900"
          >
            <ArrowLeftIcon className="size-5" />
          </Link>
          <Image
            src="/tummytime-logo.png"
            alt="TummyTime"
            width={331}
            height={93}
            className="h-6 w-auto sm:h-7"
          />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-10">{children}</main>
    </div>
  );
}
