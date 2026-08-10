"use client";

import { useEffect, useRef, useState } from "react";
import type { LatLng } from "@/lib/maps/types";

/**
 * Smoothly tweens between successive `target` values instead of snapping —
 * spec §22: "Rider movement should animate smoothly rather than jumping
 * between GPS updates." Each new `target` (e.g. from a 4s poll) starts a
 * fresh ease-out animation from wherever the marker currently is.
 */
export function useAnimatedLatLng(target: LatLng | null, durationMs = 1800): LatLng | null {
  const [current, setCurrent] = useState<LatLng | null>(target);
  const frameRef = useRef<number | null>(null);
  const fromRef = useRef<LatLng | null>(target);

  useEffect(() => {
    if (!target) {
      setCurrent(null);
      return;
    }

    const from = fromRef.current ?? target;
    const start = performance.now();

    function tick(now: number) {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setCurrent({
        lat: from.lat + (target!.lat - from.lat) * eased,
        lng: from.lng + (target!.lng - from.lng) * eased,
      });
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.lat, target?.lng, durationMs]);

  return current;
}
