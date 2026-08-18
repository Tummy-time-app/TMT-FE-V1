"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loggedOut } from "./authSlice";

/**
 * Central read/write point for auth state. Route guards, nav, and forms
 * should all go through this rather than reaching into the store directly.
 */
export function useAuth() {
  const { user, session, status } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  return {
    user,
    session,
    status,
    role: user?.role ?? null,
    isAuthenticated: status === "authenticated",
    /** True while the initial session-restoration check is still running. */
    isSessionLoading: status === "idle" || status === "loading",
    logout: () => dispatch(loggedOut()),
  };
}
