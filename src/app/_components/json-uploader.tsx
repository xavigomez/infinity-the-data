"use client";

import { useJsonFile } from "~/hooks/utils/use-json-file";
import { useEffect } from "react";
import useTransformRawTournamentData, {
  type RawTournamentData,
} from "~/hooks/utils/use-transform-raw-tournament-data";
import { api } from "~/trpc/react";

export function JsonUploader() {
  const { jsonContent, error, handleFileUpload } = useJsonFile();
  const {
    players,
    tournament,
    setRawData,
    rounds,
    roundResults,
    playerTournamentStats,
  } = useTransformRawTournamentData();

  useEffect(() => {
    if (jsonContent) setRawData(jsonContent as RawTournamentData);
  }, [jsonContent, players, tournament, rounds]);

  const utils = api.useUtils();

  const createPlayersMutation = api.player.batchCreate.useMutation({
    onSuccess: async () => {
      await utils.tournaments.invalidate();
      console.log("Players added to tournament");
    },
  });
  const createTournamentMutation = api.tournaments.create.useMutation({
    onSuccess: async () => {
      await utils.tournaments.invalidate();
      console.log("Tournament added");
    },
  });
  const addPlayersToTournament = api.tournaments.addPlayers.useMutation({
    onSuccess: async () => {
      await utils.tournaments.invalidate();
      console.log("Players added to tournament");
    },
    onError: (error) => {
      console.error(error);
    },
  });
  const addTournamentRounds = api.tournaments.addRounds.useMutation({
    onSuccess: async () => {
      await utils.tournaments.invalidate();
    },
  });
  const addRoundResultsToTournament =
    api.tournaments.addRoundResults.useMutation({
      onSuccess: async () => {
        await utils.tournaments.invalidate();
        console.log("Round results added");
      },
    });
  const addPlayerTournamentStats =
    api.player.addPlayerTournamentStats.useMutation({
      onSuccess: async () => {
        await utils.tournaments.invalidate();
        console.log("Player tournament stats added");
      },
    });
  const updatePlayerStats = api.player.updatePlayerStats.useMutation();

  const handleAddPlayersToTournament = () => {
    if (!tournament || !players) return;
    const tournamentOtmId = tournament.otmId;
    const playerOtmIds = players.map((player) => player.otmId);
    const data = { tournamentOtmId, playerOtmIds };
    addPlayersToTournament.mutate(data);
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
      {error && <p>{error}</p>}

      <div className="mt-4 grid grid-cols-3 gap-2">
        {players.length !== 0 && (
          <button
            className="rounded bg-green-600 px-4 py-2"
            onClick={() => createPlayersMutation.mutate(players)}
          >
            Add players
          </button>
        )}
        {tournament && (
          <button
            className="rounded bg-green-600 px-4 py-2"
            onClick={() => createTournamentMutation.mutate(tournament)}
          >
            Add tournament
          </button>
        )}
        {tournament && players.length !== 0 && (
          <button
            className="rounded bg-green-600 px-4 py-2"
            onClick={handleAddPlayersToTournament}
          >
            Add players to tournament
          </button>
        )}
        {rounds.length !== 0 && tournament && (
          <button
            className="rounded bg-green-600 px-4 py-2"
            onClick={() =>
              addTournamentRounds.mutate({
                tournamentId: tournament.otmId,
                rounds,
              })
            }
          >
            Add rounds
          </button>
        )}
        {roundResults && (
          <button
            className="rounded bg-green-600 px-4 py-2"
            onClick={() => addRoundResultsToTournament.mutate(roundResults)}
          >
            Add round results
          </button>
        )}
        {playerTournamentStats && tournament && (
          <button
            className="rounded bg-green-600 px-4 py-2"
            onClick={() =>
              addPlayerTournamentStats.mutate({
                tournamentOtmId: tournament.otmId,
                stats: playerTournamentStats,
              })
            }
          >
            Add player tournament stats
          </button>
        )}
        {tournament && (
          <button
            className="rounded bg-green-600 px-4 py-2"
            onClick={() =>
              updatePlayerStats.mutate({ tournamentId: tournament.otmId })
            }
          >
            Update player stats
          </button>
        )}
      </div>
    </div>
  );
}
