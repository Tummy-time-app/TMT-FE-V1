"use client";

import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { useGetActiveBannersQuery } from "@/features/banners/bannersApi";

/** Active promotional banners for the homepage — renders nothing when there are none, so it never leaves an empty gap. */
export function BannerStrip() {
  const { data: banners } = useGetActiveBannersQuery("home");

  if (!banners || banners.length === 0) return null;

  return (
    <div className="mx-auto max-w-[1400px] px-[5vw] py-6">
      {banners.map((banner) => (
        <Link
          key={banner.id}
          href={banner.linkUrl}
          className="group relative flex h-44 items-center overflow-hidden rounded-2xl sm:h-60"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- admin-entered arbitrary image URLs, next/image needs a remote-domain allowlist we don't have */}
          <img src={banner.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-crimson-dark/90 via-crimson-dark/45 to-transparent" />
          <div className="relative z-10 flex items-center gap-3 px-6 sm:px-8">
            <div>
              <span className="mb-1 inline-block text-label font-extrabold uppercase tracking-wide text-amber">
                Limited-time offer
              </span>
              <p className="font-display text-h2 font-bold text-white sm:text-display">{banner.title}</p>
              <span className="mt-1 inline-flex items-center gap-1 text-small font-semibold text-white/90 transition-transform group-hover:translate-x-1">
                Learn more <ArrowRight size={14} aria-hidden />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
