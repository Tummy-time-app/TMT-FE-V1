import Link from "next/link";
import { Navigation } from "@/components/nav/Navigation";
import { Footer } from "@/components/landing/Footer";
import { StoreIcon, TruckIcon, CheckIcon } from "@/components/icons";
import "@/app/marketing.css";

const VENDOR_POINTS = [
  "Set up your store and menu in minutes",
  "Manage orders, stock, and promotions from one dashboard",
  "Track earnings and settlements as you go",
];

const RIDER_POINTS = [
  "Pick up delivery work on your own schedule",
  "Get paired with nearby orders as they come in",
  "See your earnings after every delivery",
];

/**
 * Vendor signup is real (backend-backed — see /vendor/signup). Rider
 * signup isn't: TMT-BE-V1's user_role enum has no "rider" role and no
 * rider-facing route exists anywhere in the backend, so that panel is
 * honestly marked "Coming soon" and points at /riders (a holding page)
 * rather than a signup flow that doesn't exist yet.
 */
export function BusinessView() {
  return (
    <>
      <Navigation />
      <main className="mkt-root">
        <header className="mkt-hero">
          <span className="mkt-hero__eyebrow">TummyTime for Business</span>
          <h1 className="mkt-hero__title">Grow with TummyTime</h1>
          <p className="mkt-hero__subtitle">
            Whether you run a store or you&apos;re looking to deliver, there&apos;s a place for you on
            TummyTime.
          </p>
        </header>

        <div className="mkt-panels">
          <div className="mkt-panel">
            <span className="mkt-panel__badge mkt-panel__badge--live">Open now</span>
            <div className="mkt-card__icon" style={{ marginBottom: 16 }}>
              <StoreIcon width={22} height={22} aria-hidden />
            </div>
            <h2 className="mkt-panel__title">Sell on TummyTime</h2>
            <p className="mkt-panel__desc">
              Bring your restaurant, grocery, or shop to customers across your city.
            </p>
            <ul className="mkt-panel__list">
              {VENDOR_POINTS.map((point) => (
                <li key={point}>
                  <CheckIcon width={16} height={16} aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
            <div className="mkt-panel__actions">
              <Link href="/vendor/signup" className="mkt-btn mkt-btn--primary">
                Register your store
              </Link>
              <Link href="/vendor/login" className="mkt-btn mkt-btn--outline">
                Vendor login
              </Link>
            </div>
          </div>

          <div className="mkt-panel">
            <span className="mkt-panel__badge mkt-panel__badge--soon">Coming soon</span>
            <div className="mkt-card__icon" style={{ marginBottom: 16 }}>
              <TruckIcon width={22} height={22} aria-hidden />
            </div>
            <h2 className="mkt-panel__title">Ride for TummyTime</h2>
            <p className="mkt-panel__desc">Deliver orders in your area and get paid for every trip.</p>
            <ul className="mkt-panel__list">
              {RIDER_POINTS.map((point) => (
                <li key={point}>
                  <CheckIcon width={16} height={16} aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
            <div className="mkt-panel__actions">
              <Link href="/riders" className="mkt-btn mkt-btn--outline">
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
