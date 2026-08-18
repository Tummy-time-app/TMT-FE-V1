"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  AndroidIcon,
  AppleIcon,
  CloseIcon,
} from "@/components/icons";

const links = [
  { href: "/business", label: "Create a business account" },
  { href: "/vendors/apply", label: "Add your restaurant" },
  { href: "/riders", label: "Become a rider" },
  { href: "/help", label: "Help Center" },
];

export function SideNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Portal target isn't available during SSR/first render — mount after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  // Rendered via portal so the drawer's fixed positioning/z-index always
  // stacks against the viewport, instead of getting trapped inside an
  // ancestor's stacking context (e.g. the hero section's `isolate`).
  return createPortal(
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col overflow-y-auto bg-white p-6 shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute top-5 right-5 text-neutral-500 transition-colors hover:text-neutral-900"
        >
          <CloseIcon className="size-6" />
        </button>

        <div className="mt-12 flex flex-col gap-3">
          <Link
            href="/signup"
            onClick={onClose}
            className="rounded-full bg-neutral-900 py-3.5 text-center text-base font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            Sign up
          </Link>
          <Link
            href="/login"
            onClick={onClose}
            className="rounded-full bg-neutral-100 py-3.5 text-center text-base font-semibold text-neutral-900 transition-colors hover:bg-neutral-200"
          >
            Log in
          </Link>
        </div>

        <nav className="mt-8 flex flex-col gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="text-base font-medium text-neutral-900 hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="mt-3 flex gap-3">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-neutral-100 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
          >
            <AppleIcon className="size-4" />
            iPhone
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-neutral-100 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
          >
            <AndroidIcon className="size-4" />
            Android
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
