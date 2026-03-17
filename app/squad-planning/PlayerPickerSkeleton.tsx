"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { PlayerTypeValue } from "@/components/PlayerTypeToggle";

export function PlayerPickerSkeleton({
  selectedType,
  rows = 12,
}: {
  selectedType: PlayerTypeValue;
  rows?: number;
}) {
  return (
    <div className="card-premium rounded-xl p-4 space-y-4 motion-reduce:animate-none">
      <div className="space-y-2">
        <Skeleton className="h-10 w-full rounded bg-bg-primary/40 motion-reduce:animate-none" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Skeleton className="h-10 w-full rounded bg-bg-primary/40 motion-reduce:animate-none" />
          <Skeleton className="h-10 w-full rounded bg-bg-primary/40 motion-reduce:animate-none" />
        </div>

        {selectedType === "EXTERNAL" && (
          <Skeleton className="h-10 w-full rounded bg-bg-primary/40 motion-reduce:animate-none" />
        )}
      </div>

      <div className="space-y-2 max-h-[560px] overflow-y-auto">
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="border border-border-dark rounded p-2 bg-bg-secondary/50"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Skeleton className="h-7 w-7 rounded-full bg-bg-primary/40 motion-reduce:animate-none" />
                <Skeleton className="h-4 w-40 max-w-[70%] bg-bg-primary/40 motion-reduce:animate-none" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-10 rounded bg-bg-primary/40 motion-reduce:animate-none" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Skeleton className="h-3 w-24 bg-bg-primary/40 motion-reduce:animate-none" />
              <Skeleton className="h-3 w-20 bg-bg-primary/40 motion-reduce:animate-none" />
              <Skeleton className="h-3 w-12 bg-bg-primary/40 motion-reduce:animate-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

