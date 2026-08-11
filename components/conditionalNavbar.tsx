"use client"; 

import { usePathname } from "next/navigation";
import Navbar from "./Navigation";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  const hideOn = ["/login", "/register", "/verify", "/forgot-password", "/reset-password", "/vendor", "/rider", "/admin"];
  if (hideOn.some((path) => pathname.startsWith(path))) return null;

  return <Navbar />;
}