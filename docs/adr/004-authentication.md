# ADR 004: Authentication — none in v1

**Status:** Accepted · **Date:** 2026-10-19

## Context

Baker's Journey v1 is a personal, single-user app that runs locally (PRD §2, §6). Multiple users, sign-up, login, sharing and social features are explicitly out of scope (PRD §4). Deployment is optional (PRD §5). The data (baking notes and ratings) isn't sensitive.

## Decision

**v1 has no authentication or authorization.**

- There are no user accounts, sessions or `users` table. Every row belongs to the single local user.
- The app is meant to run on `localhost`. The README and `CLAUDE.md` describe it as a local app.
- Server Actions still validate their input and enforce domain rules (ADR 003). That protects data integrity, not identity.

**If the app is ever deployed publicly**, it must first sit behind access control. The simplest options:

1. Put it behind platform or proxy protection (for example, HTTP basic auth at a reverse proxy or the hosting platform's password protection), with no code changes.
2. If that isn't enough, add a single shared password checked by Next.js middleware (`proxy.ts`) and stored in an environment variable.

Real multi-user support (an auth library, a `users` table, a `user_id` on every user-data table) is a separate product decision and needs a new ADR.

**Alternatives considered**

- **An auth library (Auth.js, Clerk, etc.) from the start:** adds providers, sessions, callbacks and secrets for one user on localhost. That's against the PRD scope and its "avoid over-engineering" constraint.
- **A single password from the start:** cheap, but adds friction to the "log an attempt in under 2 minutes" goal (PRD §5) for no benefit on localhost.

## Consequences

- **Positive:** no login step, no secrets to manage, and nothing to build or test for auth. All the effort goes into the core features.
- **Positive:** a simpler data model (ADR 002), with no ownership columns or row-level checks.
- **Negative:** anyone who can reach the server can read and change all data. That's safe only on localhost or a trusted network.
- **Negative:** adding multi-user support later is a significant change: a schema migration that adds `user_id` to `challenge_progress` and `attempts`, a query on every page and action, and per-user seeding of progress.
