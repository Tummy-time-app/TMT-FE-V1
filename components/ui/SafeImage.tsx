"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { UtensilsIcon } from "@/components/icons";
import "./SafeImage.css";

type SafeImageProps = Omit<ImageProps, "src" | "onError"> & {
  src?: string | null;
  /** Class for the fallback placeholder specifically — defaults to reusing `className`, which covers the common case (both need the same rounded-corner/size treatment). */
  fallbackClassName?: string;
};

/**
 * Drop-in next/image wrapper that never shows a broken-image glyph.
 * Restaurant/menu-item images come from arbitrary, unverified backend
 * URLs — a missing `src`, a dead link, or an offline load all fall back
 * to a plain icon-on-tint placeholder instead of leaking a broken <img>
 * into every card and hero that renders one.
 */
export function SafeImage({ src, alt, className, fallbackClassName, fill, ...rest }: SafeImageProps) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        className={`safe-image-fallback ${fallbackClassName ?? className ?? ""}`}
        style={fill ? { position: "absolute", inset: 0 } : undefined}
        role="img"
        aria-label={alt}
      >
        <UtensilsIcon className="safe-image-fallback__icon" />
      </div>
    );
  }

  return (
    <Image src={src} alt={alt} className={className} fill={fill} onError={() => setErrored(true)} {...rest} />
  );
}
