"use client";
import { use } from "react";
import { TournamentDataTable } from "~/app/tournament/[id]/_components/tournament-table/tournament-data-table";
import { TournamentHeader } from "~/app/tournament/[id]/_components/tournament-header/tournament-header";
import { FactionsStats } from "~/app/tournament/[id]/_components/tournament-stats/faction-stats";

interface Params {
  id: string;
}

interface Props {
  params: Promise<Params>;
}

export default function Page({ params }: Props) {
  // Get the unwrapped value of the promise of the params
  const unwrappedParams = use(params);
  const tournamentID = unwrappedParams.id;

  return (
    <article className="container mx-auto min-h-[calc(100vh-128px)] p-4">
      <TournamentHeader tournamentId={tournamentID} />
      <main className="mt-8 space-y-4">
        <FactionsStats tournamentID={tournamentID} />
        <TournamentDataTable tournamentId={tournamentID} />
      </main>
    </article>
  );
}
