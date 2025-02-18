import { notFound } from "next/navigation";
import { useEffect } from "react";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";

interface Props {
  tournamentId: string;
}

export function TournamentHeader({ tournamentId }: Props) {
  // Fetch the tournament data
  const { data: tournament, isLoading } =
    api.tournaments.getTournament.useQuery({
      tournamentId: tournamentId,
    });

  // If no data is found, redirect to not found page
  useEffect(() => {
    if (!isLoading && !tournament) notFound();
  }, [isLoading]);

  // Add loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Add null check for data
  if (!tournament) {
    return null;
  }
  if (!tournament) {
    return null;
  }
  console.log(tournament);
  return (
    <header>
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
