"use client";

import { cn } from "@/lib/utils";

export type PlayerTypeValue = "EXTERNAL" | "INTERNAL";

type Size = "sm" | "md";

type Props = {
  value: PlayerTypeValue;
  onChange: (value: PlayerTypeValue) => void;
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

export function PlayerTypeToggle({
  value,
  onChange,
  size = "md",
  className,
}: Props) {
  const s = sizeClasses[size];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-bg-secondary/80 border border-border-dark shadow-sm",
        s.container,
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange("EXTERNAL")}
        className={cn(
          "font-medium rounded-md transition-colors flex items-center justify-center min-w-[90px]",
          s.button,
          value === "EXTERNAL"
            ? "bg-accent-primary text-primary-foreground shadow-[0_0_8px_rgba(var(--primary-rgb,255,106,0),0.5)]"
            : "text-text-muted hover:text-text-primary hover:bg-bg-primary/70"
        )}
      >
        Extern
      </button>
      <button
        type="button"
        onClick={() => onChange("INTERNAL")}
        className={cn(
          "font-medium rounded-md transition-colors flex items-center justify-center min-w-[90px]",
          s.button,
          value === "INTERNAL"
            ? "bg-accent-primary text-primary-foreground shadow-[0_0_8px_rgba(var(--primary-rgb,255,106,0),0.5)]"
            : "text-text-muted hover:text-text-primary hover:bg-bg-primary/70"
        )}
      >
        Intern
      </button>
    </div>
  );
}