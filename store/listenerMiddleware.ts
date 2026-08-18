import { createListenerMiddleware } from "@reduxjs/toolkit";

/**
 * Shared listener middleware instance. Feature slices register their own
 * side effects (persistence, analytics, cross-slice reactions) by calling
 * `listenerMiddleware.startListening(...)` in a module that gets imported
 * once from store/index.ts — see features/auth/authListeners.ts.
 */
export const listenerMiddleware = createListenerMiddleware();
