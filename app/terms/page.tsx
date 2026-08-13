export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-h1 font-bold text-text">Terms &amp; Conditions</h1>
      <p className="mt-1 text-small text-text-muted">Last updated August 2026.</p>

      <div className="mt-6 space-y-6 text-small leading-relaxed text-text-muted">
        <section>
          <h2 className="font-display text-h3 font-bold text-text">1. Using TummyTime</h2>
          <p className="mt-2">
            TummyTime connects customers with independent restaurants, shops, and delivery riders. By placing an
            order, you agree to pay the listed price, delivery fee, and any applicable taxes shown at checkout
            before you confirm.
          </p>
        </section>

        <section>
          <h2 className="font-display text-h3 font-bold text-text">2. Orders &amp; payment</h2>
          <p className="mt-2">
            Orders are placed directly with the vendor you select. Once a vendor accepts an order, cancellation is
            only possible before preparation begins. Payment methods available at checkout — cash on delivery,
            bank transfer, wallet, or card — are processed as shown; card and bank transfer payments are confirmed
            by the payment provider, not by TummyTime directly.
          </p>
        </section>

        <section>
          <h2 className="font-display text-h3 font-bold text-text">3. Delivery</h2>
          <p className="mt-2">
            Delivery times shown are estimates. A rider is assigned once your order is ready for pickup; you can
            track their location in real time from your order page once they&apos;re on the way.
          </p>
        </section>

        <section>
          <h2 className="font-display text-h3 font-bold text-text">4. Vendor &amp; rider accounts</h2>
          <p className="mt-2">
            Vendors are responsible for the accuracy of their menu, pricing, and availability. Every new store is
            reviewed before it appears to customers. Riders are responsible for the accuracy of their vehicle and
            delivery information, and for delivering orders to the address provided by the customer.
          </p>
        </section>

        <section>
          <h2 className="font-display text-h3 font-bold text-text">5. Account standing</h2>
          <p className="mt-2">
            We may suspend or deactivate an account that violates these terms, including fraudulent orders, abusive
            behavior toward vendors or riders, or repeated payment failures.
          </p>
        </section>

        <section>
          <h2 className="font-display text-h3 font-bold text-text">6. Changes</h2>
          <p className="mt-2">
            We may update these terms from time to time. Continued use of TummyTime after a change means you accept
            the updated terms.
          </p>
        </section>
      </div>
    </main>
  );
}
