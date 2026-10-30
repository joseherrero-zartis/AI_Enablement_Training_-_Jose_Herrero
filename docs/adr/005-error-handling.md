# ADR 005: Error handling — return expected errors, throw unexpected ones

**Status:** Accepted · **Date:** 2026-10-29

_Amended 2026-10-30: the action result also carries `values`, so the form can show the submitted fields again after an error._

## Context

All writes go through Server Actions (ADR 003), and each one must validate its input and enforce domain rules on the server. US-02 needs bad input (for example a missing rating or one outside 1–5) to be "rejected with a clear error message, and nothing is saved", and it needs the server to refuse attempts on locked challenges. Other failures, such as a SQLite error or a bug, are rare and the user can't fix them.

In production, Next.js replaces the message of any error thrown from a Server Component or Server Action with a generic one. A thrown validation error would never reach the user, and the form would lose what they typed.

The project has to pick one approach for every action, and keep it simple (it's a training project with five actions and one user).

## Decision

Errors are split into **expected** and **unexpected**, and each kind is handled in one place.

- **Expected errors** (invalid input, rule violations such as a locked challenge, a challenge that doesn't exist) are **returned** from the Server Action as `{ error?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> }`, never thrown. `values` echoes the submitted fields so the form can show them again, because React resets forms after an action. The form is a small `"use client"` component that reads the result with `useActionState` and shows the messages. Nothing is written when validation fails.
- **Validation** uses hand-written pure functions in `src/lib/domain/` (for example `validateAttempt()`) that return field errors, with unit tests. No validation library.
- **Every action follows the same order:** parse `FormData` → validate → check domain rules against the DB → write (in one transaction if it touches more than one row) → `refresh()`/`revalidatePath()` or redirect.
- **Missing resources** in pages call `notFound()`.
- **Unexpected errors** (SQLite failures, bugs, broken invariants) are left to throw and reach `app/error.tsx`. No defensive `try/catch`. Code that catches an error to log it must rethrow it.
- `redirect()` and `notFound()` work by throwing, so they are never wrapped in `try/catch`.

**Alternatives considered**

- **Throw everything and show it in error boundaries:** the least code, but production hides the messages, the form loses its state, and every validation failure looks like a crash. It doesn't meet US-02.
- **`Result<T, E>` everywhere** (hand-rolled or `neverthrow`): errors are visible in the types, but it's verbose, and `better-sqlite3`, `redirect()` and `notFound()` throw anyway, so the code would mix both styles.
- **Typed domain exceptions mapped at the action boundary** (`ValidationError`, `ChallengeLockedError` caught in one `try/catch` per action): it works, but adds a class hierarchy, and a catch that forgets to rethrow unknown errors swallows `redirect()`, `notFound()` and real bugs.
- **An action wrapper library** (for example `next-safe-action`): consistent at scale, but a new dependency and abstraction for five actions.
- **Zod for validation:** declarative schemas and field errors for free, but a new dependency for rules that fit in a few lines (integer 1–5, required rating, valid date).

## Consequences

- **Positive:** follows how Next.js is designed to work. Users see clear messages next to the fields, and the form keeps what they typed.
- **Positive:** validation rules are pure functions in `lib/domain` with unit tests, and every action reads the same way.
- **Positive:** there are no new dependencies or error class hierarchies.
- **Negative:** each form that submits to an action needs a small client component for `useActionState`.
- **Negative:** action results aren't enforced by the type system the way a `Result` type would be. Reviewers have to check that actions return expected errors instead of throwing them.
- **Negative:** hand-written validators need care to stay consistent. If validation grows a lot, revisit Zod in a new ADR.
