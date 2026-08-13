export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-h1 font-bold text-text">Privacy Policy</h1>
      <p className="mt-1 text-small text-text-muted">Last updated August 2026.</p>

      <div className="mt-6 space-y-6 text-small leading-relaxed text-text-muted">
        <section>
          <h2 className="font-display text-h3 font-bold text-text">What we collect</h2>
          <p className="mt-2">
            To place and deliver an order, we collect your name, email, phone number, delivery addresses, and order
            history. Riders share live location while an active delivery is in progress, so you and the vendor can
            track it — this stops as soon as the delivery is marked complete.
          </p>
        </section>

        <section>
          <h2 className="font-display text-h3 font-bold text-text">How we use it</h2>
          <p className="mt-2">
            Your information is used to process orders, calculate delivery routes and fees, send order and account
            notifications, and improve the vendors and searches shown to you. We don&apos;t sell your personal
            information to third parties.
          </p>
        </section>

        <section>
          <h2 className="font-display text-h3 font-bold text-text">Who we share it with</h2>
          <p className="mt-2">
            The vendor you order from sees your name and delivery address to fulfill the order. Your assigned rider
            sees your name, delivery address, and phone number. Payment providers process card and bank transfer
            payments directly — we don&apos;t store your card details.
          </p>
        </section>

        <section>
          <h2 className="font-display text-h3 font-bold text-text">Your choices</h2>
          <p className="mt-2">
            You can edit your profile and manage saved addresses from your account settings at any time, review and
            revoke active sessions from other devices, and delete individual saved addresses or favorites whenever
            you like.
          </p>
        </section>

        <section>
          <h2 className="font-display text-h3 font-bold text-text">Data retention</h2>
          <p className="mt-2">
            We keep order history for as long as your account is active, so you can reorder and track past
            deliveries. If you close your account, we retain the minimum records required for tax and dispute
            purposes.
          </p>
        </section>
      </div>
    </main>
  );
}
