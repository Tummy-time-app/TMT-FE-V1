"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import LoadingBike from "@/components/LoadingBike";

const loadingMessages = [
  "Finding the best spots near you…",
  "Warming up the kitchen…",
  "Your food is almost ready…",
  "Grabbing the freshest picks…",
  "Almost there, hang tight…",
];

/**
 * Ported from the `frontend` branch's app/loading.tsx — markup, timing, and
 * behavior kept faithful (see app/loading.css). Next.js renders this
 * automatically as the Suspense fallback while a route segment under app/
 * is loading (a Server Component doing async work) — nothing needs to
 * import or render it directly. In this app that's mostly the very first
 * page load, since most routes are client components fetching via RTK
 * Query rather than suspending server-side.
 *
 * Deliberate departures from a literal copy:
 * - The bike-track section reuses components/LoadingBike (split out ahead
 *   of this port, previously unused) instead of re-inlining it, now driven
 *   by this component's `progress` state via a prop rather than owning a
 *   second, redundant timer.
 * - `/tummytime-logo.png` (this repo's actual asset) in place of the
 *   source's `/images/logo/tummytime-logo.png`, which doesn't exist here —
 *   same departure as components/auth/AuthShell.tsx.
 */
export default function Loading() {
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  /* progress bar */
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(p + Math.random() * 9 + 2, 100);
      });
    }, 120);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
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
            src="/tummytime-logo.png"
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
        <LoadingBike progress={progress} />

        {/* progress bar */}
        <div
          className="loading-bar-track"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="loading-bar-fill" style={{ width: `${progress}%` }}>
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
    </div>
  );
}
