import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  players,
  tournamentPlayers,
  tournamentRounds,
  tournaments,
  roundResults,
  playerTournamentStats,
} from "~/server/db/schema";
import type {
  Tournament,
  TournamentPlayer,
  TournamentRound,
  TournamentRoundResult,
} from "~/types/tournaments";
import { eq, inArray, and, or } from "drizzle-orm";
import type { PlayerTournamentData } from "~/types/players";
import type { FactionCode } from "~/types/factions";
import { TRPCError } from "@trpc/server";

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

const findTournamentByIdSchema = z.object({
  tournamentId: z.string(),
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
  getTournamentPlayerData: publicProcedure
    .input(z.object({ tournamentId: z.string() }))
    .query(async ({ ctx, input }): Promise<PlayerTournamentData[]> => {
      const { tournamentId } = input;
      if (!tournamentId)
        throw new Error("GET_TOURNAMENT_PLAYER_DATA_NO_INPUT_DATA");

      let foundTournament = await ctx.db.query.tournaments.findFirst({
        where: eq(tournaments.slug, tournamentId),
      });

      // If not found by slug, try to find by UUID
      if (!foundTournament) {
        try {
          foundTournament = await ctx.db.query.tournaments.findFirst({
            where: eq(tournaments.id, tournamentId),
          });
        } catch (error) {
          // TODO: Handle error
        }
      }

      // If no tournament found return 404
      if (!foundTournament) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tournament not found",
        });
      }

      // Get tournament players
      const foundTournamentPlayers = await ctx.db
        .select({
          playerId: tournamentPlayers.playerId,
        })
        .from(tournamentPlayers)
        .where(eq(tournamentPlayers.tournamentId, foundTournament.id));

      if (!foundTournamentPlayers || foundTournamentPlayers.length === 0)
        throw new Error(
          "GET_TOURNAMENT_PLAYER_DATA_NO_TOURNAMENT_PLAYERS_FOUND",
        );

      // Get player stats and basic info
      const playerStats = await ctx.db
        .select({
          id: players.id,
          nickname: players.nick,
          pin: players.pin,
          lists: playerTournamentStats.lists,
          faction: playerTournamentStats.faction,
          totalTp: playerTournamentStats.tpEarned,
          totalOp: playerTournamentStats.opEarned,
          totalVp: playerTournamentStats.vpEarned,
        })
        .from(playerTournamentStats)
        .innerJoin(players, eq(playerTournamentStats.playerId, players.id))
        .where(eq(playerTournamentStats.tournamentId, foundTournament.id));

      // Get all round results for the tournament
      const roundResultsData = await ctx.db
        .select({
          playerId: roundResults.playerId,
          opponentId: roundResults.opponentId,
          tpEarned: roundResults.tpEarned,
          opEarned: roundResults.opEarned,
          vpEarned: roundResults.vpEarned,
          closeLoss: roundResults.closeLoss,
          opEarnedOver5: roundResults.opEarnedOver5,
          opponentNick: players.nick,
          opponentFaction: playerTournamentStats.faction,
          opponentPin: players.pin,
          roundNumber: tournamentRounds.roundNumber,
        })
        .from(roundResults)
        .innerJoin(
          tournamentRounds,
          eq(roundResults.roundId, tournamentRounds.id),
        )
        .leftJoin(players, eq(roundResults.opponentId, players.id))
        .leftJoin(
          playerTournamentStats,
          and(
            eq(playerTournamentStats.playerId, roundResults.opponentId),
            eq(playerTournamentStats.tournamentId, foundTournament.id),
          ),
        )
        .where(eq(tournamentRounds.tournamentId, foundTournament.id))
        .orderBy(tournamentRounds.roundNumber);

      return playerStats
        .sort((a, b) => {
          // First sort by totalTp
          if (a.totalTp !== b.totalTp) {
            return b.totalTp - a.totalTp; // Descending order
          }
          // If totalTp is equal, sort by totalOp
          if (a.totalOp !== b.totalOp) {
            return b.totalOp - a.totalOp; // Descending order
          }
          // If totalOp is also equal, sort by totalVp
          return b.totalVp - a.totalVp; // Descending order
        })
        .map((player): PlayerTournamentData => {
          const playerRounds = roundResultsData.filter(
            (round) => round.playerId === player.id,
          );

          const matchResults = playerRounds.map((round) =>
            round.opponentId
              ? `Round ${round.roundNumber}: vs ${round.opponentNick}`
              : `Round ${round.roundNumber}: BYE`,
          );

          const matchResultsDetail = playerRounds.map((round) => ({
            opponentInfo: {
              nickname: round.opponentNick ?? "BYE",
              faction: (round.opponentFaction as FactionCode) ?? "none",
              pin: round.opponentPin ?? "0",
            },
            opponentPoints: {
              tournament: round.tpEarned,
              objective: round.opEarned,
              victory: round.vpEarned,
            },
          }));

          return {
            id: player.id,
            nickname: player.nickname,
            lists: player.lists ?? [],
            faction: player.faction as FactionCode,
            matchResults,
            matchResultsDetail,
            pin: player.pin,
            points: {
              tournament: playerRounds.map((r) => r.tpEarned),
              objective: playerRounds.map((r) => r.opEarned),
              victory: playerRounds.map((r) => r.vpEarned),
              reachedFivePoints: playerRounds.map((r) => r.opEarnedOver5),
              closeLoss: playerRounds.map((r) => r.closeLoss),
            },
            totals: {
              tournament: player.totalTp,
              objective: player.totalOp,
              victory: player.totalVp,
            },
          };
        });
    }),
  getAllTournaments: publicProcedure.query(async ({ ctx }) => {
    const tournaments = await ctx.db.query.tournaments.findMany();
    return tournaments;
  }),
  getLatest: publicProcedure.query(async ({ ctx }) => {
    const tournament = await ctx.db.query.tournaments.findFirst({
      orderBy: (tournaments, { desc }) => [desc(tournaments.createdAt)],
    });

    return tournament ?? null;
  }),
  getTournament: publicProcedure
    .input(findTournamentByIdSchema)
    .query(async ({ ctx, input }) => {
      const { tournamentId } = input;

      if (!tournamentId)
        throw new Error("GET_TOURNAMENT_PLAYER_DATA_NO_INPUT_DATA");

      let foundTournament = await ctx.db.query.tournaments.findFirst({
        where: eq(tournaments.slug, tournamentId),
      });

      // If not found by slug, try to find by UUID
      if (!foundTournament) {
        try {
          foundTournament = await ctx.db.query.tournaments.findFirst({
            where: eq(tournaments.id, tournamentId),
          });
        } catch (error) {
          // Invalid UUID format, return null
          return null;
        }
      }

      if (!foundTournament)
        throw new Error("GET_TOURNAMENT_PLAYER_DATA_NO_FOUND_TOURNAMENT");

      return foundTournament;
    }),
  getTournamentStats: publicProcedure
    .input(findTournamentByIdSchema)
    .query(async ({ ctx, input }) => {
      const { tournamentId } = input;

      if (!tournamentId)
        throw new Error("GET_TOURNAMENT_PLAYER_DATA_NO_INPUT_DATA");

      let foundTournament = await ctx.db.query.tournaments.findFirst({
        where: eq(tournaments.slug, tournamentId),
      });

      // If not found by slug, try to find by UUID
      if (!foundTournament) {
        try {
          foundTournament = await ctx.db.query.tournaments.findFirst({
            where: eq(tournaments.id, tournamentId),
          });
        } catch (error) {
          // Invalid UUID format, return null
          return null;
        }
      }

      if (!foundTournament)
        throw new Error("GET_TOURNAMENT_PLAYER_DATA_NO_FOUND_TOURNAMENT");

      // Get player stats
      const foundPlayerStats =
        await ctx.db.query.playerTournamentStats.findMany({
          where: eq(playerTournamentStats.tournamentId, foundTournament.id),
        });

      // Extract sectorial stats from foundPlayerStats
      const sectorialStats = foundPlayerStats.reduce(
        (acc, player) => {
          const faction = player.faction as FactionCode;
          if (!acc[faction]) {
            acc[faction] = 1;
          } else {
            acc[faction]++;
          }
          return acc;
        },
        {} as Record<FactionCode, number>,
      );

      // First, collect total points and player counts per faction
      const sectorialPerformanceRawData = foundPlayerStats.reduce(
        (acc, player) => {
          const faction = player.faction as FactionCode;
          if (!acc[faction]) {
            acc[faction] = {
              totalPoints: player.vpEarned + player.opEarned + player.tpEarned,
              count: 1,
            };
          } else {
            acc[faction].totalPoints +=
              player.vpEarned + player.opEarned + player.tpEarned;
            acc[faction].count += 1;
          }
          return acc;
        },
        {} as Record<FactionCode, { totalPoints: number; count: number }>,
      );

      // Then calculate the average performance for each faction
      const sectorialPerformance = Object.entries(
        sectorialPerformanceRawData,
      ).reduce(
        (acc, [faction, { totalPoints, count }]) => {
          acc[faction as FactionCode] = totalPoints / count;
          return acc;
        },
        {} as Record<FactionCode, number>,
      );

      const sectorialPoints = foundPlayerStats.reduce(
        (acc, player) => {
          const faction = player.faction as FactionCode;
          if (!acc[faction]) {
            acc[faction] = {
              vp: player.vpEarned,
              op: player.opEarned,
              tp: player.tpEarned,
              totalPlayers: 1,
            };
          } else {
            acc[faction].vp += player.vpEarned;
            acc[faction].op += player.opEarned;
            acc[faction].tp += player.tpEarned;
            acc[faction].totalPlayers++;
          }
          return acc;
        },
        {} as Record<
          FactionCode,
          { vp: number; op: number; tp: number; totalPlayers: number }
        >,
      );

      // Extract faction stats. Factions are sectorials grouped by faction.
      // e.g. 101 is panoceania. All pano sectorials will be grouped under 101.
      // Pano sectorials start with 10, so 102, 103, 104, etc.
      // Factions go from "10" to "110". So "10X" is pano, but "110X" is JSA.
      const factionStats = Object.entries(sectorialStats).reduce(
        (acc, [sectorial, count]) => {
          let faction;
          if (sectorial.length === 4) {
            faction = (sectorial.substring(0, 2) + "01") as FactionCode;
          } else {
            faction = (sectorial[0] + "01") as FactionCode;
          }

          if (!acc[faction]) {
            acc[faction] = count;
          } else {
            acc[faction] += count;
          }
          return acc;
        },
        {} as Record<FactionCode, number>,
      );

      const factionPerformanceRawData = Object.entries(
        sectorialPerformanceRawData,
      ).reduce(
        (acc, [sectorial, performance]) => {
          let faction;
          if (sectorial.length === 4) {
            faction = (sectorial.substring(0, 2) + "01") as FactionCode;
          } else {
            faction = (sectorial[0] + "01") as FactionCode;
          }

          if (!acc[faction]) {
            acc[faction] = {
              totalPoints: performance.totalPoints,
              totalPlayers: performance.count,
            };
          } else {
            acc[faction].totalPoints += performance.totalPoints;
            acc[faction].totalPlayers += performance.count;
          }
          return acc;
        },
        {} as Record<
          FactionCode,
          { totalPoints: number; totalPlayers: number }
        >,
      );

      const factionPerformance = Object.entries(
        factionPerformanceRawData,
      ).reduce(
        (acc, [faction, { totalPoints, totalPlayers }]) => {
          const factionCode = faction as FactionCode;
          acc[factionCode] = totalPoints / totalPlayers;
          return acc;
        },
        {} as Record<FactionCode, number>,
      );

      const factionPoints = Object.entries(sectorialPoints).reduce(
        (acc, [sectorial, points]) => {
          let faction;
          if (sectorial.length === 4) {
            faction = (sectorial.substring(0, 2) + "01") as FactionCode;
          } else {
            faction = (sectorial[0] + "01") as FactionCode;
          }

          if (!acc[faction]) {
            acc[faction] = { ...points };
          } else {
            acc[faction].vp += points.vp;
            acc[faction].op += points.op;
            acc[faction].tp += points.tp;
            acc[faction].totalPlayers += points.totalPlayers;
          }
          return acc;
        },
        {} as Record<
          FactionCode,
          { vp: number; op: number; tp: number; totalPlayers: number }
        >,
      );

      return {
        sectorialStats,
        factionStats,
        sectorialPoints,
        factionPoints,
        sectorialPerformance,
        factionPerformance,
      };
    }),
});
