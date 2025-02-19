import { notFound } from "next/navigation";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { TournamentHeaderSkeleton } from "./tournament-header-skeleton";

interface Props {
  tournamentId: string;
}

export function TournamentHeader({ tournamentId }: Props) {
  // Fetch the tournament data
  const { data: tournament, isLoading } =
    api.tournaments.getTournament.useQuery({
      tournamentId: tournamentId,
    });

  // Add loading state
  if (isLoading) return <TournamentHeaderSkeleton />;

  // Add null check for data
  if (!tournament) return notFound();
  return (
    <header className="space-y-2">
      <h1 className="text-5xl font-bold text-primary md:text-6xl">
        {tournament.name}
      </h1>
      <div className="flex gap-2">
        <Badge variant="reverse">
          {tournament.tournamentDate.getFullYear()}
        </Badge>
        <Badge variant="reverse">ITS {tournament.its}</Badge>
        <Badge variant="reverse">{tournament.numberOfPlayers} players</Badge>
        <Badge variant="reverse">{tournament.numberOfRounds} rounds</Badge>
        <Badge variant="reverse">Tier {tournament.tier}</Badge>
      </div>
    </header>
  );
}
