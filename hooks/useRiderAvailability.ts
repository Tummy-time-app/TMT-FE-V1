"use client";

import { useSyncExternalStore } from "react";

/** Per-browser "online/offline" toggle for the rider dashboard — not synced to a backend (no rider marketplace to notify yet). */

const STORAGE_KEY = "tummytime_rider_online";

type Listener = () => void;
const listeners = new Set<Listener>();

function read(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

let cachedSnapshot = read();

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return cachedSnapshot;
}

function getServerSnapshot() {
  return false;
}

export function setRiderOnline(online: boolean) {
  cachedSnapshot = online;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, String(online));
  }
  listeners.forEach((l) => l());
}

export function useRiderOnline(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
