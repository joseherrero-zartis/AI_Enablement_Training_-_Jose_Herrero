# Baker's Journey

A personal web app to track your progress as a baker, from first loaf to master. Work through an ordered journey of baking challenges, log each attempt with notes, ratings and recipe changes, and mark techniques as mastered to unlock the next one.

See the [PRD](docs/PRD.md) for scope and decisions.

**Stack:** Next.js 16 (App Router, TypeScript) · Tailwind CSS 4 · SQLite (`better-sqlite3`) · Vitest

## Prerequisites

- **Node.js 24** (the version is pinned in `.nvmrc`)

With [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm install   # reads .nvmrc
nvm use
```

## Setup

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

On first run the app creates a SQLite database at `data/bakers-journey.db`, adds the 20 seed challenges and unlocks the first one. You don't need a separate migration or seed step.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm test` | Run unit tests once (`npm run test:watch` for watch mode) |
| `npm run typecheck` | Generate Next route types and type-check |
| `npm run lint` | Run ESLint |
| `npm run db:reset` | Delete the local database. It's recreated and reseeded on next start. **This erases all your attempts.** |

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_PATH` | `data/bakers-journey.db` | Location of the SQLite file |

## Project structure

```
docs/PRD.md                    Product requirements
src/
  app/
    page.tsx                   Dashboard: progress overview (F5)
    journey/page.tsx           Ordered challenge list (F1)
    challenges/[slug]/page.tsx Challenge detail: recipe, attempts, mastery (F2–F4)
  components/                  Shared UI components
  lib/
    types.ts                   Domain types
    domain/journey.ts          Pure journey rules: status, unlocking, progress
    db/
      schema.ts                SQLite schema
      seed-data.ts             The journey's challenges, in order
      client.ts                Connection, schema setup and seeding
      queries.ts               Read queries
```

## Status

The project is scaffolded. The pages display the journey, challenge details and progress straight from SQLite. Logging attempts, recording recipe changes and marking challenges as mastered are the next features to build. Base recipes in `src/lib/db/seed-data.ts` are still to be written.
