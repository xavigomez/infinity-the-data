import { Calendar, FileBadge, Target, Users } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

// TODO: Fix types in query to remove | null
interface Props {
  slug: string | null;
  name: string;
  numberOfPlayers: number | null;
  numberOfRounds: number | null;
  tournamentDate: Date;
  its: string;
}

export function TournamentCard({
  slug,
  name,
  numberOfPlayers,
  numberOfRounds,
  tournamentDate,
  its,
}: Props) {
  return (
    <li>
      <Link href={`/tournaments/${slug}`}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{name}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-2 gap-2 text-sm [&>li]:flex [&>li]:items-center [&>li]:gap-1">
              <li>
                <Users className="size-4 text-secondary" />
                <span>{numberOfPlayers} players</span>
              </li>
              <li>
                <Target className="size-4 text-secondary" />
                <span>{numberOfRounds} rounds</span>
              </li>
              <li>
                <Calendar className="size-4 text-secondary" />
                <span>{tournamentDate.toLocaleDateString()}</span>
              </li>
              <li>
                <FileBadge className="size-4 text-secondary" />
                <span>ITS {its}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </Link>
    </li>
  );
}
