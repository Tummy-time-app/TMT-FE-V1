"use client";

import { useState } from "react";
import { MenuIcon } from "@/components/icons";
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
        <MenuIcon className="size-5 sm:size-6" />
      </button>
      <SideNav open={open} onClose={() => setOpen(false)} />
    </>
  );
}
