"use client";

import { TournamentCard } from "~/components/tournaments/tournament-card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";

export default function TournamentsPage() {
  const { data: tournaments, isLoading: isLoadingTournaments } =
    api.tournaments.getAllTournaments.useQuery();

  if (!isLoadingTournaments && !tournaments) return;
  return (
    <article className="container mx-auto min-h-[calc(100vh-128px)] space-y-4 px-4 py-4 sm:py-8">
      <div className="flex items-center justify-between">
        <h2 className="font-title text-3xl font-bold text-primary">
          All tournaments
        </h2>
      </div>
      <main>
        {isLoadingTournaments && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-[122px]" />
            <Skeleton className="h-[122px]" />
            <Skeleton className="h-[122px]" />
          </div>
        )}
        {!isLoadingTournaments && !tournaments && (
          <div>No tournaments found</div>
        )}
        {!isLoadingTournaments && tournaments && (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                slug={tournament.slug}
                name={tournament.name}
                numberOfPlayers={tournament.numberOfPlayers}
                numberOfRounds={tournament.numberOfRounds}
                tournamentDate={tournament.tournamentDate}
                its={tournament.its}
              />
            ))}
          </ul>
        )}
      </main>
    </article>
  );
}
