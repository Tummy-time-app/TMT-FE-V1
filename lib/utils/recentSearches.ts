"use client";

import { useSyncExternalStore } from "react";

/**
 * localStorage-backed external store for recent searches. Modeled as a
 * proper subscribable store (rather than read-in-a-useEffect) so reads are
 * hydration-safe and reactive: `useRecentSearches()` re-renders any
 * subscriber the moment `addRecentSearch`/`clearRecentSearches` run,
 * anywhere in the app.
 */

const STORAGE_KEY = "tummytime_recent_searches";
const MAX_ENTRIES = 5;
const EMPTY: string[] = [];

type Listener = () => void;
const listeners = new Set<Listener>();

function readStorage(): string[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

let cachedSnapshot: string[] = readStorage();

function writeStorage(next: string[]) {
  cachedSnapshot = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  listeners.forEach((listener) => listener());
}

export function addRecentSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;
  const deduped = readStorage().filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
  writeStorage([trimmed, ...deduped].slice(0, MAX_ENTRIES));
}

export function clearRecentSearches() {
  writeStorage(EMPTY);
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): string[] {
  return cachedSnapshot;
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

/** Reactive read of the recent-searches list. Empty on the server; hydrates safely on the client. */
export function useRecentSearches(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
