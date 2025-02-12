import type { FactionCode } from "~/types/meta";

export interface Player {
  id: string;
  otmId: string;
  pin: string;
  nick: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerTournamentData {
  id: string;
  nickname: string;
  lists: string[];
  faction: FactionCode;
  matchResults: string[];
  matchResultsDetail: MatchResultsDetails[];
  pin: string;
  points: {
    tournament: number[];
    objective: number[];
    victory: number[];
    reachedFivePoints: boolean[];
    closeLoss: boolean[];
  };
  totals: {
    tournament: number;
    objective: number;
    victory: number;
  };
}

export interface MatchResultsDetails {
  opponentInfo: {
    nickname: string;
    faction: FactionCode;
    pin: string;
  };
  opponentPoints: {
    tournament: number;
    objective: number;
    victory: number;
  };
}
