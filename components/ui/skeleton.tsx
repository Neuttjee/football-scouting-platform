import * as React from "react";
import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-bg-secondary/60 animate-pulse",
        className
      )}
    />
  );
}

type TableSkeletonProps = {
  rows?: number;
};

export function TableSkeleton({ rows = 6 }: TableSkeletonProps) {
  return (
    <div className="card-premium rounded-xl border border-border-dark bg-bg-secondary/40 shadow-inner">
      <div className="border-b border-border-dark px-4 py-3">
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="divide-y divide-border-dark">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-4 w-4 rounded-sm" />
            <Skeleton className="h-4 w-40 flex-1" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

type CardSkeletonProps = {
  count?: number;
};

export function CardSkeleton({ count = 3 }: CardSkeletonProps) {
  return (
    <div className={cn("grid gap-6", count > 1 && "md:grid-cols-3")}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="card-premium p-6 rounded-xl border border-border-dark bg-bg-secondary/40 shadow-inner space-y-3"
        >
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="card-premium p-6 rounded-xl border border-border-dark bg-bg-secondary/40 shadow-inner space-y-3"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-16" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card-premium p-6 rounded-xl border border-border-dark bg-bg-secondary/40 shadow-inner space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

