"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "tummytime:recentSearches";
const MAX_ENTRIES = 6;
const EMPTY: string[] = [];
const listeners = new Set<() => void>();

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

let snapshot = read();

function emitChange() {
  snapshot = read();
  listeners.forEach((l) => l());
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

/**
 * Local-only recent-search history for the nav search panel — same
 * useSyncExternalStore/localStorage pattern as lib/useFavorites.ts (see
 * that file's doc comment for why useSyncExternalStore over the
 * read-in-an-effect pattern lib/ProfileContext.tsx uses).
 */
export function useRecentSearches() {
  const recent = useSyncExternalStore(subscribe, () => snapshot, () => EMPTY);

  const add = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const deduped = read().filter((t) => t.toLowerCase() !== trimmed.toLowerCase());
    const next = [trimmed, ...deduped].slice(0, MAX_ENTRIES);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable — emitChange() below still updates this session
    }
    emitChange();
  }, []);

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    emitChange();
  }, []);

  return { recent, add, clear };
}
