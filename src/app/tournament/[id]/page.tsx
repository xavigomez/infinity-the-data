"use client";

import { use, useEffect, useState } from "react";
import { TournamentDataTable } from "~/app/tournament/[id]/_components/tournament-table/tournament-data-table";
import { TournamentHeader } from "~/app/tournament/[id]/_components/tournament-header/tournament-header";
import { FactionsStats } from "~/app/tournament/[id]/_components/tournament-stats/faction-stats";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";

interface Params {
  id: string;
}

interface Props {
  params: Promise<Params>;
}

export default function Page({ params }: Props) {
  const [scrolledPastHeader, setScrolledPastHeader] = useState(false);
  // Get the unwrapped value of the promise of the params
  const unwrappedParams = use(params);
  const tournamentID = unwrappedParams.id;

  useEffect(() => {
    const scrollY = window.scrollY;
    console.log(scrollY);
    const handleScroll = () => {
      if (window.scrollY > 64) {
        setScrolledPastHeader(true);
      } else {
        setScrolledPastHeader(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <article className="container relative mx-auto min-h-[calc(100vh-128px)] space-y-4 p-4">
      <TournamentHeader tournamentId={tournamentID} />
      <main className="mt-8 space-y-4">
        <Tabs defaultValue="players" className={"block space-y-8 sm:hidden"}>
          <TabsList
            className={cn(
              "grid w-full grid-cols-2 sm:w-[400px]",
              scrolledPastHeader && "sticky top-20 z-10",
            )}
          >
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="faction-stats">Faction stats</TabsTrigger>
          </TabsList>
          <TabsContent value="players">
            <TournamentDataTable tournamentId={tournamentID} />
          </TabsContent>
          <TabsContent value="faction-stats">
            <FactionsStats tournamentID={tournamentID} />
          </TabsContent>
        </Tabs>
        <div className="hidden space-y-4 sm:block">
          <FactionsStats tournamentID={tournamentID} />
          <TournamentDataTable tournamentId={tournamentID} />
        </div>
      </main>
    </article>
  );
}
