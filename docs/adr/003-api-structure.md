# ADR 003: API structure — no public API; Server Components and Server Actions

**Status:** Accepted · **Date:** 2026-10-19

## Context

The PRD asks for "a thin server layer (API routes or server actions) to read and write SQLite" (PRD §6). The only client is the app's own web UI. There are no mobile apps, third-party integrations or other consumers (PRD §4). The stack is Next.js 16 App Router (ADR 001), which supports reading data on the server in components and handling form submissions with Server Actions.

## Decision

The app has **no REST or GraphQL API**.

- **Reads:** pages are Server Components that call query functions in `src/lib/db/queries.ts` directly, via `getDb()`. Each one does `await connection()` inside a `<Suspense>` boundary so data is read at request time.
- **Writes:** Server Actions (`"use server"`), one per user action: log attempt (with recipe changes), edit attempt, delete attempt, mark mastered, undo mastery. Each action:
  1. validates its input on the server (ratings 1–5, required fields, challenge exists and is unlocked),
  2. runs in a single SQLite transaction when it touches more than one row,
  3. refreshes the affected pages with `refresh()` or `revalidatePath()`.
- **Layering:** `app/` (routes and actions) → `lib/db/` (SQL) → `lib/domain/` (pure rules, no I/O). Business rules such as the unlock target or status live in `lib/domain` so they can be unit tested without Next or a database.
- **Route Handlers** (`app/api/**`) are added only if a real non-UI consumer appears, such as a data export.

**Alternatives considered**

- **REST Route Handlers plus client-side fetching:** an explicit contract and easy to call from tools like curl, but it duplicates types and validation, and adds loading and error state on the client. It's useful only with more than one consumer.
- **tRPC or GraphQL:** powerful, but far beyond what one UI and five actions need.

## Consequences

- **Positive:** less code. Data access is type-checked end to end with no serialization layer to maintain.
- **Positive:** forms work with progressive enhancement (`<form action={serverAction}>`) and need little client-side JavaScript.
- **Positive:** this fits the PRD's "thin server layer" constraint.
- **Negative:** there's no API to call from scripts or other apps. A data export or backup would need a Route Handler later.
- **Negative:** Server Actions are reachable through POST requests, so every rule (for example, "can't log attempts on a locked challenge") must be checked inside the action, not just hidden in the UI.
- **Negative:** this ties data access to Next.js conventions. Moving to another framework would mean rewriting the route and action layer, though `lib/db` and `lib/domain` would carry over.
