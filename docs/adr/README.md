# Architecture Decision Records

Significant technical decisions for Baker's Journey. Each ADR has Context, Decision and Consequences sections. To change a decision, add a new ADR that supersedes the old one. Don't rewrite history.

| ADR | Decision | Status |
|---|---|---|
| [001](001-tech-stack.md) | Technology stack: Next.js 16, TypeScript, Tailwind, SQLite (`better-sqlite3`), Vitest | Accepted |
| [002](002-data-model.md) | Data model: four tables, seed content kept apart from user data, status derived | Accepted |
| [003](003-api-structure.md) | API structure: no public API. Server Components read, Server Actions write | Accepted |
| [004](004-authentication.md) | Authentication: none in v1 (single user, local) | Accepted |
| [005](005-error-handling.md) | Error handling: expected errors returned from Server Actions, unexpected errors thrown to `error.tsx` | Accepted |
