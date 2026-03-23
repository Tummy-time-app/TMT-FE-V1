"use client"; 

import { usePathname } from "next/navigation";
import Navbar from "./Navigation";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) return null;

  return <Navbar />;
}