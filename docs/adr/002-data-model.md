# ADR 002: Data model

**Status:** Accepted · **Date:** 2026-10-19

## Context

The app stores two kinds of data (PRD §3, §6):

- **Journey content:** about 20 challenges, written by hand and seeded. The user doesn't edit them in v1.
- **User data:** unlock and mastery state for each challenge, attempts with ratings and notes, and the recipe changes made in each attempt.

Two rules shape the model:

1. Challenges unlock in order when the previous one is mastered.
2. Undoing mastery **never re-locks** challenges that are already unlocked (PRD F4).

Rule 2 means "unlocked" can't be worked out from "is the previous challenge mastered?". It has to be stored.

## Decision

Four tables in one SQLite file. Columns are `snake_case`, and queries alias them to `camelCase` fields.

```
challenges          1 ── 1  challenge_progress
  id, slug, position,          challenge_id (PK, FK)
  title, technique, level,     unlocked_at, mastered_at, mastery_note
  description, recipe
      │
      1 ── *  attempts
               id, challenge_id (FK), baked_on, notes,
               rating (1–5, required),
               taste_rating, texture_rating, appearance_rating (1–5, optional),
               created_at
                   │
                   1 ── *  recipe_changes
                            id, attempt_id (FK, cascade delete),
                            description, outcome
```

- **Seed data and user data are kept apart:** `challenges` holds only content, and `challenge_progress` holds the user's state. Seed content can change without affecting progress columns.
- **Order:** `challenges.position` (unique) defines both the display order and the unlock order. `slug` (unique) gives readable URLs.
- **Status is derived, not stored:** `getStatus()` in `src/lib/domain/journey.ts` works it out as `mastered_at` set → *Mastered*, else no `unlocked_at` → *Locked*, else has attempts → *In progress*, else *Not started*. There's no `status` column that could drift out of sync.
- **Timestamps** are ISO-8601 text: `baked_on` is a date, the others are `datetime('now')`.
- **Integrity in the database:** `CHECK` constraints on ratings and levels, foreign keys turned on (`PRAGMA foreign_keys = ON`), and cascade deletes from attempts to their recipe changes.
- **Schema setup:** `schema.ts` runs `CREATE TABLE IF NOT EXISTS` on every connection. The seed runs only when `challenges` is empty and unlocks position 1. There's no migration tool.

**Alternatives considered**

- **A stored `status` column:** simpler queries, but it duplicates facts (attempt count, timestamps) and goes stale.
- **Progress columns on `challenges`:** one less table, but mixes content with user data and makes reseeding risky.
- **Recipe changes as a JSON column on `attempts`:** fewer tables, but harder to query and validate. A child table is just as simple with SQLite.
- **Recipe versioning (storing a full recipe for each attempt):** explicitly out of scope (PRD F3).

## Consequences

- **Positive:** the "never re-lock" rule comes for free, since undoing mastery only clears `mastered_at`.
- **Positive:** the status logic is a pure function that is unit tested separately from SQL.
- **Positive:** the database itself rejects invalid ratings and orphaned rows.
- **Negative:** working out status requires an attempt count for each challenge, done with a subquery. That's fine for about 20 rows.
- **Negative:** with no migrations, changing an existing table means `npm run db:reset` (which loses data) or a hand-written `ALTER TABLE`. That's acceptable before v1 has real data, but it should be revisited once the author is logging real bakes.
- **Negative:** reordering or removing seed challenges after progress exists isn't supported. The seed only runs into an empty table.
