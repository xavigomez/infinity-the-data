"use client";

import {
  ArrowRight,
  Calendar,
  CircleGauge,
  FileBadge,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
            <li key={tournament.id}>
              <Link href={`/tournament/${tournament.slug}`}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>{tournament.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid grid-cols-2 gap-2 text-sm [&>li]:flex [&>li]:items-center [&>li]:gap-1">
                      <li>
                        <Users className="size-4 text-secondary" />
                        <span>{tournament.numberOfPlayers} players</span>
                      </li>
                      <li>
                        <Target className="size-4 text-secondary" />
                        <span>{tournament.numberOfRounds} rounds</span>
                      </li>
                      <li>
                        <Calendar className="size-4 text-secondary" />
                        <span>
                          {tournament.tournamentDate.toLocaleDateString()}
                        </span>
                      </li>
                      <li>
                        <FileBadge className="size-4 text-secondary" />
                        <span>ITS {tournament.its}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </Link>
            </li>
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
