"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import VendorCard from "@/components/VendorCard";
import { ArrowLeft, ArrowRight } from "@/components/icons";
import type { Vendor } from "@/features/vendors/types";

interface Props {
  title: string;
  vendors: Vendor[];
  seeAllHref?: string;
}

/**
 * A horizontally-scrolling row of restaurant cards with hover-revealed
 * prev/next arrows — this is the core building block of Uber Eats' own
 * homepage feed ("Popular near you", "Pizza near you", …), used in place
 * of a single flat grid so the page can surface many groupings without
 * runaway vertical length.
 */
export function VendorCarousel({ title, vendors, seeAllHref }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, vendors.length]);

  const scrollBy = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * trackRef.current.clientWidth * 0.85, behavior: "smooth" });
  };

  if (vendors.length === 0) return null;

  return (
    <section className="hf-carousel-section">
      <div className="hf-carousel-head">
        <h2 className="hf-carousel-title">{title}</h2>
        {seeAllHref && (
          <Link href={seeAllHref} className="hf-carousel-seeall">
            See all <ArrowRight size={13} aria-hidden />
          </Link>
        )}
      </div>

      <div className="hf-carousel-wrap">
        <button
          type="button"
          className={`hf-carousel-nav hf-carousel-nav--left ${canScrollLeft ? "" : "hf-carousel-nav--hidden"}`}
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
          tabIndex={canScrollLeft ? 0 : -1}
        >
          <ArrowLeft size={16} aria-hidden />
        </button>

        <div className="hf-carousel-track" ref={trackRef}>
          {vendors.map((v) => (
            <div key={v.id} className="hf-carousel-card">
              <VendorCard vendor={v} />
            </div>
          ))}
        </div>

        <button
          type="button"
          className={`hf-carousel-nav hf-carousel-nav--right ${canScrollRight ? "" : "hf-carousel-nav--hidden"}`}
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
          tabIndex={canScrollRight ? 0 : -1}
        >
          <ArrowRight size={16} aria-hidden />
        </button>
      </div>
    </section>
  );
}
