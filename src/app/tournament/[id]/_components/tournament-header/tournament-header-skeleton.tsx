import { Skeleton } from "~/components/ui/skeleton";

export function TournamentHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-[60px]" />
      <Skeleton className="h-[18px]" />
    </div>
  );
}
