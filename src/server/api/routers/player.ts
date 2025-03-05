import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  players,
  tournaments,
  playerTournamentStats,
  playerStats,
} from "~/server/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import type { Player } from "~/types/players";

const playerInputSchema = z.object({
  nick: z.string().min(1),
  pin: z.string(),
  otmId: z.string(),
});

export const playerStatsInputSchema = z.object({
  playerPin: z.string(),
});

const playerBatchCreateInputSchema = z.array(playerInputSchema);

const addPlayerTournamentStatsInputSchema = z.object({
  tournamentOtmId: z.string(),
  stats: z.array(
    z.object({
      playerOtmId: z.string(),
      tournamentOtmId: z.string(),
      opEarned: z.number(),
      vpEarned: z.number(),
      tpEarned: z.number(),
      rank: z.number(),
      wins: z.number(),
      losses: z.number(),
      ties: z.number(),
      byes: z.number(),
      closeLosses: z.number(),
      fiveOpMatches: z.number(),
      lists: z.array(z.string()),
      faction: z.string(),
    }),
  ),
});

const updatePlayerStatsInputSchema = z.object({
  tournamentId: z.string(),
});

export const playerRouter = createTRPCRouter({
  create: publicProcedure
    .input(playerInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input) throw new Error("CREATE_PLAYER_NO_INPUT_DATA");
      const playerExists = await ctx.db.query.players.findFirst({
        where: eq(players.otmId, input.otmId),
      });
      if (playerExists) throw new Error("CREATE_PLAYER_ALREADY_EXISTS");
      const data: Omit<Player, "id"> = {
        nick: input.nick,
        pin: input.pin,
        otmId: input.otmId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return ctx.db.insert(players).values(data);
    }),
  batchCreate: publicProcedure
    .input(playerBatchCreateInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input) throw new Error("BATCH_CREATE_PLAYER_NO_INPUT_DATA");
      const now = new Date();
      return await ctx.db
        .insert(players)
        .values(
          input.map((player) => ({
            otmId: player.otmId,
            pin: player.pin,
            nick: player.nick,
            createdAt: now,
            updatedAt: now,
          })),
        )
        .onConflictDoUpdate({
          target: players.otmId,
          set: {
            pin: sql`excluded.pin`,
            nick: sql`excluded.nick`,
            updatedAt: now,
          },
        })
        .returning();
    }),
  addPlayerTournamentStats: publicProcedure
    .input(addPlayerTournamentStatsInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { tournamentOtmId, stats } = input;
      if (!tournamentOtmId)
        throw new Error("ADD_PLAYER_TOURNAMENT_STATS_NO_TOURNAMENT_ID");
      if (!stats || stats.length === 0)
        throw new Error("ADD_PLAYER_TOURNAMENT_STATS_NO_STATS");

      const foundTournament = await ctx.db.query.tournaments.findFirst({
        where: eq(tournaments.otmId, tournamentOtmId),
      });

      if (!foundTournament)
        throw new Error("ADD_PLAYER_TOURNAMENT_STATS_NO_TOURNAMENT");

      const playerOtmIds = stats.map((stat) => stat.playerOtmId);
      const foundPlayers = await ctx.db
        .select({
          id: players.id,
          otmId: players.otmId,
        })
        .from(players)
        .where(inArray(players.otmId, playerOtmIds));

      if (!foundPlayers || foundPlayers.length === 0)
        throw new Error("ADD_PLAYER_TOURNAMENT_STATS_NO_PLAYERS");

      const playerOtmIdToIdMap = new Map<string, string>(
        foundPlayers.map((player) => [player.otmId, player.id]),
      );
      const now = new Date();
      const data = stats.map((stat) => {
        const playerId = playerOtmIdToIdMap.get(stat.playerOtmId);
        if (!playerId)
          throw new Error("ADD_PLAYER_TOURNAMENT_STATS_PLAYER_NOT_FOUND");

        return {
          playerId,
          tournamentId: foundTournament.id,
          opEarned: stat.opEarned,
          vpEarned: stat.vpEarned,
          tpEarned: stat.tpEarned,
          tournamentRank: stat.rank,
          wins: stat.wins,
          losses: stat.losses,
          ties: stat.ties,
          byes: stat.byes,
          closeLosses: stat.closeLosses,
          faction: stat.faction,
          fiveOpMatches: stat.fiveOpMatches,
          lists: stat.lists,
          createdAt: now,
          updatedAt: now,
        };
      });

      await ctx.db.insert(playerTournamentStats).values(data);
    }),
  updatePlayerStats: publicProcedure
    .input(updatePlayerStatsInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { tournamentId } = input;
      if (!tournamentId)
        throw new Error("UPDATE_PLAYER_STATS_NO_TOURNAMENT_ID");

      const foundTournament = await ctx.db.query.tournaments.findMany({
        where: eq(tournaments.otmId, tournamentId),
      });
      const tournament = foundTournament[0];
      if (!foundTournament || !tournament)
        throw new Error("UPDATE_PLAYER_STATS_NO_TOURNAMENT_FOUND");

      const foundTournamentStats =
        await ctx.db.query.playerTournamentStats.findMany({
          where: eq(playerTournamentStats.tournamentId, tournament.id),
        });

      if (!foundTournamentStats)
        throw new Error("UPDATE_PLAYER_STATS_NO_STATS_FOUND");

      const playerIds = new Set<string>(
        foundTournamentStats.map((stat) => stat.playerId),
      );
      const foundPlayers = await ctx.db.query.players.findMany({
        where: inArray(players.id, Array.from(playerIds)),
      });
      if (!foundPlayers)
        throw new Error("UPDATE_PLAYER_STATS_NO_PLAYERS_FOUND");

      const existingPlayerIds = new Set<string>(
        foundPlayers.map((player) => player.id),
      );

      const validStats = foundTournamentStats.filter((stat) =>
        existingPlayerIds.has(stat.playerId),
      );

      const now = new Date();
      const tournamentYear = new Date(tournament.tournamentDate).getFullYear();

      const upsertOperations = foundTournamentStats.map(
        async (tournamentStat) => {
          return ctx.db
            .insert(playerStats)
            .values({
              playerId: tournamentStat.playerId,
              year: tournamentYear,
              totalVp: tournamentStat.vpEarned,
              totalTp: tournamentStat.tpEarned,
              totalOp: tournamentStat.opEarned,
              totalWins: tournamentStat.wins,
              totalLosses: tournamentStat.losses,
              totalTies: tournamentStat.ties,
              totalByes: tournamentStat.byes,
              totalCloseLosses: tournamentStat.closeLosses,
              totalFiveOpMatches: tournamentStat.fiveOpMatches,
              totalTournaments: 1,
              totalFactions: [tournamentStat.faction],
              createdAt: now,
              updatedAt: now,
            })
            .onConflictDoUpdate({
              target: [playerStats.playerId, playerStats.year],
              set: {
                totalVp: sql`${playerStats.totalVp} + ${tournamentStat.vpEarned}`,
                totalTp: sql`${playerStats.totalTp} + ${tournamentStat.tpEarned}`,
                totalOp: sql`${playerStats.totalOp} + ${tournamentStat.opEarned}`,
                totalWins: sql`${playerStats.totalWins} + ${tournamentStat.wins}`,
                totalLosses: sql`${playerStats.totalLosses} + ${tournamentStat.losses}`,
                totalTies: sql`${playerStats.totalTies} + ${tournamentStat.ties}`,
                totalByes: sql`${playerStats.totalByes} + ${tournamentStat.byes}`,
                totalCloseLosses: sql`${playerStats.totalCloseLosses} + ${tournamentStat.closeLosses}`,
                totalFiveOpMatches: sql`${playerStats.totalFiveOpMatches} + ${tournamentStat.fiveOpMatches}`,
                totalTournaments: sql`${playerStats.totalTournaments} + 1`,
                totalFactions: sql`array_append(${playerStats.totalFactions}, ${tournamentStat.faction})`,
                updatedAt: now,
              },
            });
        },
      );
      return Promise.all(upsertOperations);
    }),
  getPlayerStats: publicProcedure
    .input(playerStatsInputSchema)
    .query(async ({ ctx, input }) => {
      const { playerPin } = input;
      if (!playerPin)
        throw new Error("GET_PLAYER_STATS_NO_PLAYER_PIN_PROVIDED");

      const foundPlayer = await ctx.db.query.players.findFirst({
        where: eq(players.pin, playerPin),
      });

      if (!foundPlayer) throw new Error("GET_PLAYER_STATS_PLAYER_NOT_FOUND");

      const foundPlayerStats = await ctx.db.query.playerStats.findFirst({
        where: eq(playerStats.playerId, foundPlayer.id),
      });

      if (!foundPlayerStats)
        throw new Error("GET_PLAYER_STATS_PLAYER_STATS_NOT_FOUND");

      return { nickname: foundPlayer.nick, ...foundPlayerStats };
    }),
});
