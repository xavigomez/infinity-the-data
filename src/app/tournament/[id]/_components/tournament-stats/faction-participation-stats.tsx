"use client";

import { api } from "~/trpc/react";
import { FactionParticipationChart } from "~/app/tournament/[id]/_components/tournament-stats/faction-participation-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface Props {
  tournamentID: string;
}

export function FactionParticipationStats({ tournamentID }: Props) {
  const { data: stats, isLoading } =
    api.tournaments.getTournamentStats.useQuery({
      tournamentId: tournamentID,
    });
  if (isLoading) return "loading...";
  if (!stats) return "no stats";
  return (
    <div>
      <h2 className={"font-title text-2xl font-medium text-primary"}>
        Faction participation stats
      </h2>
      <div className={"grid w-full grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"}>
        <FactionParticipationChart
          factionStats={stats.factionStats}
          sectorialStats={stats.sectorialStats}
        />
      </div>
    </div>
  );
}
