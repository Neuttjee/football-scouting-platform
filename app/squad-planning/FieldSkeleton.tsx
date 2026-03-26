"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { FieldSlot } from "./types";

export function FieldSkeleton({ slots }: { slots: FieldSlot[] }) {
  return (
    <div className="card-premium rounded-lg p-0 overflow-hidden border border-accent-primary/50 bg-bg-secondary/40 shadow-inner w-full max-w-[980px] mx-auto">
      <div className="relative w-full aspect-[62/100] min-h-[320px] max-h-[92dvh]">
        <div className="absolute inset-0 rounded-[6px] border border-accent-primary/80" />
        <div className="absolute left-0 right-0 top-1/2 h-0 border-t border-accent-primary/80 -translate-y-px" />
        <div className="absolute left-1/2 top-1/2 w-[22%] aspect-square rounded-full border border-accent-primary/80 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-accent-primary -translate-x-1/2 -translate-y-1/2" />

        <div className="absolute left-[18%] right-[18%] top-0 h-[16%] border-b border-l border-r border-accent-primary/80 rounded-b-[3px]" />
        <div className="absolute left-[18%] right-[18%] bottom-0 h-[16%] border-t border-l border-r border-accent-primary/80 rounded-t-[3px]" />
        <div className="absolute left-[28%] right-[28%] top-0 h-[6%] border-b border-l border-r border-accent-primary/70 rounded-b-[2px]" />
        <div className="absolute left-[28%] right-[28%] bottom-0 h-[6%] border-t border-l border-r border-accent-primary/70 rounded-t-[2px]" />

        <div className="absolute left-1/2 top-[11%] w-2 h-2 rounded-full bg-accent-primary -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute left-1/2 top-[89%] w-2 h-2 rounded-full bg-accent-primary -translate-x-1/2 -translate-y-1/2" />

        {slots.map((slot) => (
          <div
            key={slot.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-36 lg:w-48"
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
          >
            <div className="rounded-md border border-white/40 bg-bg-secondary/90 p-2 shadow-md backdrop-blur-sm motion-reduce:animate-none">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-7 flex-1 bg-bg-primary/40 border border-dashed border-border-dark/80 motion-reduce:animate-none" />
                  <Skeleton className="h-7 w-6 bg-bg-primary/40 border border-border-dark/80 motion-reduce:animate-none" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-7 flex-1 bg-bg-primary/40 border border-dashed border-border-dark/80 motion-reduce:animate-none" />
                  <Skeleton className="h-7 w-6 bg-bg-primary/40 border border-border-dark/80 motion-reduce:animate-none" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

