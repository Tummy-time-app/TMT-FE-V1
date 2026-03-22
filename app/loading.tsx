"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import bicycleAnimation from "./assets/lottie/bicicleta delivery.json";
import LottieIcon from "./components/LottieIcon";

const loadingMessages = [
  "Finding the best spots near you…",
  "Warming up the kitchen…",
  "Your food is almost ready…",
  "Grabbing the freshest picks…",
  "Almost there, hang tight…",
];

export default function Loading() {
  const [progress, setProgress]   = useState(0);
  const [msgIndex, setMsgIndex]   = useState(0);
  const [exiting, setExiting]     = useState(false);

  /* progress bar */
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return Math.min(p + Math.random() * 9 + 2, 100);
      });
    }, 120);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
    }, 2500);

    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);

  /* cycle loading messages */
  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % loadingMessages.length);
    }, 600);
    return () => clearInterval(id);
  }, []);

  /* fade-out when done */
  useEffect(() => {
    if (progress === 100) {
      const t = setTimeout(() => setExiting(true), 200);
      return () => clearTimeout(t);
    }
  }, [progress]);

  return (
    <div
      className={`loading-root ${exiting ? "loading-root--exit" : ""}`}
      aria-label="Loading TummyTime"
      role="status"
    >
      {/* ── background decorations ── */}
      <div className="loading-bg-blob loading-bg-blob--1" aria-hidden />
      <div className="loading-bg-blob loading-bg-blob--2" aria-hidden />

      {/* floating food icons */}
      <div className="loading-floats" aria-hidden>
        {["🍛", "🍔", "🌶️", "🍅", "🍕", "🥘"].map((icon, i) => (
          <span key={i} className={`loading-float loading-float--${i + 1}`}>
            {icon}
          </span>
        ))}
      </div>

      {/* ── card ── */}
      <div className="loading-card">

        {/* logo */}
        <div className="loading-logo-wrap">
          <Image
            src="/images/tummytime-logo.png"
            fill
            alt="TummyTime"
            className="object-contain p-3"
            priority
          />
        </div>

        {/* tagline */}
        <p className="loading-tagline">
          Fastest <em>Delivery</em> &amp; Easy <em>Pickup</em>
        </p>

        {/* bike animation */}
        <div className="loading-bike-track">
          <div className="loading-road" aria-hidden />
          <div
            className="loading-bike"
            style={{ left: `${Math.min(progress, 92)}%` }}
          >
            <LottieIcon
              animationData={bicycleAnimation}
              className="loading-bike-lottie"
              loop
            />
          </div>
          {/* road dashes */}
          <div className="loading-road-dashes" aria-hidden>
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="loading-road-dash" />
            ))}
          </div>
        </div>

        {/* progress bar */}
        <div className="loading-bar-track" role="progressbar"
          aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="loading-bar-fill"
            style={{ width: `${progress}%` }}
          >
            <div className="loading-bar-shimmer" />
          </div>
          {/* checkpoint dots */}
          {[25, 50, 75].map((p) => (
            <span
              key={p}
              className={`loading-checkpoint ${progress >= p ? "loading-checkpoint--done" : ""}`}
              style={{ left: `${p}%` }}
            />
          ))}
        </div>

        {/* progress % + message */}
        <div className="loading-status">
          <span className="loading-percent">{Math.round(progress)}%</span>
          <span className="loading-message">{loadingMessages[msgIndex]}</span>
        </div>

      </div>

      {/* ── inline styles ── */}
      <style>{`
        /* root overlay */
        .loading-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: var(--off-white);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .loading-root--exit {
          opacity: 0;
          transform: scale(1.03);
          pointer-events: none;
        }

        /* background blobs */
        .loading-bg-blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .loading-bg-blob--1 {
          width: 600px; height: 600px;
          top: -200px; right: -200px;
          background: radial-gradient(circle, rgba(172,0,0,0.07) 0%, transparent 70%);
        }
        .loading-bg-blob--2 {
          width: 500px; height: 500px;
          bottom: -180px; left: -180px;
          background: radial-gradient(circle, rgba(255,183,3,0.1) 0%, transparent 70%);
        }

        /* floating food icons */
        .loading-floats {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .loading-float {
          position: absolute;
          font-size: 2rem;
          opacity: 0.12;
          animation: loadFloat 4s ease-in-out infinite;
        }
        .loading-float--1 { top:10%; left:8%;  animation-delay:0s;    font-size:2.4rem; }
        .loading-float--2 { top:20%; right:6%; animation-delay:0.7s;  font-size:1.8rem; }
        .loading-float--3 { top:65%; left:5%;  animation-delay:1.2s;  font-size:2rem; }
        .loading-float--4 { top:75%; right:8%; animation-delay:0.4s;  font-size:2.2rem; }
        .loading-float--5 { top:45%; left:3%;  animation-delay:1.8s;  font-size:1.6rem; }
        .loading-float--6 { top:50%; right:4%; animation-delay:0.9s;  font-size:2rem; }
        @keyframes loadFloat {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-18px) rotate(8deg); }
        }

        /* card */
        .loading-card {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: min(480px, 90vw);
          background: #fff;
          border-radius: 28px;
          padding: clamp(28px, 5vw, 44px) clamp(24px, 5vw, 40px);
          box-shadow:
            0 4px 6px rgba(0,0,0,0.04),
            0 24px 60px rgba(172,0,0,0.1),
            0 0 0 1px rgba(172,0,0,0.06);
          animation: cardPop 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes cardPop {
          from { opacity:0; transform: scale(0.88) translateY(20px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }

        /* logo */
        .loading-logo-wrap {
          position: relative;
          width: clamp(140px, 35vw, 200px);
          height: clamp(90px, 22vw, 130px);
          margin-bottom: 10px;
        }

        /* tagline */
        .loading-tagline {
          font-family: var(--font-display);
          font-size: clamp(0.85rem, 2.5vw, 1rem);
          font-weight: 600;
          color: #999;
          letter-spacing: 0.02em;
          margin-bottom: 28px;
          text-align: center;
        }
        .loading-tagline em {
          font-style: normal;
          color: var(--crimson);
          font-weight: 700;
        }

        /* bike track */
        .loading-bike-track {
          position: relative;
          width: 100%;
          height: 64px;
          margin-bottom: 20px;
        }
        .loading-road {
          position: absolute;
          bottom: 8px;
          left: 0; right: 0;
          height: 3px;
          background: rgba(172,0,0,0.1);
          border-radius: 2px;
        }
        .loading-road-dashes {
          position: absolute;
          bottom: 9px;
          left: 0; right: 0;
          display: flex;
          justify-content: space-around;
          padding: 0 4px;
        }
        .loading-road-dash {
          width: 12px;
          height: 1px;
          background: rgba(172,0,0,0.2);
          border-radius: 1px;
          animation: dashScroll 0.6s linear infinite;
        }
        @keyframes dashScroll {
          from { transform: translateX(0); opacity:1; }
          to   { transform: translateX(-20px); opacity:0; }
        }
        .loading-bike {
          position: absolute;
          bottom: 10px;
          transform: translateX(-50%);
          transition: left 0.3s ease-out;
          width: 56px;
          height: 48px;
        }
        .loading-bike-lottie {
          width: 56px !important;
          height: 48px !important;
          display: block;
        }

        /* progress bar */
        .loading-bar-track {
          position: relative;
          width: 100%;
          height: 8px;
          background: rgba(172,0,0,0.08);
          border-radius: 100px;
          overflow: visible;
          margin-bottom: 14px;
        }
        .loading-bar-fill {
          height: 100%;
          border-radius: 100px;
          background: linear-gradient(to right, var(--crimson), var(--amber));
          transition: width 0.15s ease-out;
          position: relative;
          overflow: hidden;
        }
        .loading-bar-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%);
          animation: shimmer 1.2s ease-in-out infinite;
        }
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to   { transform: translateX(200%); }
        }
        .loading-checkpoint {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 10px; height: 10px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid rgba(172,0,0,0.2);
          transition: border-color 0.3s, background 0.3s, transform 0.2s;
          z-index: 2;
        }
        .loading-checkpoint--done {
          border-color: var(--crimson);
          background: var(--crimson);
          transform: translate(-50%, -50%) scale(1.2);
        }

        /* status row */
        .loading-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 12px;
        }
        .loading-percent {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--crimson);
          flex-shrink: 0;
          min-width: 44px;
        }
        .loading-message {
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 500;
          color: #888;
          text-align: right;
          line-height: 1.4;
          transition: opacity 0.3s;
        }
      `}</style>
    </div>
  );
}