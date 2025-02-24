import { HydrateClient } from "~/trpc/server";
import { LatestTournaments } from "~/app/_components/latest-tournaments";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="container mx-auto flex min-h-[calc(100vh-128px)] flex-col p-4">
        <LatestTournaments />
      </main>
    </HydrateClient>
  );
}
