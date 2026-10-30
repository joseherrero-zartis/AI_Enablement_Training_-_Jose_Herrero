import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { SCHEMA } from "@/lib/db/schema";
import { SEED_CHALLENGES } from "@/lib/db/seed-data";

export type Db = Database.Database;

export const DEFAULT_DB_PATH = path.join(process.cwd(), "data", "bakers-journey.db");

/**
 * Opens a database, applies the schema and seeds the journey if it is empty.
 * Pass ":memory:" in tests.
 */
export function openDatabase(file: string): Db {
  if (file !== ":memory:") fs.mkdirSync(path.dirname(file), { recursive: true });

  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  seedJourney(db);
  return db;
}

/** Inserts the seed challenges and unlocks the first one. Does nothing if challenges exist. */
export function seedJourney(db: Db): void {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM challenges").get() as {
    count: number;
  };
  if (count > 0) return;

  const insertChallenge = db.prepare(`
    INSERT INTO challenges (slug, position, title, technique, level, description, recipe)
    VALUES (@slug, @position, @title, @technique, @level, @description, @recipe)
  `);
  const insertProgress = db.prepare(`
    INSERT INTO challenge_progress (challenge_id, unlocked_at)
    VALUES (?, CASE WHEN ? = 1 THEN datetime('now') END)
  `);

  db.transaction(() => {
    SEED_CHALLENGES.forEach((challenge, index) => {
      const position = index + 1;
      const { lastInsertRowid } = insertChallenge.run({ ...challenge, position });
      insertProgress.run(lastInsertRowid, position);
    });
  })();
}

// Reuse one connection across hot reloads in development.
const globalForDb = globalThis as unknown as { bakersJourneyDb?: Db };

export function getDb(): Db {
  globalForDb.bakersJourneyDb ??= openDatabase(process.env.DATABASE_PATH ?? DEFAULT_DB_PATH);
  return globalForDb.bakersJourneyDb;
}
