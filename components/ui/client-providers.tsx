"use client";

import { LoadingProvider } from "@/components/ui/loading-context";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useLoading } from "@/components/ui/loading-context";
import type { ReactNode } from "react";

function LoadingOverlay() {
  const { globalLoading } = useLoading();

  if (!globalLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-background-dark/80">
      <PageSkeleton />
    </div>
  );
}

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <LoadingProvider>
      {children}
      <LoadingOverlay />
    </LoadingProvider>
  );
}
