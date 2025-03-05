"use client";

import { use } from "react";
import { FactionLogo } from "~/components/faction-logo";
import { Card } from "~/components/ui/card";
import { api } from "~/trpc/react";
import { FactionCode } from "~/types/factions";

interface Params {
  id: string;
}

interface Props {
  params: Promise<Params>;
}

export default function Page({ params }: Props) {
  // Get the unwrapped value of the promise of the params
  const unwrappedParams = use(params);
  const playerPin = unwrappedParams.id;
  const { data, isLoading } = api.player.getPlayerStats.useQuery({
    playerPin: playerPin,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>No data found</div>;

  return (
    <article className="container mx-auto min-h-[calc(100vh-128px)] space-y-4 px-4 py-4 sm:py-8">
      <h1 className="text-2xl font-bold">Player {data.nickname}</h1>

      <Card className="w-full p-4 lg:w-1/2 xl:w-1/3">
        {Object.entries(data).map(([key, value]) => {
          if (
            key === "playerId" ||
            key === "year" ||
            key === "createdAt" ||
            key === "updatedAt" ||
            key === "nickname"
          ) {
            return null;
          }

          if (key === "totalFactions") {
            // Find all unique factions
            const factions = [...new Set(value as FactionCode[])];
            return (
              <div key={key} className="mb-2 flex">
                <span className="w-44 font-medium">{key}:</span>
                <span className="flex items-center gap-2">
                  {value ? (
                    factions.map((faction) => (
                      <FactionLogo
                        key={faction}
                        factionCode={faction}
                        className="size-5"
                      />
                    ))
                  ) : (
                    <span className="text-gray-500">None</span>
                  )}
                </span>
              </div>
            );
          }

          return (
            <div key={key} className="mb-2 flex">
              <span className="w-44 font-medium">{key}:</span>
              <span>
                {typeof value === "object"
                  ? JSON.stringify(value)
                  : String(value)}
              </span>
            </div>
          );
        })}
      </Card>
    </article>
  );
}
