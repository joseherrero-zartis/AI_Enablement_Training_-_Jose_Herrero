@AGENTS.md

# Baker's Journey

Single-user web app for tracking a home baker's progress through an ordered journey of baking challenges. The source of truth for scope is `docs/PRD.md`. Check it before adding features, and respect its **Out of scope** list (no auth or multiple users, no photos, no AI features, no gamification). This is a training project, so keep solutions simple.

## Commands

- `npm run dev`: dev server on :3000
- `npm test`: Vitest unit tests (`src/**/*.test.ts`)
- `npm run typecheck`: runs `next typegen` then `tsc` (`PageProps`/`LayoutProps` are generated globals)
- `npm run lint`: ESLint
- `npm run db:reset`: deletes `data/` (the DB is recreated and reseeded on next start)

Run `npm test`, `npm run typecheck` and `npm run lint` before you call a change done.

Node 24 via nvm (`.nvmrc`). In non-interactive shells, load nvm first: `export NVM_DIR="$HOME/.nvm"; . /opt/homebrew/opt/nvm/nvm.sh`.

## Architecture

- **Next.js 16 App Router** with `cacheComponents` and `partialPrefetching` enabled (see `next.config.ts`). Pages are Server Components that read SQLite directly. There's no API layer.
- **Reading data:** `better-sqlite3` is synchronous, so Next treats queries as predictable and would freeze them into the build-time prerender. Any component that reads the DB must `await connection()` (from `next/server`) before querying, and must sit inside a `<Suspense>` boundary. Follow the existing pages. Await `params` inside the boundary too (see `challenges/[slug]/page.tsx`).
- **Writing data:** use Server Actions (`"use server"`). The data is uncached, so after a mutation, refresh the UI with `refresh()` or `revalidatePath()` from `next/cache`, or redirect. Don't add `"use cache"` to user data.
- **Layers:**
  - `src/lib/domain/`: pure business rules with no DB or Next imports. Put logic here and unit test it.
  - `src/lib/db/`: `client.ts` (connection singleton via `getDb()`, plus `openDatabase(":memory:")` for tests), `schema.ts`, `seed-data.ts`, `queries.ts`. SQL uses `snake_case` columns aliased to `camelCase` fields.
  - `src/app/`: routes. `src/components/`: shared UI.
- **Schema changes:** there are no migrations. `schema.ts` uses `CREATE TABLE IF NOT EXISTS`, so after changing an existing table, run `npm run db:reset` locally (or add an `ALTER TABLE` step if real data must be kept).

## Domain rules

- Challenges are seed data, ordered by `position`. The seed runs only when the `challenges` table is empty.
- Status is derived, not stored: `mastered` (has `mastered_at`) → `locked` (no `unlocked_at`) → `in_progress` (has attempts) → `not_started`. See `getStatus()`.
- Only challenge #1 is unlocked at the start. Marking a challenge as mastered sets `unlocked_at` on the next challenge (`getChallengeToUnlock()`). Do it in one transaction.
- Undoing mastery clears `mastered_at` but **never re-locks** later challenges.
- Locked challenges are listed but can't be opened to log attempts. Enforce this on the server, not just in the UI.
- The mastery hint (3 attempts rated 4+) is a suggestion only and never blocks the user.
- Ratings are integers from 1 to 5. Only the overall `rating` is required.

## Error handling

Expected errors are returned as values. Unexpected errors are thrown.

- **Expected errors** (invalid input, rule violations such as logging an attempt on a locked challenge, a challenge that doesn't exist) are **returned** from the Server Action as `{ error?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> }`, never thrown. Next hides thrown error messages in production, so a thrown validation error would never reach the user. The form is a small `"use client"` component that reads the result with `useActionState` and shows the messages next to the fields. `values` echoes the submitted fields so the form can show them again, because React resets forms after an action. Nothing is written when validation fails.
- **Validation** uses hand-written pure functions in `src/lib/domain/` (for example `validateAttempt()`) that return field errors, with unit tests. Don't add a validation library. Each action follows the same order: parse `FormData` → validate → check domain rules against the DB → write (in one transaction if it touches more than one row) → refresh or redirect.
- **Missing resources** in pages: call `notFound()`.
- **Unexpected errors** (SQLite failures, bugs, broken invariants): let them throw to `app/error.tsx`. Don't add defensive `try/catch`. If you catch an error to log it with `logger.error`, rethrow it.
- **Never wrap `redirect()` or `notFound()` in `try/catch`.** They work by throwing.

## Conventions

- TypeScript strict mode. Import from `src` with the `@/` alias.
- Tailwind for styling. Support dark mode with `dark:` variants, as the existing pages do.
- Tests sit next to their code as `*.test.ts`. Use an in-memory DB for query tests.

## Git workflow

`main` only changes through pull requests. Never commit or push to `main` directly.

- **One branch per feature,** created from an up-to-date `main` before the first change. Name it after the story or the change, for example `feature/US-02-log-attempt` or `fix/journey-order`.
- **Commit and push to the feature branch,** never to `main`. If you find yourself on `main` with changes, create the branch first and commit there.
- **Merge into `main` with a pull request.** Use the `pr-description` skill for the description. Don't merge it yourself unless the developer asks.
- **Don't force-push to or delete `main`,** and don't rewrite its history.

## Gherkin scenarios (`docs/tests/`)

Gherkin `.feature` files describe how each user story should behave. They live in `docs/tests/`, next to the stories in `docs/stories/`. See `docs/tests/README.md` for the full conventions.

- **One file per story, with the same name:** `docs/stories/US-02-log-attempt.md` → `docs/tests/US-02-log-attempt.feature`. If the file already exists, update it instead of creating a new one.
- **Cover every acceptance criterion** with at least one scenario, and tag each scenario with the story and criterion, for example `@US-02 @AC-3`.
- **Write from the baker's point of view,** in plain language, with no code, SQL or component names.
- **They're specifications, not automated tests.** There's no Cucumber runner, so `npm test` doesn't run them. Don't add a runner unless asked.

## Training diary (`REFLECTION.md`)

`REFLECTION.md` is the developer's personal diary of this training: what they did, learnt and felt each day. It isn't project documentation.

- **Only add, never rewrite.** When asked to update it, add the new reflection at the end, under the current day's heading (or a new `## Day N` heading). Leave every earlier entry exactly as it is.
- **Change a past entry only when asked to,** and only the entry the developer names.
- **Old entries aren't "out of date".** A line like "the logger isn't committed yet" was true when it was written. Don't fix it, and don't suggest fixing it in replies or in `HANDOFF.md`.
- **Write in the developer's voice:** first person ("I"), plain language, the same style as the existing entries.
