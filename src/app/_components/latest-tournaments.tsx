"use client";

import { Calendar, Target, Users } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/trpc/react";

export function LatestTournaments() {
  const { data: tournaments, isLoading: isLoadingTournaments } =
    api.tournaments.getAllTournaments.useQuery();

  if (isLoadingTournaments) return <div>Loading...</div>;
  if (!tournaments) return <div>No tournaments found</div>;
  return (
    <article className="space-y-4">
      <h2 className="font-title text-3xl font-bold text-primary">
        Latest Tournaments
      </h2>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tournaments.map((tournament) => (
          <li key={tournament.id}>
            <Link href={`/tournament/${tournament.slug}`}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>{tournament.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="flex gap-2 text-sm [&>li]:flex [&>li]:items-center [&>li]:gap-1">
                    <li>
                      <Calendar className="size-4 text-secondary" />
                      <span>
                        {tournament.tournamentDate.toLocaleDateString()}
                      </span>
                    </li>
                    <li>
                      <Users className="size-4 text-secondary" />
                      <span>{tournament.numberOfPlayers} players</span>
                    </li>
                    <li>
                      <Target className="size-4 text-secondary" />
                      <span>{tournament.numberOfRounds} rounds</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
