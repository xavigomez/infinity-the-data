import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  players,
  tournamentPlayers,
  tournamentRounds,
  tournaments,
  roundResults,
} from "~/server/db/schema";
import type {
  Tournament,
  TournamentPlayer,
  TournamentRound,
  TournamentRoundResult,
} from "~/types/tournaments";
import { eq, inArray } from "drizzle-orm";

const createTournamentInputSchema = z.object({
  otmId: z.string(),
  tournamentDate: z.date(),
  name: z.string(),
  code: z.string(),
  game: z.string(),
  tier: z.number(),
  its: z.string(),
});

const addPlayersToTournamentInputSchema = z.object({
  playerOtmIds: z.array(z.string()),
  tournamentOtmId: z.string(),
});

const addRoundResultsTournamentInputSchema = z.object({
  results: z.array(
    z.object({
      playerId: z.string(),
      opponentId: z.string().optional(),
      opEarned: z.number(),
      vpEarned: z.number(),
      tpEarned: z.number(),
      closeLoss: z.boolean(),
      opEarnedOver5: z.boolean(),
      outcome: z.enum(["WIN", "LOSS", "DRAW", "BYE", "RETIRED"]),
      mission: z.string(),
    }),
  ),
  tournamentOtmId: z.string(),
});

const addRoundsTournamentInputSchema = z.object({
  tournamentId: z.string(),
  rounds: z.array(
    z.object({
      mission: z.string(),
      roundNumber: z.number(),
      startsAt: z.date().optional(),
      endsAt: z.date().optional(),
    }),
  ),
});

export const tournamentRouter = createTRPCRouter({
  create: publicProcedure
    .input(createTournamentInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input) throw new Error("CREATE_TOURNAMENT_NO_INPUT_DATA");
      const tournamentExists = await ctx.db.query.tournaments.findFirst({
        where: eq(tournaments.otmId, input.otmId),
      });
      if (tournamentExists) throw new Error("CREATE_TOURNAMENT_ALREADY_EXISTS");

      const now = new Date();
      const data: Omit<Tournament, "id"> = {
        otmId: input.otmId,
        tournamentDate: new Date(input.tournamentDate),
        name: input.name,
        code: input.code,
        game: input.game,
        tier: input.tier,
        its: input.its,
        createdAt: now,
        updatedAt: now,
      };

      return ctx.db.insert(tournaments).values(data);
    }),
  addPlayers: publicProcedure
    .input(addPlayersToTournamentInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input) throw new Error("ADD_PLAYERS_TOURNAMENT_NO_INPUT_DATA");

      const foundTournament = await ctx.db.query.tournaments.findFirst({
        where: eq(tournaments.otmId, input.tournamentOtmId),
      });

      if (!foundTournament)
        throw new Error("ADD_PLAYERS_TOURNAMENT_TOURNAMENT_NOT_FOUND");

      const foundPlayers = await ctx.db.query.players.findMany({
        where: inArray(players.otmId, input.playerOtmIds),
      });

      if (!foundPlayers)
        throw new Error("ADD_PLAYERS_TOURNAMENT_PLAYERS_NOT_FOUND");

      const data: TournamentPlayer[] = foundPlayers.map((player) => ({
        playerId: player.id,
        tournamentId: foundTournament.id,
      }));
      debugger;

      return ctx.db.insert(tournamentPlayers).values(data);
    }),
  addRounds: publicProcedure
    .input(addRoundsTournamentInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { tournamentId, rounds } = input;
      if (!tournamentId) throw new Error("ADD_ROUNDS_TOURNAMENT_NO_INPUT_DATA");
      if (!rounds || rounds.length === 0)
        throw new Error("ADD_ROUNDS_TOURNAMENT_NO_ROUNDS_DATA");

      const foundTournament = await ctx.db.query.tournaments.findFirst({
        where: eq(tournaments.otmId, tournamentId),
      });
      if (!foundTournament)
        throw new Error("ADD_ROUNDS_TOURNAMENT_TOURNAMENT_NOT_FOUND");

      const now = new Date();
      const data: Omit<TournamentRound, "id">[] = rounds.map((round) => ({
        tournamentId: foundTournament.id,
        mission: round.mission,
        roundNumber: round.roundNumber,
        startsAt: round.startsAt ? new Date(round.startsAt) : null,
        endsAt: round.endsAt ? new Date(round.endsAt) : null,
        createdAt: now,
        updatedAt: now,
      }));

      return ctx.db.insert(tournamentRounds).values(data);
    }),
  addRoundResults: publicProcedure
    .input(addRoundResultsTournamentInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { results, tournamentOtmId } = input;
      if (!tournamentOtmId)
        throw new Error("ADD_ROUND_RESULTS_TOURNAMENT_NO_INPUT_DATA");
      if (!results || results.length === 0)
        throw new Error("ADD_ROUND_RESULTS_TOURNAMENT_NO_RESULTS_DATA");

      const foundTournament = await ctx.db.query.tournaments.findFirst({
        where: eq(tournaments.otmId, tournamentOtmId),
      });
      if (!foundTournament)
        throw new Error("ADD_ROUND_RESULTS_TOURNAMENT_TOURNAMENT_NOT_FOUND");

      const foundRounds = await ctx.db.query.tournamentRounds.findMany({
        where: eq(tournamentRounds.tournamentId, foundTournament.id),
      });
      if (!foundRounds || foundRounds.length === 0)
        throw new Error("ADD_ROUND_RESULTS_TOURNAMENT_NO_ROUNDS_FOUND");

      // We make sure not to add the same player twice using a Set
      const playerOtmIds = new Set([
        ...results.map((result) => result.playerId),
        ...results
          .filter((result) => result.opponentId)
          .map((result) => result.opponentId!),
      ]);

      const foundPlayers = await ctx.db.query.players.findMany({
        where: inArray(players.otmId, Array.from(playerOtmIds)),
      });
      if (!foundPlayers || foundPlayers.length === 0)
        throw new Error("ADD_ROUND_RESULTS_TOURNAMENT_NO_PLAYERS_FOUND");

      const roundMap = new Map(
        foundRounds.map((round) => [round.mission, round.id]),
      );
      const playerMap = new Map(
        foundPlayers.map((player) => [player.otmId, player.id]),
      );

      const data: Omit<TournamentRoundResult, "id">[] = results.map(
        (result) => {
          const roundId = roundMap.get(result.mission);
          if (!roundId)
            throw new Error("ADD_ROUND_RESULTS_TOURNAMENT_ROUND_NOT_FOUND");

          const playerId = playerMap.get(result.playerId);
          if (!playerId)
            throw new Error("ADD_ROUND_RESULTS_TOURNAMENT_PLAYER_NOT_FOUND");

          // If the opponent is not present is a BYE
          // TODO: Should we add a "BYE" player to the DB?
          const opponentId = result.opponentId
            ? playerMap.get(result.opponentId)
            : null;
          if (result.opponentId && !opponentId)
            throw new Error("ADD_ROUND_RESULTS_TOURNAMENT_OPPONENT_NOT_FOUND");

          return {
            playerId,
            roundId,
            opponentId,
            opEarned: result.opEarned,
            vpEarned: result.vpEarned,
            tpEarned: result.tpEarned,
            closeLoss: result.closeLoss,
            opEarnedOver5: result.opEarnedOver5,
            outcome: result.outcome,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        },
      );
      return ctx.db.insert(roundResults).values(data);
    }),
});
