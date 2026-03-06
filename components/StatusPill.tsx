import * as React from "react";
import { cn } from "@/lib/utils";

export type StatusTone = "success" | "danger" | "warning" | "neutral";

export function StatusPill({
  children,
  tone,
  className,
}: {
  children: React.ReactNode;
  tone: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "px-2 py-1 rounded text-xs",
        tone === "success" && "bg-green-100 text-green-800",
        tone === "danger" && "bg-red-100 text-red-800",
        tone === "warning" && "bg-yellow-100 text-yellow-800",
        tone === "neutral" && "bg-slate-100 text-slate-800",
        className
      )}
    >
      {children}
    </span>
  );
}

