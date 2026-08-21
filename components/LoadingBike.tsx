"use client";

import LottieIcon from "./LottieIcon";
import bicycleAnimation from "../app/assets/lottie/bicicleta delivery.json";

/**
 * The bike-track section of app/loading.tsx's card, split out on its own.
 * Purely presentational — `progress` (0–100) is owned by the caller so the
 * bike's horizontal position stays in lockstep with the progress bar below
 * it, same as the `frontend` branch's source (a single shared progress
 * value drives both). Styles live in app/loading.css.
 */
export default function LoadingBike({ progress }: { progress: number }) {
  return (
    <div className="loading-bike-track">
      <div className="loading-road" aria-hidden />
      <div className="loading-bike" style={{ left: `${Math.min(progress, 92)}%` }}>
        <LottieIcon animationData={bicycleAnimation} className="loading-bike-lottie" loop />
      </div>
      {/* road dashes */}
      <div className="loading-road-dashes" aria-hidden>
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="loading-road-dash" />
        ))}
      </div>
    </div>
  );
}
