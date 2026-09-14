import { Navigation } from "@/components/nav/Navigation";
import { Footer } from "@/components/landing/Footer";
import { UtensilsIcon, BasketIcon, StoreIcon, ShoppingBagIcon } from "@/components/icons";
import "@/app/marketing.css";

const WHAT_WE_DO = [
  { icon: UtensilsIcon, title: "Foods", desc: "Order from restaurants across every cuisine, delivered hot." },
  { icon: BasketIcon, title: "Groceries", desc: "Daily essentials from stores and supermarkets near you." },
  { icon: StoreIcon, title: "Shop", desc: "Support local businesses in your neighbourhood." },
  { icon: ShoppingBagIcon, title: "Personal Shopper", desc: "Have someone shop and deliver for you." },
];

export function AboutView() {
  return (
    <>
      <Navigation />
      <main className="mkt-root">
        <header className="mkt-hero">
          <span className="mkt-hero__eyebrow">About TummyTime</span>
          <h1 className="mkt-hero__title">Bringing your neighbourhood to your door</h1>
          <p className="mkt-hero__subtitle">
            TummyTime connects people with the restaurants, stores, and vendors around them — and the
            riders who get it all there.
          </p>
        </header>

        <div className="mkt-section">
          <h2 className="mkt-section-title">What we do</h2>
          <p className="mkt-section-sub">One marketplace, four ways to get what you need.</p>
          <div className="mkt-grid">
            {WHAT_WE_DO.map((item) => (
              <div className="mkt-card" key={item.title}>
                <div className="mkt-card__icon">
                  <item.icon width={20} height={20} aria-hidden />
                </div>
                <p className="mkt-card__title">{item.title}</p>
                <p className="mkt-card__desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mkt-section">
          <h2 className="mkt-section-title">Why we built this</h2>
          <div className="mkt-prose">
            <p>
              We started TummyTime because ordering from the businesses around you shouldn&apos;t be
              complicated — one app for the restaurant on your street, the grocer down the road, and
              the rider who bridges the two.
            </p>
            <p>
              Every order on TummyTime supports a local business. We built the platform so vendors can
              set up in minutes, riders can pick up work on their own schedule, and customers can trust
              that what they ordered will actually show up — hot, fresh, and on time.
            </p>
          </div>
        </div>

        <div className="mkt-section">
          <h2 className="mkt-section-title">What we care about</h2>
          <div className="mkt-grid">
            <div className="mkt-card">
              <p className="mkt-card__title">Local first</p>
              <p className="mkt-card__desc">
                We&apos;d rather help ten businesses on your street thrive than chase scale for its own sake.
              </p>
            </div>
            <div className="mkt-card">
              <p className="mkt-card__title">Fair by default</p>
              <p className="mkt-card__desc">
                Vendors and riders should know exactly what they&apos;re earning — no surprises.
              </p>
            </div>
            <div className="mkt-card">
              <p className="mkt-card__title">Built to last</p>
              <p className="mkt-card__desc">
                We&apos;re building for the long run, one reliable delivery at a time.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
