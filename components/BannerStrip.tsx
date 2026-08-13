"use client";

import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { useGetActiveBannersQuery } from "@/features/banners/bannersApi";

/** Active promotional banners for the homepage — renders nothing when there are none, so it never leaves an empty gap. */
export function BannerStrip() {
  const { data: banners } = useGetActiveBannersQuery("home");

  if (!banners || banners.length === 0) return null;

  return (
    <div className="mx-auto max-w-[1400px] px-[5vw] pb-2">
      {banners.map((banner) => (
        <Link
          key={banner.id}
          href={banner.linkUrl}
          className="group relative flex h-32 items-center overflow-hidden rounded-2xl sm:h-40"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- admin-entered arbitrary image URLs, next/image needs a remote-domain allowlist we don't have */}
          <img src={banner.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="relative z-10 flex items-center gap-3 px-6 sm:px-8">
            <div>
              <p className="font-display text-h3 font-bold text-white sm:text-h2">{banner.title}</p>
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
