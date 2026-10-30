// Read queries, plus the mutations added with their features (log attempt with its recipe changes so far; mark mastered comes later).
import type { Db } from "@/lib/db/client";
import type { AttemptInput } from "@/lib/domain/attempts";
import type { RecipeChangeInput } from "@/lib/domain/recipe-changes";
import { getStatus } from "@/lib/domain/journey";
import type { Attempt, Challenge, ChallengeProgress, JourneyItem, RecipeChange } from "@/lib/types";

type ChallengeRow = Challenge & {
  unlockedAt: string | null;
  masteredAt: string | null;
  masteryNote: string | null;
  attemptCount: number;
};

const CHALLENGE_WITH_PROGRESS = `
  SELECT c.id, c.slug, c.position, c.title, c.technique, c.level, c.description, c.recipe,
         p.unlocked_at  AS unlockedAt,
         p.mastered_at  AS masteredAt,
         p.mastery_note AS masteryNote,
         (SELECT COUNT(*) FROM attempts a WHERE a.challenge_id = c.id) AS attemptCount
  FROM challenges c
  LEFT JOIN challenge_progress p ON p.challenge_id = c.id
`;

function splitRow(row: ChallengeRow): { challenge: Challenge; progress: ChallengeProgress } {
  const { unlockedAt, masteredAt, masteryNote, attemptCount, ...challenge } = row;
  return {
    challenge,
    progress: { challengeId: challenge.id, unlockedAt, masteredAt, masteryNote, attemptCount },
  };
}

export function listJourney(db: Db): JourneyItem[] {
  const rows = db.prepare(`${CHALLENGE_WITH_PROGRESS} ORDER BY c.position`).all() as ChallengeRow[];
  return rows.map((row) => {
    const { challenge, progress } = splitRow(row);
    return { challenge, status: getStatus(progress) };
  });
}

export function getChallengeById(db: Db, id: number): JourneyItem | null {
  const row = db.prepare(`${CHALLENGE_WITH_PROGRESS} WHERE c.id = ?`).get(id) as
    | ChallengeRow
    | undefined;
  if (!row) return null;

  const { challenge, progress } = splitRow(row);
  return { challenge, status: getStatus(progress) };
}

export interface ChallengeDetail extends JourneyItem {
  progress: ChallengeProgress;
  /** Newest first (PRD F2). */
  attempts: Attempt[];
}

export function getChallengeBySlug(db: Db, slug: string): ChallengeDetail | null {
  const row = db.prepare(`${CHALLENGE_WITH_PROGRESS} WHERE c.slug = ?`).get(slug) as
    | ChallengeRow
    | undefined;
  if (!row) return null;

  const { challenge, progress } = splitRow(row);
  return {
    challenge,
    progress,
    status: getStatus(progress),
    attempts: listAttempts(db, challenge.id),
  };
}

/**
 * Inserts one attempt with its recipe changes and returns the attempt id. All rows are saved in one
 * transaction, so if any insert fails nothing is saved. Callers validate the input and the challenge's status first.
 */
export function insertAttempt(
  db: Db,
  challengeId: number,
  input: AttemptInput,
  changes: RecipeChangeInput[] = [],
): number {
  return db.transaction(() => {
    const result = db
      .prepare(
        `INSERT INTO attempts (challenge_id, baked_on, notes, rating, taste_rating, texture_rating, appearance_rating)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        challengeId,
        input.bakedOn,
        input.notes,
        input.rating,
        input.tasteRating,
        input.textureRating,
        input.appearanceRating,
      );
    const attemptId = Number(result.lastInsertRowid);

    const insertChange = db.prepare(
      "INSERT INTO recipe_changes (attempt_id, description, outcome) VALUES (?, ?, ?)",
    );
    for (const change of changes) insertChange.run(attemptId, change.description, change.outcome);
    return attemptId;
  })();
}

function listAttempts(db: Db, challengeId: number): Attempt[] {
  const attempts = db
    .prepare(
      `SELECT id, challenge_id AS challengeId, baked_on AS bakedOn, notes, rating,
              taste_rating AS tasteRating, texture_rating AS textureRating,
              appearance_rating AS appearanceRating, created_at AS createdAt
       FROM attempts
       WHERE challenge_id = ?
       ORDER BY baked_on DESC, id DESC`,
    )
    .all(challengeId) as Omit<Attempt, "changes">[];

  const changes = db
    .prepare(
      `SELECT rc.id, rc.attempt_id AS attemptId, rc.description, rc.outcome
       FROM recipe_changes rc
       JOIN attempts a ON a.id = rc.attempt_id
       WHERE a.challenge_id = ?
       ORDER BY rc.id`,
    )
    .all(challengeId) as RecipeChange[];

  return attempts.map((attempt) => ({
    ...attempt,
    changes: changes.filter((change) => change.attemptId === attempt.id),
  }));
}
