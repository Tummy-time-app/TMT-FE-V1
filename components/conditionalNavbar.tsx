"use client"; 

import { usePathname } from "next/navigation";
import Navbar from "./Navigation";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Exact-segment match, not a raw prefix — `startsWith("/vendor")` used to
  // also swallow every customer-facing "/vendors/*" route (the restaurant
  // marketplace) since "/vendors" begins with the literal string "/vendor".
  // "/vendor-onboarding" is listed explicitly: it's a standalone form page
  // like /register, not part of the /vendor dashboard shell, but it isn't
  // reachable via a "/vendor" segment-prefix match either.
  const hideOn = ["/login", "/register", "/verify", "/forgot-password", "/reset-password", "/vendor", "/vendor-onboarding", "/rider", "/admin"];
  const hidden = hideOn.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (hidden) return null;

  return <Navbar />;
}