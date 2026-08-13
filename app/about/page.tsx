import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-h1 font-bold text-text">About TummyTime</h1>
      <p className="mt-3 text-small leading-relaxed text-text-muted">
        TummyTime connects you with restaurants, shops, and local markets near you — fast delivery or easy pickup,
        whichever fits your day. We started with a simple idea: ordering food should feel as good as eating it.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-5 text-center">
          <p className="font-display text-h2 font-bold text-primary">200+</p>
          <p className="mt-1 text-caption text-text-subtle">Restaurants &amp; vendors</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5 text-center">
          <p className="font-display text-h2 font-bold text-primary">25–35</p>
          <p className="mt-1 text-caption text-text-subtle">Avg. delivery minutes</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5 text-center">
          <p className="font-display text-h2 font-bold text-primary">4.8</p>
          <p className="mt-1 text-caption text-text-subtle">Average rating</p>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-h3 font-bold text-text">What we&apos;re building</h2>
        <p className="mt-2 text-small leading-relaxed text-text-muted">
          Every order on TummyTime supports a real local business — a restaurant kitchen, a neighborhood shop, a
          rider earning on their own schedule. We built real-time tracking, in-app wallets, and a rewards program
          so ordering feels effortless on every side of the platform.
        </p>
      </section>

      <section className="mt-8 rounded-lg border border-border bg-surface p-6 text-center">
        <h2 className="font-display text-h3 font-bold text-text">Want to sell on TummyTime?</h2>
        <p className="mt-2 text-small text-text-muted">Set up your store in minutes — we review every application.</p>
        <Link
          href="/register"
          className="mt-4 inline-block rounded-md bg-primary px-6 py-2.5 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark"
        >
          Get started
        </Link>
      </section>
    </main>
  );
}
