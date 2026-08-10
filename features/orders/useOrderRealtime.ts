"use client";

import { useAppSelector } from "@/store/hooks";
import { ordersApi, useGetOrderQuery } from "./ordersApi";
import type { OrderStatus } from "./types";

const TERMINAL_STATUSES: OrderStatus[] = ["delivered", "picked_up", "cancelled"];
const POLL_INTERVAL_MS = 4000;

const selectOrder = ordersApi.endpoints.getOrder.select;

/**
 * Live order status for the tracking page. Backed by polling against the
 * mock adapter today; spec §49 calls for a Supabase Realtime subscription
 * here — swapping that in later only means changing this hook's
 * internals, every call site (`useOrderRealtime(orderId)`) stays the same.
 *
 * Reads the already-cached status (if any) to decide this render's
 * polling interval, so it stops the moment a terminal status is in the
 * store — no extra state or effect needed to "remember" it across renders.
 */
export function useOrderRealtime(orderId: string) {
  const cachedStatus = useAppSelector((state) => selectOrder(orderId)(state).data?.status);
  const isTerminal = cachedStatus ? TERMINAL_STATUSES.includes(cachedStatus) : false;

  return useGetOrderQuery(orderId, {
    skip: !orderId,
    pollingInterval: isTerminal ? 0 : POLL_INTERVAL_MS,
  });
}
