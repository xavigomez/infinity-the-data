import { Skeleton } from "~/components/ui/skeleton";

export function TournamentTableSkeleton() {
  return (
    <div className="space-y-1">
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
