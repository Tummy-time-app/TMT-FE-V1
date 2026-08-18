import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./api/baseApi";
import { listenerMiddleware } from "./listenerMiddleware";
import authReducer from "@/features/auth/authSlice";
// Imported for its side effect: registers session-persistence listeners.
import "@/features/auth/authListeners";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(listenerMiddleware.middleware)
        .concat(baseApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
