"use client";

import { useState } from "react";
import LottieIcon from "@/components/LottieIcon";
import hamburgerMenuAnimation from "@/app/assets/lottie/hamburger-menu.json";
import { SideNav } from "./SideNav";

export function SideNavTrigger({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className={className}
      >
        <LottieIcon
          animationData={hamburgerMenuAnimation}
          className="size-10 sm:size-16"
          loop
        />
      </button>
      <SideNav open={open} onClose={() => setOpen(false)} />
    </>
  );
}
