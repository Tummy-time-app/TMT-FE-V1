"use client";

import Link from "next/link";
import Hero from "../components/Hero";
import { BannerStrip } from "@/components/BannerStrip";
import Footer from "@/components/Footer";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { VendorFeed } from "@/components/home/VendorFeed";
import { Store, ShoppingCart, Leaf, ArrowRight, type IconComponent } from "@/components/icons";

const ENTRY_TILES: {
  icon: IconComponent;
  label: string;
  desc: string;
  href: string;
  soon?: boolean;
}[] = [
  {
    icon: Store,
    label: "Restaurants",
    desc: "African, continental & intercontinental",
    href: "/vendors/restaurants",
  },
  {
    icon: ShoppingCart,
    label: "Shops",
    desc: "Groceries & daily essentials",
    href: "/vendors/shops",
    soon: true,
  },
  {
    icon: Leaf,
    label: "Local Markets",
    desc: "Fresh produce from local markets",
    href: "/vendors/markets",
    soon: true,
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
          <Link
            key={tile.label}
            href={tile.href}
            className={`hf-tile ${tile.soon ? "hf-tile--soon" : ""}`}
            aria-disabled={tile.soon}
            onClick={(e) => tile.soon && e.preventDefault()}
          >
            <span className="hf-tile-icon">
              <tile.icon size={26} aria-hidden />
            </span>
            <span className="hf-tile-body">
              <span className="hf-tile-label">
                {tile.label}
                {tile.soon && <span className="hf-tile-badge">Coming soon</span>}
              </span>
              <span className="hf-tile-desc">{tile.desc}</span>
            </span>
            {!tile.soon && <ArrowRight size={16} aria-hidden className="hf-tile-arrow" />}
          </Link>
        ))}
      </section>

      {/* ── Cuisine icon strip ── */}
      <CategoryStrip />

      {/* ── Discovery feed — Popular near you + one row per cuisine ── */}
      <VendorFeed />

      <BannerStrip />
      <Footer />
    </main>
  );
}
