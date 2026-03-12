import { Skeleton, FormSkeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function LoadingSettingsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-40" />
      </div>

      <FormSkeleton rows={3} />

      <div className="card-premium p-6 rounded-lg space-y-4 border border-border-dark bg-bg-secondary/40">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>
        <TableSkeleton rows={5} />
      </div>
    </div>
  );
}

