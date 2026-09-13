import Link from "next/link";
import { Navigation } from "@/components/nav/Navigation";
import "@/app/help.css";

const FAQS: { q: string; a: string }[] = [
  {
    q: "How do I track my order?",
    a: "Open Orders from your account menu and select the order you want to follow — you'll see its live status and delivery progress there.",
  },
  {
    q: "How do I change my delivery address?",
    a: "Use the \"Deliver to\" button in the top navigation bar to pick a new location. It updates your saved address for checkout and tracking.",
  },
  {
    q: "How do I cancel an order?",
    a: "Open the order from Orders — a cancel option is available for as long as the order hasn't been picked up yet.",
  },
  {
    q: "What payment methods are supported?",
    a: "You can choose your payment method at checkout on the cart page.",
  },
  {
    q: "How do refunds work?",
    a: "Refunds for cancelled or rejected orders are processed back to your original payment method — check your order's status page for updates.",
  },
];

export function HelpCentreView() {
  return (
    <>
      <Navigation />
      <main className="hc-root">
        <header className="hc-header">
          <h1 className="hc-title">Help Centre</h1>
          <p className="hc-subtitle">Answers to common questions about ordering on TummyTime.</p>
        </header>

        <div className="hc-list">
          {FAQS.map((faq) => (
            <details className="hc-item" key={faq.q}>
              <summary className="hc-item__q">{faq.q}</summary>
              <p className="hc-item__a">{faq.a}</p>
            </details>
          ))}
        </div>

        <div className="hc-contact">
          Still stuck? Live chat and phone support are on the way. For now, order-specific
          issues can be reviewed from <Link href="/orders">Your Orders</Link>.
        </div>
      </main>
    </>
  );
}
