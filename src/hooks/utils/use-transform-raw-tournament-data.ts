import { useEffect, useState } from "react";

interface Player {
  otmId: string;
  nick: string;
  pin: string;
}

interface Tournament {
  otmId: string;
  tournamentDate: Date;
  name: string;
  code: string;
  game: string;
  tier: number;
  its: string;
}

interface Round {
  tournamentId: string;
  mission: string;
  roundNumber: number;
}

interface RoundResult {
  playerId: string;
  opponentId?: string;
  opEarned: number;
  vpEarned: number;
  tpEarned: number;
  closeLoss: boolean;
  opEarnedOver5: boolean;
  outcome: RoundOutcome;
  mission: string;
}

interface RoundResults {
  results: RoundResult[];
  tournamentOtmId: string;
}

export interface PlayerTournamentStats {
  tournamentOtmId: string;
  playerOtmId: string;
  opEarned: number;
  vpEarned: number;
  tpEarned: number;
  rank: number;
  wins: number;
  losses: number;
  ties: number;
  byes: number;
  closeLosses: number;
  fiveOpMatches: number;
  lists: string[];
  faction: string;
}

type RoundOutcome = "WIN" | "LOSS" | "DRAW" | "BYE" | "RETIRED";

export interface RawTournamentData {
  id: string;
  type: string;
  code: string;
  game: string;
  name: string;
  date: number;
  operation: null;
  extras: null;
  tier: number;
  rounds: RawRound[];
  playerList: {
    identityId: string;
    nick: string;
    pin: string;
    lists: {
      codes: string[];
      faction: string;
    };
  }[];
}

interface RawRound {
  round: string;
  bye: string;
  matches: RawMatch[];
}

interface RawPlayerMatch {
  identityId: string;
  points: RawPoints[];
}

interface RawMatch {
  player1: RawPlayerMatch;
  player2: RawPlayerMatch;
}

interface RawPoints {
  code: string;
  value: number;
}

const TOURNAMENT_OUTCOME_VALUES = {
  WIN: 4,
  DRAW: 2,
  LOSS: 0,
  BYE: 4,
};

const MATCH_OUTCOME_VALUES = {
  WIN: "WIN",
  LOSS: "LOSS",
  DRAW: "DRAW",
  BYE: "BYE",
  RETIRED: "RETIRED",
};
const CLOSE_LOSS_BONUS = 1;
const CLOSE_LOSS_THRESHOLD = 2;
const FIVE_POINTS_BONUS = 1;
const FIVE_POINTS_THRESHOLD = 5;

export default function useTransformRawTournamentData() {
  const [rawData, setRawData] = useState<RawTournamentData | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [roundResults, setRoundResults] = useState<RoundResults | null>(null);
  const [playerTournamentStats, setPlayerTournamentStats] = useState<
    PlayerTournamentStats[]
  >([]);

  useEffect(() => {
    if (!rawData) return;
    handleTransformTournament(rawData);
    handleTransformPlayers(rawData.playerList);
    handleTransformRounds(rawData.rounds);
    handleTransformRoundResults(rawData.rounds, rawData.id);
  }, [rawData]);

  useEffect(() => {
    if (roundResults) {
      if (!rawData || !roundResults) return;
      handleTransformPlayerTournamentStats(rawData.playerList, roundResults);
    }
  }, [rawData, roundResults]);

  const handleTransformPlayers = (
    rawPlayerListData: RawTournamentData["playerList"],
  ) => {
    const transformedPlayers = rawPlayerListData.map(
      ({ identityId: otmId, nick: nick, pin }) => ({
        otmId,
        nick,
        pin,
      }),
    );
    setPlayers(transformedPlayers);
  };
  const handleTransformTournament = (rawTournamentData: RawTournamentData) => {
    const transformedTournament: Tournament = {
      otmId: rawTournamentData.id,
      tournamentDate: new Date(rawTournamentData.date),
      name: rawTournamentData.name,
      code: rawTournamentData.code,
      game: rawTournamentData.game,
      tier: rawTournamentData.tier,
      its: "16",
    };
    setTournament(transformedTournament);
  };
  const handleTransformRounds = (rawRounds: RawRound[]) => {
    if (!rawData) return;
    const transformedRounds: Round[] = rawRounds.map(({ round }, index) => ({
      tournamentId: rawData.id,
      mission: round,
      roundNumber: index + 1,
    }));

    setRounds(transformedRounds);
  };
  const handleTransformRoundResults = (
    rawRounds: RawRound[],
    tournamentOtmId: string,
  ) => {
    if (!rawRounds) return [];
    const getPlayerData = (player: RawPlayerMatch) => ({
      id: player.identityId,
      op: player.points.find((point) => point.code === "OP")?.value ?? 0,
      vp: player.points.find((point) => point.code === "VP")?.value ?? 0,
    });
    const calculateCloseLoss = (
      player1op: number,
      player2op: number,
      outcome: RoundOutcome,
    ): boolean => {
      if (outcome !== MATCH_OUTCOME_VALUES.LOSS) return false;
      return player2op - player1op <= 2;
    };
    const calculateOutCome = (
      player1op: number,
      player2op: number,
    ): RoundOutcome => {
      if (player1op > player2op)
        return MATCH_OUTCOME_VALUES.WIN as RoundOutcome;
      if (player1op < player2op)
        return MATCH_OUTCOME_VALUES.LOSS as RoundOutcome;
      return MATCH_OUTCOME_VALUES.DRAW as RoundOutcome;
    };
    const calculateTpEarned = (
      op: number,
      outcome: RoundOutcome,
      opEarnedOverFive: boolean,
      closeLoss: boolean,
    ): number => {
      let calculatedTp = 0;
      if (outcome === "WIN") calculatedTp += TOURNAMENT_OUTCOME_VALUES.WIN;
      if (outcome === "DRAW") calculatedTp += TOURNAMENT_OUTCOME_VALUES.DRAW;
      if (outcome === "LOSS") calculatedTp += TOURNAMENT_OUTCOME_VALUES.LOSS;
      if (outcome === "LOSS" && closeLoss) calculatedTp += CLOSE_LOSS_BONUS;
      if (opEarnedOverFive) calculatedTp += FIVE_POINTS_BONUS;
      return calculatedTp;
    };

    const results: RoundResult[] = [];

    rawRounds.map((round) => {
      if (round.bye !== "") {
        const byeRoundResult: RoundResult = {
          playerId: round.bye,
          outcome: "BYE",
          closeLoss: false,
          opEarnedOver5: false,
          opEarned: 0,
          vpEarned: 0,
          tpEarned: TOURNAMENT_OUTCOME_VALUES.BYE,
          mission: round.round,
        };
        results.push(byeRoundResult);
      }
      round.matches.forEach((match) => {
        const { id: p1ID, op: p1Op, vp: p1Vp } = getPlayerData(match.player1);
        const { id: p2ID, op: p2Op, vp: p2Vp } = getPlayerData(match.player2);

        const p1Outcome = calculateOutCome(p1Op, p2Op);
        const p1CloseLoss = calculateCloseLoss(p1Op, p2Op, p1Outcome);
        const player1RoundResult: RoundResult = {
          playerId: p1ID,
          opponentId: p2ID,
          outcome: p1Outcome,
          closeLoss: p1CloseLoss,
          opEarnedOver5: p1Op >= FIVE_POINTS_THRESHOLD,
          opEarned: p1Op,
          vpEarned: p1Vp,
          tpEarned: calculateTpEarned(p1Op, p1Outcome, p1Op >= 5, p1CloseLoss),
          mission: round.round,
        };

        const p2Outcome = calculateOutCome(p2Op, p1Op);
        const p2CloseLoss = calculateCloseLoss(p2Op, p1Op, p2Outcome);
        const player2RoundResult: RoundResult = {
          playerId: p2ID,
          opponentId: p1ID,
          outcome: p2Outcome,
          closeLoss: p2CloseLoss,
          opEarnedOver5: p2Op >= FIVE_POINTS_THRESHOLD,
          opEarned: p2Op,
          vpEarned: p2Vp,
          tpEarned: calculateTpEarned(p2Op, p2Outcome, p2Op >= 5, p2CloseLoss),
          mission: round.round,
        };

        results.push(player1RoundResult);
        results.push(player2RoundResult);
      });
    });
    const roundResults: RoundResults = {
      results,
      tournamentOtmId,
    };
    setRoundResults(roundResults);
  };
  const handleTransformPlayerTournamentStats = (
    rawPlayerList: RawTournamentData["playerList"],
    roundResults: RoundResults,
  ) => {
    if (!roundResults) throw new Error("No round results found");
    if (!rawPlayerList) throw new Error("No player list found");
    const results = roundResults.results;

    const playerLists = rawPlayerList.map((player) => ({
      otmPlayerId: player.identityId,
      lists: player.lists.codes,
      faction: player.lists.faction,
    }));

    const playerTournamentStats: PlayerTournamentStats[] = playerLists.map(
      (player) => {
        const {
          totalTpEarned,
          totalOpEarned,
          totalVpEarned,
          closeLosses,
          opEarnedOver5,
          wins,
          ties,
          losses,
          byes,
        } = results.reduce(
          (acc, round) =>
            round.playerId === player.otmPlayerId
              ? {
                  totalTpEarned: acc.totalTpEarned + round.tpEarned,
                  totalOpEarned: acc.totalOpEarned + round.opEarned,
                  totalVpEarned: acc.totalVpEarned + round.vpEarned,
                  closeLosses: acc.closeLosses + (round.closeLoss ? 1 : 0),
                  opEarnedOver5:
                    acc.opEarnedOver5 + (round.opEarnedOver5 ? 1 : 0),
                  wins: acc.wins + (round.outcome === "WIN" ? 1 : 0),
                  ties: acc.ties + (round.outcome === "DRAW" ? 1 : 0),
                  losses: acc.losses + (round.outcome === "LOSS" ? 1 : 0),
                  byes: acc.byes + (round.outcome === "BYE" ? 1 : 0),
                }
              : acc,
          {
            totalTpEarned: 0,
            totalOpEarned: 0,
            totalVpEarned: 0,
            closeLosses: 0,
            opEarnedOver5: 0,
            losses: 0,
            wins: 0,
            ties: 0,
            byes: 0,
          },
        );

        return {
          tournamentOtmId: roundResults.tournamentOtmId,
          playerOtmId: player.otmPlayerId,
          opEarned: totalOpEarned,
          vpEarned: totalVpEarned,
          tpEarned: totalTpEarned,
          rank: 0, // Temporary rank
          wins,
          losses,
          ties,
          byes,
          closeLosses,
          fiveOpMatches: opEarnedOver5,
          lists: player.lists,
          faction: player.faction,
        };
      },
    );

    const sortedStats = [...playerTournamentStats].sort((a, b) => {
      // First compare TP
      if (a.tpEarned !== b.tpEarned) {
        return b.tpEarned - a.tpEarned;
      }
      // If TP is equal, compare OP
      if (a.opEarned !== b.opEarned) {
        return b.opEarned - a.opEarned;
      }
      // If OP is equal, compare VP
      return b.vpEarned - a.vpEarned;
    });

    // Assign ranks
    sortedStats.forEach((stats, index) => {
      const playerToUpdate = playerTournamentStats.find(
        (p) => p.playerOtmId === stats.playerOtmId,
      );
      if (playerToUpdate) {
        playerToUpdate.rank = index + 1;
      }
    });

    setPlayerTournamentStats(playerTournamentStats);
  };

  return {
    players,
    tournament,
    rounds,
    rawData,
    roundResults,
    setRawData,
    playerTournamentStats,
  };
}
