"use client";

import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./index";

export function StoreProvider({ children }: { children: ReactNode }) {
  // Lazy initializer runs once per mounted provider — safe for the Next.js
  // App Router where module scope can be shared across requests.
  const [store] = useState(() => makeStore());

  return <Provider store={store}>{children}</Provider>;
}
