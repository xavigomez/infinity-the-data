"use client";

import { api } from "~/trpc/react";
import { FactionParticipationChart } from "~/app/tournament/[id]/_components/tournament-stats/faction-participation-chart";
import { FactionPointsChart } from "~/app/tournament/[id]/_components/tournament-stats/faction-points-chart";
import { Skeleton } from "~/components/ui/skeleton";

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
          "grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        }
      >
        <Skeleton className="h-[362px]" />
        <Skeleton className="h-[362px]" />
      </div>
    );
  if (!stats) return "no stats";
  return (
    <div>
      <h2 className={"font-title text-2xl font-medium text-primary"}>
        Faction stats
      </h2>
      <div
        className={
          "grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        }
      >
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
