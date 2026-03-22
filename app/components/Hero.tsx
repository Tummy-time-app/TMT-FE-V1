import Image from "next/image";
import React from "react";
import LottieIcon from "./LottieIcon";
import bicycleAnimation from "../assets/lottie/bicicleta delivery.json";

const Hero = () => {
  return (
    <section className="hero">

      {/* ── LEFT: Content ──────────────────────────── */}
      <div className="hero__content">

        {/* Heading */}
        <h1 className="hero__heading">
          Fastest
          <br />
          <em>Delivery</em> &amp;
          <br />
          Easy <em>Pickup</em>
        </h1>

        {/* Sub-copy */}
        <p className="hero__sub">
          Order food from restaurants, shops, and local markets —
          delivered fast or ready for easy pickup.
        </p>

        {/* CTAs */}
        <div className="hero__cta">
          <button className="hero__cta-primary">Order Now</button>
          <button className="hero__cta-secondary">See Menu →</button>
        </div>

        {/* Trust strip */}
        {/* <div className="hero__trust">
          <div className="hero__trust-item">
            <span className="hero__trust-icon">⚡</span>
            <span>30-min delivery</span>
          </div>
          <div className="hero__trust-divider" />
          <div className="hero__trust-item">
            <span className="hero__trust-icon">🏪</span>
            <span>200+ vendors</span>
          </div>
          <div className="hero__trust-divider" />
          <div className="hero__trust-item">
            <span className="hero__trust-icon">⭐</span>
            <span>4.8 rated</span>
          </div>
        </div> */}
      </div>

      {/* ── RIGHT: Visual ──────────────────────────── */}
      <div className="hero__visual">

        {/* Plate 1 — Jollof Rice */}
        <div className="hero__plate hero__plate--1">
          <Image
            src="/images/jollof.png"
            width={300}
            height={300}
            alt="Jollof Rice"
            className="hero__plate-img"
          />
          <span className="hero__plate-label">Jollof Rice</span>
        </div>

        {/* Plate 2 — Burger */}
        <div className="hero__plate hero__plate--2">
          <Image
            src="/images/hamburger.png"
            width={300}
            height={300}
            alt="Burger"
            className="hero__plate-img"
          />
          <span className="hero__plate-label">Burgers</span>
        </div>

        {/* Plate 3 — Fried Rice */}
        <div className="hero__plate hero__plate--3">
          <Image
            src="/images/friedrice.png"
            width={300}
            height={300}
            alt="Fried Rice"
            className="hero__plate-img"
          />
          <span className="hero__plate-label">Fried Rice</span>
        </div>

        {/* Speed lines — behind the bike */}
        <div className="hero__speed-lines">
          <div className="hero__speed-line" />
          <div className="hero__speed-line" />
          <div className="hero__speed-line" />
        </div>

        {/* Animated Bicycle */}
        <div className="hero__bike-wrapper">
          <LottieIcon
            animationData={bicycleAnimation}
            className="flip-horizontal"
            loop
          />
        </div>

        {/* Decorative background blob */}
        <div className="hero__blob" aria-hidden />
      </div>
    </section>
  );
};

export default Hero;