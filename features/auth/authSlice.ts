import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthSession, User } from "./types";

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

export interface AuthState {
  user: User | null;
  session: AuthSession | null;
  status: AuthStatus;
}

const initialState: AuthState = {
  user: null,
  session: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Session restoration from a persisted token has started. */
    restoring(state) {
      state.status = "loading";
    },
    /** No persisted session found, or restoration failed. */
    restorationFailed(state) {
      state.user = null;
      state.session = null;
      state.status = "unauthenticated";
    },
    setCredentials(state, action: PayloadAction<{ user: User; session: AuthSession }>) {
      state.user = action.payload.user;
      state.session = action.payload.session;
      state.status = "authenticated";
    },
    /** A request came back 401 — the API layer dispatches this centrally. */
    sessionExpired(state) {
      state.user = null;
      state.session = null;
      state.status = "unauthenticated";
    },
    loggedOut(state) {
      state.user = null;
      state.session = null;
      state.status = "unauthenticated";
    },
    /** Patches the cached user's vendorId right after onboarding creates their store — see vendorsApi.ts's createVendor. */
    linkVendor(state, action: PayloadAction<string>) {
      if (state.user) state.user.vendorId = action.payload;
    },
    /** Patches the cached user's own profile fields after a successful `PATCH /users/me` — see usersApi.ts's updateProfile. */
    patchProfile(state, action: PayloadAction<Partial<User>>) {
      if (state.user) Object.assign(state.user, action.payload);
    },
  },
});

export const { restoring, restorationFailed, setCredentials, sessionExpired, loggedOut, linkVendor, patchProfile } =
  authSlice.actions;
export default authSlice.reducer;
