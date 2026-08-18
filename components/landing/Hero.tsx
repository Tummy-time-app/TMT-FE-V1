import Image from "next/image";
import LottieIcon from "@/components/LottieIcon";
import bicycleAnimation from "@/app/assets/lottie/bicicleta delivery.json";

/** Ported from the `frontend` branch's components/Hero.tsx. */
export function Hero() {
  return (
    <section className="hero">
      {/* ── LEFT: Content ──────────────────────────── */}
      <div className="hero__content">
        <h1 className="hero__heading">
          Fastest
          <br />
          <em>Delivery</em> &amp;
          <br />
          Easy <em>Pickup</em>
        </h1>

        <p className="hero__sub">
          Order food from restaurants, shops, and local markets — delivered
          fast or ready for easy pickup.
        </p>

        <div className="hero__cta">
          <button className="hero__cta-primary">Order Now</button>
          <button className="hero__cta-secondary">See Menu →</button>
        </div>
      </div>

      {/* ── RIGHT: Visual ──────────────────────────── */}
      <div className="hero__visual">
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

        <div className="hero__speed-lines">
          <div className="hero__speed-line" />
          <div className="hero__speed-line" />
          <div className="hero__speed-line" />
        </div>

        <div className="hero__bike-wrapper">
          <LottieIcon
            animationData={bicycleAnimation}
            className="flip-horizontal"
            loop
          />
        </div>

        <div className="hero__blob" aria-hidden />
      </div>
    </section>
  );
}
