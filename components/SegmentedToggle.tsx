"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md";

export type SegmentedOption<Value extends string> = {
  value: Value;
  label: string;
};

type BaseProps<Value extends string> = {
  value: Value;
  onChange: (value: Value) => void;
  options: SegmentedOption<Value>[];
  size?: Size;
  className?: string;
};

const sizeClasses: Record<Size, { button: string; container: string }> = {
  sm: {
    container: "p-0.5",
    button: "px-3 py-1 text-xs",
  },
  md: {
    container: "p-1",
    button: "px-4 py-2 text-sm",
  },
};

export function SegmentedToggle<Value extends string>({
  value,
  onChange,
  options,
  size = "md",
  className,
}: BaseProps<Value>) {
  const s = sizeClasses[size];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-bg-secondary/80 border border-border-dark shadow-sm",
        s.container,
        className
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "font-medium rounded-md transition-colors flex items-center justify-center min-w-[90px]",
              s.button,
              isActive
                ? "bg-accent-primary text-primary-foreground shadow-[0_0_8px_rgba(var(--primary-rgb,255,106,0),0.5)]"
                : "text-text-muted hover:text-text-primary hover:bg-bg-primary/70"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

