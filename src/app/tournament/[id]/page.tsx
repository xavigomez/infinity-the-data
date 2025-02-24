"use client";

import { use } from "react";
import { TournamentDataTable } from "~/app/tournament/[id]/_components/tournament-table/tournament-data-table";
import { TournamentHeader } from "~/app/tournament/[id]/_components/tournament-header/tournament-header";

interface Params {
  id: string;
}

interface Props {
  params: Promise<Params>;
}

export default function Page({ params }: Props) {
  // Get the unwrapped value of the promise of the params
  const unwrappedParams = use(params);
  const tournamentId = unwrappedParams.id;

  return (
    <article className="container mx-auto min-h-[calc(100vh-128px)] space-y-4 px-4 py-4 sm:py-8">
      <TournamentHeader tournamentId={tournamentId} />
      <main>
        <TournamentDataTable tournamentId={tournamentId} />
      </main>
    </article>
  );
}
