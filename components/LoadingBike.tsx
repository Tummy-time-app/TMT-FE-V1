"use client";

import { useEffect, useState } from "react";
import LottieIcon from "./LottieIcon";
import bicycleAnimation from "../app/assets/lottie/bicicleta delivery.json";

const LoadingBike = () => {
  const [progress, setProgress] = useState(0);

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

  return (
    <>
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

      {/* ── inline styles ── */}
      <style>
        {`
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
        `}
      </style>
    </>
  );
};

export default LoadingBike;
