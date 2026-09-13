import {
  DiscountIcon,
  DeliveryIcon,
  TagIcon,
  TicketIcon,
  StarIcon,
  type IconComponent,
} from "@/components/icons";
import { Navigation } from "@/components/nav/Navigation";
import "@/app/offers.css";

/** Per the product UX blueprint's list of TummyTime offer types. */
const OFFERS: { icon: IconComponent; title: string; desc: string }[] = [
  {
    icon: DiscountIcon,
    title: "₦1,000 OFF",
    desc: "Save ₦1,000 on select orders across TummyTime.",
  },
  {
    icon: DeliveryIcon,
    title: "Free Delivery",
    desc: "Zero delivery fee on qualifying orders near you.",
  },
  {
    icon: TagIcon,
    title: "10% OFF",
    desc: "Get 10% off your order total at participating vendors.",
  },
  {
    icon: TicketIcon,
    title: "First-order offers",
    desc: "Special discounts reserved for your very first TummyTime order.",
  },
  {
    icon: StarIcon,
    title: "Loyalty rewards",
    desc: "Earn points on every order and redeem them for rewards.",
  },
];

export function OffersView() {
  return (
    <>
      <Navigation />
      <main className="off-root">
        <header className="off-header">
          <h1 className="off-title">Deals &amp; Discounts</h1>
          <p className="off-subtitle">Everything you can save on right now.</p>
        </header>

        <div className="off-grid">
          {OFFERS.map((offer) => (
            <div className="off-card" key={offer.title}>
              <div className="off-card__icon">
                <offer.icon width={20} height={20} aria-hidden />
              </div>
              <p className="off-card__title">{offer.title}</p>
              <p className="off-card__desc">{offer.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
