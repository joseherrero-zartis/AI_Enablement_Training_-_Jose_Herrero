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

## Conventions

- TypeScript strict mode. Import from `src` with the `@/` alias.
- Tailwind for styling. Support dark mode with `dark:` variants, as the existing pages do.
- Tests sit next to their code as `*.test.ts`. Use an in-memory DB for query tests.
