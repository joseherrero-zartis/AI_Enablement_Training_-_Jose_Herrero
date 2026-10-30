// Applied on every connection. Statements are idempotent (IF NOT EXISTS).
// Seeded journey data (challenges) is kept apart from user data (progress, attempts, changes).
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS challenges (
  id          INTEGER PRIMARY KEY,
  slug        TEXT    NOT NULL UNIQUE,
  position    INTEGER NOT NULL UNIQUE,
  title       TEXT    NOT NULL,
  technique   TEXT    NOT NULL,
  level       TEXT    NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'master')),
  description TEXT    NOT NULL,
  recipe      TEXT
);

CREATE TABLE IF NOT EXISTS challenge_progress (
  challenge_id INTEGER PRIMARY KEY REFERENCES challenges(id) ON DELETE CASCADE,
  unlocked_at  TEXT,
  mastered_at  TEXT,
  mastery_note TEXT
);

CREATE TABLE IF NOT EXISTS attempts (
  id                INTEGER PRIMARY KEY,
  challenge_id      INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  baked_on          TEXT    NOT NULL,
  notes             TEXT,
  rating            INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  taste_rating      INTEGER CHECK (taste_rating BETWEEN 1 AND 5),
  texture_rating    INTEGER CHECK (texture_rating BETWEEN 1 AND 5),
  appearance_rating INTEGER CHECK (appearance_rating BETWEEN 1 AND 5),
  created_at        TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS attempts_challenge_idx ON attempts(challenge_id);

CREATE TABLE IF NOT EXISTS recipe_changes (
  id          INTEGER PRIMARY KEY,
  attempt_id  INTEGER NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  description TEXT    NOT NULL,
  outcome     TEXT
);

CREATE INDEX IF NOT EXISTS recipe_changes_attempt_idx ON recipe_changes(attempt_id);
`;
