"use client";

import Link from "next/link";
import Hero from "../components/Hero";
import { BannerStrip } from "@/components/BannerStrip";
import Footer from "@/components/Footer";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { VendorFeed } from "@/components/home/VendorFeed";
import { Store, ShoppingCart, Leaf, ArrowRight, type IconComponent } from "@/components/icons";

type Tone = "crimson" | "amber" | "dark";

const ENTRY_TILES: {
  icon: IconComponent;
  label: string;
  desc: string;
  href: string;
  tone: Tone;
}[] = [
  {
    icon: Store,
    label: "Restaurants",
    desc: "African, continental & intercontinental",
    href: "/vendors/restaurants",
    tone: "crimson",
  },
  {
    icon: ShoppingCart,
    label: "Shops",
    desc: "Groceries & daily essentials",
    href: "/vendors/shops",
    tone: "amber",
  },
  {
    icon: Leaf,
    label: "Local Markets",
    desc: "Fresh produce from local markets",
    href: "/vendors/markets",
    tone: "dark",
  },
];

const VERTICALS: {
  key: "restaurant" | "shop" | "market";
  icon: IconComponent;
  eyebrow: string;
  title: string;
  href: string;
  linkLabel: string;
  popularLabel: string;
  first?: boolean;
}[] = [
  {
    key: "restaurant",
    icon: Store,
    eyebrow: "Restaurants",
    title: "Order from top restaurants",
    href: "/vendors/restaurants",
    linkLabel: "Browse all restaurants",
    popularLabel: "Popular near you",
    first: true,
  },
  {
    key: "shop",
    icon: ShoppingCart,
    eyebrow: "Shops",
    title: "Shop groceries & essentials",
    href: "/vendors/shops",
    linkLabel: "Browse all shops",
    popularLabel: "Shops near you",
  },
  {
    key: "market",
    icon: Leaf,
    eyebrow: "Local Markets",
    title: "Fresh from local markets",
    href: "/vendors/markets",
    linkLabel: "Browse all markets",
    popularLabel: "Local markets near you",
  },
];

export default function Home() {
  return (
    <main>
      <Hero />

      {/* ── Entry tiles — Uber Eats leads with exactly this row
          (Grocery / Convenience / Restaurants) right under its hero ── */}
      <section className="hf-tiles">
        {ENTRY_TILES.map((tile) => (
          <Link key={tile.label} href={tile.href} className={`hf-tile hf-tile--${tile.tone}`}>
            <span className="hf-tile-icon">
              <tile.icon size={26} aria-hidden />
            </span>
            <span className="hf-tile-body">
              <span className="hf-tile-label">{tile.label}</span>
              <span className="hf-tile-desc">{tile.desc}</span>
            </span>
            <ArrowRight size={16} aria-hidden className="hf-tile-arrow" />
          </Link>
        ))}
      </section>

      {/* ── The three verticals — each carries its own color identity
          (icon tile → header → background wash) so the repeated
          category-strip+feed pattern reads as intentional, not copy-pasted ── */}
      {VERTICALS.map((v) => (
        <section key={v.key} className={`hf-vertical hf-vertical--${v.key}`}>
          <div className={`hf-vertical-header hf-vertical-header--${v.key} ${v.first ? "hf-vertical-header--first" : ""}`}>
            <div className="hf-vertical-heading-group">
              <span className="hf-vertical-icon"><v.icon size={20} aria-hidden /></span>
              <div>
                <span className="hf-vertical-eyebrow">{v.eyebrow}</span>
                <h2 className="hf-vertical-title">{v.title}</h2>
              </div>
            </div>
            <Link href={v.href} className="hf-vertical-link">
              {v.linkLabel} <ArrowRight size={13} aria-hidden />
            </Link>
          </div>
          <CategoryStrip businessType={v.key} />
          <VendorFeed businessType={v.key} popularLabel={v.popularLabel} />
        </section>
      ))}

      <BannerStrip />
      <Footer />
    </main>
  );
}
