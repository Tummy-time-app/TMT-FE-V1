import { listenerMiddleware } from "@/store/listenerMiddleware";
import { setCredentials, loggedOut, sessionExpired } from "./authSlice";

/** localStorage key for the persisted session. Read by AuthProvider on boot. */
export const SESSION_STORAGE_KEY = "tummytime_session";

// Persist the session whenever it's set...
listenerMiddleware.startListening({
  actionCreator: setCredentials,
  effect: (action) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(action.payload.session));
  },
});

// ...and clear it on logout or expiry.
listenerMiddleware.startListening({
  matcher: (action): action is ReturnType<typeof loggedOut> | ReturnType<typeof sessionExpired> =>
    action.type === loggedOut.type || action.type === sessionExpired.type,
  effect: () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  },
});
