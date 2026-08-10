"use client";

import { useRef, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "./index";

export function StoreProvider({ children }: { children: ReactNode }) {
  // One store per browser tab, created lazily on first render — safe for
  // the Next.js App Router where module scope can be shared across requests.
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
