"use client";

import { createContext, useContext, useMemo } from "react";
import type { ClubConfig } from "@/lib/clubConfig";
import type { ClubFeatureKey } from "@/lib/clubFeatures";

type ClubConfigContextValue = {
  config: ClubConfig | null;
  hasFeature: (key: ClubFeatureKey) => boolean;
};

const ClubConfigContext = createContext<ClubConfigContextValue | undefined>(
  undefined,
);

export function ClubConfigProvider({
  value,
  children,
}: {
  value: ClubConfig | null;
  children: React.ReactNode;
}) {
  const ctxValue = useMemo<ClubConfigContextValue>(
    () => ({
      config: value,
      hasFeature: (key: ClubFeatureKey) => {
        if (!value) return false;
        return Boolean(value.features[key]);
      },
    }),
    [value],
  );

  return (
    <ClubConfigContext.Provider value={ctxValue}>
      {children}
    </ClubConfigContext.Provider>
  );
}

export function useClubConfig(): ClubConfigContextValue {
  const ctx = useContext(ClubConfigContext);
  if (!ctx) {
    throw new Error("useClubConfig must be used within a ClubConfigProvider");
  }
  return ctx;
}

export function useHasFeature(key: ClubFeatureKey): boolean {
  const { hasFeature } = useClubConfig();
  return hasFeature(key);
}

