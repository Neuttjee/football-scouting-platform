import { Skeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function LoadingContactsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-32 rounded-full" />
      </div>
      <TableSkeleton rows={6} />
    </div>
  );
}

