export interface Tournament {
  id: string;
  otmId: string;
  tournamentDate: Date;
  name: string;
  code: string;
  game: string;
  tier: number;
  its: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TournamentPlayer {
  playerId: string;
  tournamentId: string;
}

export interface TournamentRound {
  id: string;
  tournamentId: string;
  mission: string;
  roundNumber: number;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TournamentRoundResult {
  id: string;
  roundId: string;
  playerId: string;
  opponentId: string | null | undefined;
  opEarned: number;
  vpEarned: number;
  tpEarned: number;
  closeLoss: boolean;
  opEarnedOver5: boolean;
  outcome: string;
  createdAt: Date;
  updatedAt: Date;
}
