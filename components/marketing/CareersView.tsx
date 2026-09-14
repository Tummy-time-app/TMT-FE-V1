import Link from "next/link";
import { Navigation } from "@/components/nav/Navigation";
import { Footer } from "@/components/landing/Footer";
import { UtensilsIcon, TruckIcon, UsersIcon, ReceiptIcon } from "@/components/icons";
import "@/app/marketing.css";

const DEPARTMENTS = [
  { icon: UtensilsIcon, title: "Vendor Success", desc: "Help restaurants and shops get the most out of TummyTime." },
  { icon: TruckIcon, title: "Rider Operations", desc: "Keep deliveries fast, reliable, and fair for riders." },
  { icon: UsersIcon, title: "Engineering", desc: "Build the platform vendors, riders, and customers run on." },
  { icon: ReceiptIcon, title: "Customer Support", desc: "Be there when an order or a store needs a hand." },
];

export function CareersView() {
  return (
    <>
      <Navigation />
      <main className="mkt-root">
        <header className="mkt-hero">
          <span className="mkt-hero__eyebrow">Careers</span>
          <h1 className="mkt-hero__title">Help build TummyTime</h1>
          <p className="mkt-hero__subtitle">
            We&apos;re a small team working on food, groceries, local shops, and the delivery network that
            connects them.
          </p>
        </header>

        <div className="mkt-section">
          <h2 className="mkt-section-title">Where we're building</h2>
          <p className="mkt-section-sub">The areas that make up TummyTime today.</p>
          <div className="mkt-grid">
            {DEPARTMENTS.map((dept) => (
              <div className="mkt-card" key={dept.title}>
                <div className="mkt-card__icon">
                  <dept.icon width={20} height={20} aria-hidden />
                </div>
                <p className="mkt-card__title">{dept.title}</p>
                <p className="mkt-card__desc">{dept.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mkt-section">
          <h2 className="mkt-section-title">Open roles</h2>
          <div className="mkt-card">
            <p className="mkt-card__desc" style={{ margin: 0 }}>
              We don&apos;t have open roles listed here yet — this page will list them directly once
              hiring opens up. In the meantime, if you&apos;re a vendor or rider interested in working
              with TummyTime a different way, start from{" "}
              <Link href="/business" style={{ color: "var(--crimson)", fontWeight: 700 }}>
                TummyTime for Business
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
