// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration
import { sql, relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  timestamp,
  varchar,
  uuid,
  text,
  boolean,
  primaryKey,
  smallint,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `itd_${name}`);

export const posts = createTable(
  "post",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  }),
);

export const players = createTable("players", {
  id: uuid("id").primaryKey().defaultRandom(),
  otmId: text("otm_id").unique().notNull(),
  pin: text("pin").notNull(),
  nick: text("nick").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Tournament table
export const tournaments = createTable("tournaments", {
  id: uuid("id").primaryKey().defaultRandom(),
  otmId: text("otm_id").unique().notNull(),
  tournamentDate: timestamp("tournament_date").notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  game: text("game").notNull(),
  tier: integer("tier").notNull(),
  its: text("its").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Tournament Players (Junction Table)
export const tournamentPlayers = createTable(
  "tournament_players",
  {
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.playerId, table.tournamentId] }),
  }),
);

// Player Stats table
export const playerStats = createTable(
  "player_stats",
  {
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id),
    year: smallint("year").notNull(),
    totalVp: integer("total_vp").notNull(),
    totalOp: integer("total_op").notNull(),
    totalTp: integer("total_tp").notNull(),
    totalWins: integer("total_wins").notNull(),
    totalLosses: integer("total_losses").notNull(),
    totalTies: integer("total_ties").notNull(),
    totalByes: integer("total_byes").notNull(),
    totalCloseLosses: integer("total_close_losses").notNull(),
    totalFiveOpMatches: integer("total_five_op_matches").notNull(),
    totalTournaments: integer("total_tournaments").notNull(),
    totalFactions: text("total_factions").array(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.playerId, table.year] }),
  }),
);

// Tournament Rounds table
export const tournamentRounds = createTable("tournament_rounds", {
  id: uuid("id").primaryKey().defaultRandom(),
  tournamentId: uuid("tournament_id")
    .notNull()
    .references(() => tournaments.id),
  mission: text("mission").notNull(),
  roundNumber: integer("round_number").notNull(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Player Tournament Stats table
export const playerTournamentStats = createTable("player_tournament_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id),
  tournamentId: uuid("tournament_id")
    .notNull()
    .references(() => tournaments.id),
  opEarned: integer("op_total").notNull(),
  vpEarned: integer("vp_earned").notNull(),
  tpEarned: integer("tp_earned").notNull(),
  tournamentRank: integer("tournament_rank").notNull(),
  wins: integer("wins").notNull(),
  losses: integer("losses").notNull(),
  ties: integer("ties").notNull(),
  byes: integer("byes").notNull(),
  closeLosses: integer("close_losses").notNull(),
  faction: text("faction").notNull(),
  fiveOpMatches: integer("five_op_matches").notNull(),
  lists: text("lists").array(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Round Results table
export const roundResults = createTable("round_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  roundId: uuid("round_id")
    .notNull()
    .references(() => tournamentRounds.id),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id),
  opponentId: uuid("opponent_id").references(() => players.id),
  opEarned: integer("op_earned").notNull(),
  vpEarned: integer("vp_earned").notNull(),
  tpEarned: integer("tp_earned").notNull(),
  closeLoss: boolean("close_lose").notNull(),
  opEarnedOver5: boolean("op_earned_over_5").notNull(),
  outcome: text("outcome").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Relationship definitions
export const playersRelations = relations(players, ({ many }) => ({
  stats: many(playerStats),
  tournamentStats: many(playerTournamentStats),
  roundResultsAsOpponent: many(roundResults, { relationName: "opponent" }),
  roundResultsAsPlayer: many(roundResults, { relationName: "player" }),
  playerTournaments: many(tournamentPlayers),
}));

export const tournamentsRelations = relations(tournaments, ({ many }) => ({
  playerStats: many(playerTournamentStats),
  playerTournaments: many(tournamentPlayers),
  rounds: many(tournamentRounds),
}));

export const tournamentPlayersRelations = relations(
  tournamentPlayers,
  ({ one }) => ({
    player: one(players, {
      fields: [tournamentPlayers.playerId],
      references: [players.id],
    }),
    tournament: one(tournaments, {
      fields: [tournamentPlayers.tournamentId],
      references: [tournaments.id],
    }),
  }),
);

export const roundResultsRelations = relations(roundResults, ({ one }) => ({
  opponent: one(players, {
    fields: [roundResults.opponentId],
    references: [players.id],
    relationName: "opponent",
  }),
  player: one(players, {
    fields: [roundResults.playerId],
    references: [players.id],
    relationName: "player",
  }),
  round: one(tournamentRounds, {
    fields: [roundResults.roundId],
    references: [tournamentRounds.id],
  }),
}));
