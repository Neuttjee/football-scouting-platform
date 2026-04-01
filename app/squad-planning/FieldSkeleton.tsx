"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { FieldSlot } from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function FieldSkeleton({ slots }: { slots: FieldSlot[] }) {
  const fieldRef = React.useRef<HTMLDivElement | null>(null);
  const [fieldWidthPx, setFieldWidthPx] = React.useState(0);

  React.useEffect(() => {
    const element = fieldRef.current;
    if (!element) return;

    const updateWidth = () => {
      setFieldWidthPx(element.clientWidth);
    };
    updateWidth();

    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width ?? element.clientWidth;
      setFieldWidthPx(nextWidth);
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const slotSizingVars = React.useMemo(() => {
    const width = fieldWidthPx || 980;
    const slotWidth = clamp(width * 0.255, 200, 310);
    const slotRowHeight = clamp(slotWidth * 0.22, 36, 52);
    const slotControlWidth = clamp(slotWidth * 0.12, 24, 36);
    const slotControlHeight = clamp(slotRowHeight * 0.9, 28, 42);

    return {
      "--slot-w": `${slotWidth}px`,
      "--slot-row-h": `${slotRowHeight}px`,
      "--slot-control-w": `${slotControlWidth}px`,
      "--slot-control-h": `${slotControlHeight}px`,
    } as React.CSSProperties;
  }, [fieldWidthPx]);

  return (
    <div className="card-premium rounded-lg p-0 overflow-hidden border border-accent-primary/50 bg-bg-secondary/40 shadow-inner w-full max-w-[1180px] mx-auto">
      <div
        ref={fieldRef}
        style={slotSizingVars}
        className="relative w-full aspect-[62/100] min-h-[320px] max-h-[92dvh]"
      >
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
            className="absolute -translate-x-1/2 -translate-y-1/2 w-[var(--slot-w)]"
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
          >
            <div className="rounded-md border border-white/40 bg-bg-secondary/90 p-2 shadow-md backdrop-blur-sm motion-reduce:animate-none">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Skeleton
                    className="h-[var(--slot-row-h)] flex-1 bg-bg-primary/40 border border-dashed border-border-dark/80 motion-reduce:animate-none"
                  />
                  <Skeleton
                    className="w-[var(--slot-control-w)] h-[var(--slot-control-h)] bg-bg-primary/40 border border-border-dark/80 motion-reduce:animate-none"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Skeleton
                    className="h-[var(--slot-row-h)] flex-1 bg-bg-primary/40 border border-dashed border-border-dark/80 motion-reduce:animate-none"
                  />
                  <Skeleton
                    className="w-[var(--slot-control-w)] h-[var(--slot-control-h)] bg-bg-primary/40 border border-border-dark/80 motion-reduce:animate-none"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

