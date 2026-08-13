"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  MapPin,
  Check,
  ArrowRight,
  Bike,
  StarSolid,
  RiceBowl,
  Burger,
  Pizza,
  type IconComponent,
} from "@/components/icons";

const QUICK_CATEGORIES: { label: string; image: string; icon: IconComponent; href: string }[] = [
  { label: "Rice & Grills", image: "/images/jollof.png", icon: RiceBowl, href: "/vendors/restaurants" },
  { label: "Burgers", image: "/images/hamburger.png", icon: Burger, href: "/vendors/restaurants" },
  { label: "Pizza", image: "/images/pizza.png", icon: Pizza, href: "/vendors/restaurants" },
];

const Hero = () => {
  const [address, setAddress] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/vendors/restaurants");
  };

  return (
    <section className="hero">

      {/* ── LEFT: Content ──────────────────────────── */}
      <div className="hero__content">
        <button type="button" className="hero__location">
          <MapPin size={14} aria-hidden />
          Ikoyi, Lagos
        </button>

        <h1 className="hero__heading">
          Discover restaurants
          <br />
          that deliver near you.
        </h1>

        <form className="hero__search" onSubmit={handleSubmit}>
          <input
            type="text"
            className="hero__search-input"
            placeholder="Enter your delivery address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            aria-label="Delivery address"
          />
          <button type="submit" className="hero__search-btn">
            <Check size={14} aria-hidden />
            <span>Find food</span>
          </button>
        </form>

        <div className="hero__quick-categories">
          {QUICK_CATEGORIES.map((cat) => (
            <Link key={cat.label} href={cat.href} className="hero__quick-card">
              <span className="hero__quick-card-img">
                <Image src={cat.image} alt="" fill sizes="140px" className="hero__quick-card-photo" />
              </span>
              <span className="hero__quick-card-label">
                <cat.icon size={13} aria-hidden />
                {cat.label}
                <ArrowRight size={11} aria-hidden className="hero__quick-card-arrow" />
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Visual ──────────────────────────── */}
      <div className="hero__visual">
        {/* Decorative background blob */}
        <div className="hero__blob" aria-hidden />

        {/* Big rounded food photo */}
        <div className="hero__photo-card">
          <Image
            src="/images/jollof-spaghetti.jpg"
            alt="Jollof spaghetti with grilled chicken, ready for delivery"
            fill
            priority
            sizes="(max-width: 640px) 80vw, 40vw"
            className="hero__photo-img"
          />
        </div>

        {/* Floating stat chips */}
        <div className="hero__floating-badge hero__floating-badge--time">
          <span className="hero__floating-badge-icon">
            <Bike size={16} aria-hidden />
          </span>
          <span>
            <span className="hero__floating-badge-value">25–35 min</span>
            <span className="hero__floating-badge-label">Avg. delivery</span>
          </span>
        </div>

        <div className="hero__floating-badge hero__floating-badge--rating">
          <span className="hero__floating-badge-icon hero__floating-badge-icon--amber">
            <StarSolid size={16} aria-hidden />
          </span>
          <span>
            <span className="hero__floating-badge-value">4.8 rating</span>
            <span className="hero__floating-badge-label">2,300+ orders</span>
          </span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
