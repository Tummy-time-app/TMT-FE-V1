"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "tummytime:favoriteRestaurants";
const EMPTY_SET = new Set<string>();
const listeners = new Set<() => void>();

function readFavorites(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

let snapshot = readFavorites();

function emitChange() {
  snapshot = readFavorites();
  listeners.forEach((l) => l());
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

/**
 * Local-only "saved restaurants" — localStorage-backed. Reads via
 * useSyncExternalStore rather than the read-in-an-effect pattern
 * lib/ProfileContext.tsx uses: getServerSnapshot returns an empty set,
 * matching what a not-yet-hydrated client would show, so there's no
 * separate "isHydrated" flag for callers to juggle, and it stays reactive
 * if ever read from more than one component at once. There's no
 * favorites feature/backend yet (features/ has no favorites/ dir); this
 * is a real, working toggle scoped to this browser, not a decorative
 * button with no onClick.
 */
export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, () => snapshot, () => EMPTY_SET);

  const toggle = useCallback((id: string) => {
    const current = readFavorites();
    if (current.has(id)) current.delete(id);
    else current.add(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(current)));
    } catch {
      // storage unavailable (private mode, quota) — emitChange() below still
      // updates every subscribed component for this session
    }
    emitChange();
  }, []);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  return { isFavorite, toggle };
}
