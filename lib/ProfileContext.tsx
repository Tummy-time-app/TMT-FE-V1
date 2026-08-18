"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/* ── Shared profile type — this is the shape the (future) profile page reads ── */
export interface DeliveryAddress {
  label: "Home" | "Work" | "Other";
  line1: string;
  city: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  /** Local data-URL preview only — no upload/storage backend wired up yet. */
  avatarDataUrl: string | null;
  /** ISO yyyy-mm-dd, optional. */
  dateOfBirth: string;
  phone: string;
  address: DeliveryAddress;
  dietaryPreferences: string[];
  favoriteCuisines: string[];
  onboardingCompleted: boolean;
}

/** What onboarding collects before `onboardingCompleted` gets set. */
export type OnboardingDraft = Omit<UserProfile, "onboardingCompleted">;

export const emptyProfile: UserProfile = {
  firstName: "",
  lastName: "",
  avatarDataUrl: null,
  dateOfBirth: "",
  phone: "",
  address: { label: "Home", line1: "", city: "" },
  dietaryPreferences: [],
  favoriteCuisines: [],
  onboardingCompleted: false,
};

const STORAGE_KEY = "tummytime:profile";

interface ProfileContextValue {
  profile: UserProfile;
  /** False until the initial localStorage read completes — use this to avoid
   *  flashing an "incomplete profile" state before saved data has loaded. */
  isHydrated: boolean;
  updateProfile: (patch: Partial<UserProfile>) => void;
  completeOnboarding: (data: Omit<UserProfile, "onboardingCompleted">) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [hydrated, setHydrated] = useState(false);

  // Read any previously-saved profile once, after mount — reading
  // localStorage during render would desync server/client HTML.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setProfile({ ...emptyProfile, ...JSON.parse(raw) });
    } catch {
      // malformed or unavailable storage — fall back to the empty profile
    }
    setHydrated(true);
  }, []);

  // Persist on every change, once the initial read above has happened —
  // otherwise this would immediately overwrite a saved profile with the
  // empty default on first render.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // storage unavailable (private mode, quota) — in-memory state still works
    }
  }, [profile, hydrated]);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const completeOnboarding = useCallback(
    (data: Omit<UserProfile, "onboardingCompleted">) => {
      setProfile({ ...data, onboardingCompleted: true });
    },
    [],
  );

  return (
    <ProfileContext.Provider
      value={{ profile, isHydrated: hydrated, updateProfile, completeOnboarding }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return ctx;
}
