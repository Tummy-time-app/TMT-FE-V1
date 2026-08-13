import Link from "next/link";
import { Phone, Send, LifeBuoy } from "@/components/icons";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-h1 font-bold text-text">Contact us</h1>
      <p className="mt-1 text-small text-text-muted">We&apos;re here to help with orders, accounts, or anything else.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Phone size={17} aria-hidden />
          </span>
          <p className="mt-3 text-small font-semibold text-text">Call or WhatsApp</p>
          <p className="mt-1 text-small text-text-muted">+234 800 123 4567</p>
          <p className="text-caption text-text-subtle">7am – 11pm, every day</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Send size={17} aria-hidden />
          </span>
          <p className="mt-3 text-small font-semibold text-text">Email</p>
          <p className="mt-1 text-small text-text-muted">hello@tummytime.dev</p>
          <p className="text-caption text-text-subtle">We reply within a day</p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LifeBuoy size={20} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-small font-semibold text-text">Already have an order or account issue?</p>
          <p className="mt-0.5 text-caption text-text-muted">
            Open a support ticket and track the conversation with our team from your account.
          </p>
        </div>
        <Link
          href="/support"
          className="shrink-0 rounded-md bg-primary px-4 py-2 text-caption font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Go to support
        </Link>
      </div>
    </main>
  );
}
