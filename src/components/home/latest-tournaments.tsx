"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { TournamentCard } from "~/components/tournaments/tournament-card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";

export function LatestTournaments() {
  const { data: tournaments, isLoading: isLoadingTournaments } =
    api.tournaments.getAllTournaments.useQuery();

  if (!isLoadingTournaments && !tournaments) return;
  return (
    <article className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-title text-3xl font-bold text-primary">
          Latest Tournaments
        </h2>
        <Link href="/tournaments" className="hidden items-center gap-2 sm:flex">
          <span>View all tournaments</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>
      {isLoadingTournaments && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[122px]" />
          <Skeleton className="h-[122px]" />
          <Skeleton className="h-[122px]" />
        </div>
      )}
      {!isLoadingTournaments && !tournaments && <div>No tournaments found</div>}
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
      <div className="flex justify-center sm:hidden">
        <Button>
          <Link href="/tournaments" className="flex items-center gap-2">
            View all tournaments
          </Link>
        </Button>
      </div>
    </article>
  );
}
