import { Skeleton, StatsSkeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function LoadingDashboardPage() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-40" />
      <StatsSkeleton />
      <CardSkeleton count={2} />
    </div>
  );
}

