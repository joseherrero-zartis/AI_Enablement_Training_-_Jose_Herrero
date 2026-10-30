# ADR 001: Technology stack

**Status:** Accepted · **Date:** 2026-10-19

## Context

Baker's Journey is a single-user, local-first web app built by one part-time developer in 2–4 weeks as a training project (PRD §6). It needs a responsive web UI, persistent storage for seeded challenges and user data, and automated tests for its core rules (PRD §5). The PRD already decides SQLite for storage and asks for a thin server layer, with no microservices or cloud infrastructure.

What matters most: setup in one command, few moving parts, mainstream tools that are worth learning, and type safety from the database to the UI.

## Decision

| Concern | Choice |
|---|---|
| Runtime | Node.js 24 LTS, pinned in `.nvmrc` and managed with nvm |
| Framework | Next.js 16 (App Router) with React 19 and TypeScript in strict mode |
| Rendering | Server Components, with Next's new caching (`cacheComponents`) and Partial Prefetching enabled, as `create-next-app` sets up by default |
| Styling | Tailwind CSS 4 |
| Database | SQLite through `better-sqlite3`, using hand-written SQL |
| Testing | Vitest for unit and query tests, using an in-memory SQLite database |
| Quality | ESLint (`eslint-config-next`) and `tsc` through `npm run typecheck` |

**Alternatives considered**

- **React + Vite with a separate Express API:** two apps, two dev servers and a hand-written API contract. Too much for a single-user app.
- **An ORM (Prisma, Drizzle):** adds a migration tool, code generation and its own concepts. The schema is four tables, and plain SQL is more instructive.
- **`node:sqlite` (built into Node):** no dependency, but less mature and less documented than `better-sqlite3`. Worth reconsidering once it's fully stable.

## Consequences

- **Positive:** a single app and process. `npm install && npm run dev` is the whole setup. Server Components read the database directly, so no API layer is needed (see ADR 003). TypeScript covers the whole codebase.
- **Positive:** `better-sqlite3` is synchronous and fast, and an in-memory database keeps tests quick and isolated.
- **Negative:** Next.js 16's new caching means synchronous database reads would be frozen at build time. Every component that reads data must `await connection()` inside a `<Suspense>` boundary. This is documented in `CLAUDE.md`, and it's easy to forget.
- **Negative:** `better-sqlite3` is a native module, which ties the app to a Node server. Serverless hosts with read-only or temporary file systems won't work, which is acceptable because deployment is optional (PRD §5).
- **Negative:** Next.js 16 is newer than much of the available documentation and AI training data, so the Next docs bundled in the project (`AGENTS.md`) are the reference.
- **Negative:** without an ORM, mapping SQL rows to TypeScript types is done by hand in `queries.ts`. Mismatches are only caught by tests.
