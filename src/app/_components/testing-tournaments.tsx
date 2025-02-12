"use client";

import { api } from "~/trpc/react";

export default function TestingTournaments() {
  const { data, isLoading } = api.tournaments.getTournamentPlayerData.useQuery({
    tournamentId: "79905bee-ef8a-41b4-ac7e-f43bd7a8cf0c",
  });
  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;
  console.log(data);
  return (
    <div>
      <h1>Testing Tournaments</h1>
      {/*<ul>*/}
      {/*{data.map((player) => (*/}
      {/*  <li key={player.playerId} className={'flex flex-col gap-2'}>*/}
      {/*    {player.playerId} VS {player.opponentId}*/}
      {/*  </li>*/}
      {/*))}*/}
      {/*</ul>*/}
    </div>
  );
}
