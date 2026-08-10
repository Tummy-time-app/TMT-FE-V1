"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useAppDispatch } from "@/store/hooks";
import { authApi } from "./authApi";
import { restorationFailed, restoring, setCredentials } from "./authSlice";
import { SESSION_STORAGE_KEY } from "./authListeners";

/**
 * Restores a persisted session on app boot. Runs in the background —
 * public pages render immediately; it's up to protected route layouts
 * (customer/vendor/rider/admin) to read `useAuth().isSessionLoading` and
 * hold off rendering gated content until it resolves.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) {
      dispatch(restorationFailed());
      return;
    }

    let token: string | undefined;
    try {
      token = (JSON.parse(stored) as { accessToken?: string }).accessToken;
    } catch {
      token = undefined;
    }

    if (!token) {
      dispatch(restorationFailed());
      return;
    }

    dispatch(restoring());
    dispatch(authApi.endpoints.getSession.initiate(token))
      .unwrap()
      .then((response) => dispatch(setCredentials(response)))
      .catch(() => dispatch(restorationFailed()));
  }, [dispatch]);

  return <>{children}</>;
}
