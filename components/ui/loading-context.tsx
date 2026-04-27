"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface LoadingState {
  globalLoading: boolean;
  localLoading: Record<string, boolean>;
  setGlobalLoading: (loading: boolean) => void;
  startLocalLoading: (key: string) => void;
  stopLocalLoading: (key: string) => void;
}

const LoadingContext = createContext<LoadingState | null>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [globalLoading, setGlobalLoading] = useState(false);
  const [localLoading, setLocalLoadingState] = useState<Record<string, boolean>>({});

  const startLocalLoading = useCallback((key: string) => {
    setLocalLoadingState((prev) => ({ ...prev, [key]: true }));
  }, []);

  const stopLocalLoading = useCallback((key: string) => {
    setLocalLoadingState((prev) => ({ ...prev, [key]: false }));
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        globalLoading,
        localLoading,
        setGlobalLoading,
        startLocalLoading,
        stopLocalLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
