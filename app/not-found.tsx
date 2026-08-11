"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import LoadingBike from "@/components/LoadingBike";
import {
  RiceBowl,
  Burger,
  Flame,
  Pizza,
  Cherries,
  Soup,
  Drumstick,
  UtensilsCrossed,
  Store,
  ShoppingCart,
  Leaf,
  Bag,
  type IconComponent,
} from "@/components/icons";

const hungerLines = [
  "Looks like this page went out for delivery… and never came back.",
  "Our rider took a wrong turn. This page doesn't exist.",
  "404 — Even our best chefs can't cook up this page.",
  "This dish is off the menu today.",
];

export default function NotFound() {
  const [line, setLine] = useState(0);

  /* cycle through witty lines */
  useEffect(() => {
    const id = setInterval(() => setLine(l => (l + 1) % hungerLines.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="nf-root">

      {/* ── background blobs ── */}
      <div className="nf-blob nf-blob--1" aria-hidden />
      <div className="nf-blob nf-blob--2" aria-hidden />

      {/* ── floating food icons ── */}
      <div className="nf-floats" aria-hidden>
        {(
          [
            { Icon: RiceBowl, size: 38, cls: "nf-float--1" },
            { Icon: Burger, size: 29, cls: "nf-float--2" },
            { Icon: Flame, size: 32, cls: "nf-float--3" },
            { Icon: Pizza, size: 35, cls: "nf-float--4" },
            { Icon: Cherries, size: 26, cls: "nf-float--5" },
            { Icon: Soup, size: 32, cls: "nf-float--6" },
            { Icon: Drumstick, size: 29, cls: "nf-float--7" },
            { Icon: UtensilsCrossed, size: 26, cls: "nf-float--8" },
          ] as { Icon: IconComponent; size: number; cls: string }[]
        ).map(({ Icon, size, cls }) => (
          <span key={cls} className={`nf-float ${cls}`}>
            <Icon size={size} aria-hidden />
          </span>
        ))}
      </div>

      {/* ── main card ── */}
      <div className="nf-card">

        {/* big 404 */}
        <div className="nf-four-wrap" aria-hidden>
          <span className="nf-four nf-four--left">4</span>
          <div className="nf-plate-wrap">
            <div className="nf-plate">
              <div className="nf-plate__ring" />
              <div className="nf-plate__inner">
                <span className="nf-plate__emoji"><UtensilsCrossed size={30} aria-hidden /></span>
              </div>
              {/* steam lines */}
              <div className="nf-steam">
                <span className="nf-steam__line nf-steam__line--1" />
                <span className="nf-steam__line nf-steam__line--2" />
                <span className="nf-steam__line nf-steam__line--3" />
              </div>
            </div>
          </div>
          <span className="nf-four nf-four--right">4</span>
        </div>

        {/* heading */}
        <h1 className="nf-heading">Page Not Found</h1>

        {/* rotating witty line */}
        <p className="nf-line" key={line}>{hungerLines[line]}</p>

        {/* rider illustration */}
        <LoadingBike />

        {/* CTAs */}
        <div className="nf-ctas">
          <Link href="/" className="nf-btn nf-btn--primary">
            Back to Home
          </Link>
          <Link href="/vendors/restaurants" className="nf-btn nf-btn--secondary">
            Browse Restaurants
          </Link>
        </div>

        {/* quick links */}
        <div className="nf-links">
          <p className="nf-links__label">Or go straight to</p>
          <div className="nf-links__row">
            <Link href="/vendors/restaurants" className="nf-quick">
              <Store size={13} aria-hidden style={{ verticalAlign: -2 }} /> Restaurants
            </Link>
            <Link href="/vendors/shops" className="nf-quick">
              <ShoppingCart size={13} aria-hidden style={{ verticalAlign: -2 }} /> Shops
            </Link>
            <Link href="/vendors/markets" className="nf-quick">
              <Leaf size={13} aria-hidden style={{ verticalAlign: -2 }} /> Markets
            </Link>
            <Link href="/cart" className="nf-quick">
              <Bag size={13} aria-hidden style={{ verticalAlign: -2 }} /> Cart
            </Link>
          </div>
        </div>

      </div>

      <style>{`
        /* ── root ── */
        .nf-root {
          min-height: calc(100vh - 120px);
          background: var(--off-white);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 5vw;
          position: relative;
          overflow: hidden;
        }

        /* ── blobs ── */
        .nf-blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .nf-blob--1 {
          width: 560px; height: 560px;
          top: -180px; right: -160px;
          background: radial-gradient(circle, rgba(172,0,0,0.07) 0%, transparent 70%);
        }
        .nf-blob--2 {
          width: 480px; height: 480px;
          bottom: -160px; left: -140px;
          background: radial-gradient(circle, rgba(255,183,3,0.1) 0%, transparent 70%);
        }

        /* ── floating food ── */
        .nf-floats {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .nf-float {
          position: absolute;
          opacity: 0.12;
          animation: nfFloat 4s ease-in-out infinite;
          font-size: 2rem;
        }
        .nf-float--1 { top: 8%;  left: 5%;  animation-delay: 0s;    font-size: 2.4rem; }
        .nf-float--2 { top: 15%; right: 6%; animation-delay: 0.6s;  font-size: 1.8rem; }
        .nf-float--3 { top: 55%; left: 4%;  animation-delay: 1.1s;  font-size: 2rem; }
        .nf-float--4 { top: 72%; right: 5%; animation-delay: 0.3s;  font-size: 2.2rem; }
        .nf-float--5 { top: 40%; left: 2%;  animation-delay: 1.7s;  font-size: 1.6rem; }
        .nf-float--6 { top: 48%; right: 3%; animation-delay: 0.9s;  font-size: 2rem; }
        .nf-float--7 { top: 82%; left: 10%; animation-delay: 0.4s;  font-size: 1.8rem; }
        .nf-float--8 { top: 88%; right: 12%;animation-delay: 1.4s;  font-size: 1.6rem; }

        @keyframes nfFloat {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-16px) rotate(8deg); }
        }

        /* ── card ── */
        .nf-card {
          position: relative;
          z-index: 1;
          background: #fff;
          border-radius: 28px;
          padding: clamp(32px, 5vw, 56px) clamp(28px, 5vw, 64px);
          width: min(580px, 96vw);
          box-shadow:
            0 4px 6px rgba(0,0,0,0.03),
            0 24px 60px rgba(172,0,0,0.09),
            0 0 0 1.5px rgba(172,0,0,0.06);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          animation: nfPop 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes nfPop {
          from { opacity:0; transform:scale(0.88) translateY(24px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }

        /* ── 404 digits + plate ── */
        .nf-four-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 8px;
          line-height: 1;
        }

        .nf-four {
          font-family: var(--font-display);
          font-size: clamp(4rem, 12vw, 7rem);
          font-weight: 800;
          color: var(--crimson);
          line-height: 1;
          animation: nfPulse 3s ease-in-out infinite;
        }

        .nf-four--right { animation-delay: 0.4s; }

        @keyframes nfPulse {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.04); }
        }

        /* plate in the centre of 404 */
        .nf-plate-wrap {
          position: relative;
          width: clamp(80px, 14vw, 110px);
          height: clamp(80px, 14vw, 110px);
          flex-shrink: 0;
        }

        .nf-plate {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nf-plate__ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 4px solid var(--amber);
          animation: nfSpin 8s linear infinite;
          border-top-color: var(--crimson);
          border-right-color: var(--crimson);
        }

        @keyframes nfSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .nf-plate__inner {
          width: 76%;
          height: 76%;
          border-radius: 50%;
          background: var(--off-white);
          border: 3px solid rgba(172,0,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nf-plate__emoji {
          font-size: clamp(1.6rem, 4vw, 2.6rem);
          animation: nfWiggle 2s ease-in-out infinite;
        }

        @keyframes nfWiggle {
          0%,100% { transform: rotate(-8deg); }
          50%      { transform: rotate(8deg); }
        }

        /* steam */
        .nf-steam {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 5px;
        }

        .nf-steam__line {
          display: block;
          width: 3px;
          border-radius: 3px;
          background: rgba(172,0,0,0.25);
          animation: nfSteam 1.8s ease-in-out infinite;
        }

        .nf-steam__line--1 { height: 10px; animation-delay: 0s; }
        .nf-steam__line--2 { height: 16px; animation-delay: 0.3s; }
        .nf-steam__line--3 { height: 10px; animation-delay: 0.6s; }

        @keyframes nfSteam {
          0%   { transform: translateY(0) scaleX(1); opacity: 0.5; }
          50%  { transform: translateY(-6px) scaleX(1.2); opacity: 1; }
          100% { transform: translateY(-12px) scaleX(0.8); opacity: 0; }
        }

        /* ── heading ── */
        .nf-heading {
          font-family: var(--font-display);
          font-size: clamp(1.3rem, 3.5vw, 1.8rem);
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 10px;
        }

        /* ── rotating witty line ── */
        .nf-line {
          font-size: clamp(0.82rem, 2vw, 0.95rem);
          color: #888;
          font-weight: 500;
          max-width: 380px;
          line-height: 1.65;
          margin-bottom: 28px;
          min-height: 48px;
          animation: nfFadeIn 0.4s ease both;
        }

        @keyframes nfFadeIn {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* ── rider strip ── */
        .nf-rider {
          width: 100%;
          position: relative;
          height: 48px;
          margin-bottom: 32px;
          overflow: hidden;
        }

        /* ── CTAs ── */
        .nf-ctas {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 28px;
        }

        .nf-btn {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.9rem;
          padding: 13px 30px;
          border-radius: 12px;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
          white-space: nowrap;
        }

        .nf-btn--primary {
          background: var(--crimson);
          color: #fff;
        }

        .nf-btn--primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(172,0,0,0.3);
          background: var(--crimson-dark);
        }

        .nf-btn--secondary {
          background: transparent;
          color: var(--crimson);
          border: 2px solid rgba(172,0,0,0.2);
        }

        .nf-btn--secondary:hover {
          border-color: var(--crimson);
          background: rgba(172,0,0,0.04);
          transform: translateY(-2px);
        }

        /* ── quick links ── */
        .nf-links { width: 100%; }

        .nf-links__label {
          font-size: 0.72rem;
          font-weight: 600;
          color: #bbb;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 10px;
        }

        .nf-links__row {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .nf-quick {
          background: var(--off-white);
          border: 1.5px solid rgba(172,0,0,0.1);
          color: var(--text-dark);
          font-size: 0.78rem;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 100px;
          text-decoration: none;
          transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.18s;
        }

        .nf-quick:hover {
          background: rgba(172,0,0,0.06);
          border-color: var(--crimson);
          color: var(--crimson);
          transform: translateY(-2px);
        }

        /* ── responsive ── */
        @media (max-width: 480px) {
          .nf-ctas { flex-direction: column; align-items: stretch; }
          .nf-btn  { text-align: center; }
        }
      `}</style>
    </main>
  );
}