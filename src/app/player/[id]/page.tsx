"use client";

import { use } from "react";
import { api } from "~/trpc/react";

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
      <main>{JSON.stringify(data, null, 2)}</main>
    </article>
  );
}
