"use client";

import { useEffect, useState } from "react";
import { CartProvider } from "@/lib/CartContext";
import Loading from "../app/loading";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return loading ? (
    <Loading />
  ) : (
    <CartProvider>{children}</CartProvider>
  );
}