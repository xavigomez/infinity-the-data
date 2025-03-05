import { Skeleton } from "~/components/ui/skeleton";

export function TournamentHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-[60px] w-72 sm:w-96" />
      <Skeleton className="h-[18px] w-52 sm:w-72" />
    </div>
  );
}
