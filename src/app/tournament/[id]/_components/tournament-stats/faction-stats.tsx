"use client";

import { api } from "~/trpc/react";
import { FactionParticipationChart } from "~/app/tournament/[id]/_components/tournament-stats/faction-participation-chart";
import { FactionPointsChart } from "~/app/tournament/[id]/_components/tournament-stats/faction-points-chart";
import { Skeleton } from "~/components/ui/skeleton";
import { FactionPerformanceChart } from "./faction-performance-chart";

interface Props {
  tournamentID: string;
}

export function FactionsStats({ tournamentID }: Props) {
  const { data: stats, isLoading } =
    api.tournaments.getTournamentStats.useQuery({
      tournamentId: tournamentID,
    });
  if (isLoading)
    return (
      <div
        className={
          "grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        <Skeleton className="h-[362px]" />
        <Skeleton className="h-[362px]" />
        <Skeleton className="hidden h-[362px] lg:block" />
      </div>
    );
  // TODO: implement not stats screen/try again/better error handling
  if (!stats) return "no stats";
  return (
    <div className="space-y-4">
      <h2 className={"font-title text-2xl font-medium text-primary"}>
        Faction stats
      </h2>
      <div
        className={
          "grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        <FactionPerformanceChart
          factionPerformance={stats.factionPerformance}
          sectorialPerformance={stats.sectorialPerformance}
        />
        <FactionParticipationChart
          factionStats={stats.factionStats}
          sectorialStats={stats.sectorialStats}
        />
        <FactionPointsChart
          factionPoints={stats.factionPoints}
          sectorialPoints={stats.sectorialPoints}
        />
      </div>
    </div>
  );
}
