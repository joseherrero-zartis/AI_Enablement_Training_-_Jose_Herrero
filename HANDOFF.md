# Handoff: error handling, logger, reviews and workflow

## State

- All work is on `certification-delivery`, committed and pushed. Latest commit: `3cceff6`.
- **PR #1** (`certification-delivery` → `main`) is open with an up-to-date description: https://github.com/joseherrero-zartis/AI_Enablement_Training_-_Jose_Herrero/pull/1
- `npm test` (23 tests in 3 files), `npm run typecheck` and `npm run lint` all pass.

## Done

- **Error handling:** recorded in `docs/adr/005-error-handling.md` and `CLAUDE.md`. Expected errors are returned from Server Actions; unexpected errors (SQLite failures, bugs) throw to an error boundary.
  - `src/app/error.tsx` catches route render errors. It logs the error and its digest with `logger.error`, shows the digest as a reference, and **Try again** calls `router.refresh()` then `reset()` so Server Components re-run their queries.
  - `src/app/global-error.tsx` catches root layout errors. It renders its own `<html>` and `<body>`, imports `globals.css`, and **Try again** does a full page reload.
- **Logger:** `src/lib/logger.ts` (first written in `src/utils/`, moved after code review) has `debug`, `info`, `warn` and `error` methods. Each message is prefixed with a timestamp and level, e.g. `[2026-10-29T10:56:59.123Z] [INFO] message`. `debug()` only logs on the server when `LOG_DEBUG=1`.
- **Gherkin specs:** `docs/tests/` holds one `.feature` file per user story (conventions in `docs/tests/README.md` and `CLAUDE.md`). Written so far: US-01 (8 scenarios) and US-08 (9 scenarios). They're specifications only; there's no Cucumber runner.
- **Claude Code setup:** skills `pr-description` and `gherkin-generator` in `.claude/skills/`, agents `code-reviewer` and `qa-reviewer` in `.claude/agents/`.
- **Reviews:**
  - `code-reviewer` reviewed the logger and the error pages; all 4 findings applied.
  - `qa-reviewer` reviewed the tests and specs (verdict: APPROVE); all 7 findings applied. `summarizeProgress()` now returns `percent` and `complete`, and the dashboard (`src/app/page.tsx`) uses them.
- **`CLAUDE.md` rules added:** git workflow (a branch per feature, `main` only changes through pull requests), Gherkin conventions, and `REFLECTION.md` is an append-only diary.

## Decisions

- **Logger**
  - **Timestamp:** UTC in ISO 8601 format, from `new Date().toISOString()`.
  - **Console methods:** each level calls the console method of the same name, so browser and terminal tools can filter by level.
  - **Extra arguments** are passed to the console unchanged, so objects and errors keep their normal formatting.
  - **`LOG_DEBUG`, not `DEBUG`:** other libraries read `DEBUG` (e.g. `DEBUG=*` for the `debug` package). Only the exact value `1` enables it. Next only exposes `NEXT_PUBLIC_*` variables to the browser, so `debug()` is server-only.
  - **Where it's safe to call:** Server Actions, client effects, or Server Components after `await connection()`. The timestamp reads the current time, which `cacheComponents` forbids during a prerender.
  - **Kept out on purpose:** level filtering, file or remote output, and JSON output, because `CLAUDE.md` asks for simple solutions.
  - **Two tests only** (`src/lib/logger.test.ts`): the prefix format, and that `debug()` stays silent unless `LOG_DEBUG=1`.
- **Error pages**
  - **Props:** both use the long-standing `{ error, reset }` props. A local hook blocks reading `node_modules/next/dist/docs/`, so the Next 16.4 docs weren't checked. Typecheck accepts these props.
  - **No error message shown:** Next hides thrown error messages in production, so the pages show a generic message plus `error.digest`, and log the digest so the console matches the page and the server logs.
  - **`global-error.tsx` skips the Geist fonts and the nav,** because they belong to the root layout that failed.
- **Gherkin:** scenarios only cover behaviour in the story or the PRD, so the "not found" scenario was dropped from US-01 (the query test for an unknown slug still covers it).
- **`main` isn't protected on GitHub.** The repo is private on the free plan, which doesn't allow branch protection, and the developer chose to rely on the `CLAUDE.md` rule only. GitHub's default branch is still `certification-delivery`, by choice.

## Next

1. **Check in the browser:** the dashboard after the `summarizeProgress()` change, and both error pages against a real thrown error (a temporary `throw` in a page, and in `layout.tsx` for `global-error.tsx`).
2. **Review and merge PR #1.** Tick "Tests generated and human-verified" and "Manual review completed" in its description once done. Don't merge it on the developer's behalf.
3. **Start US-02 (log an attempt) on a new branch** from an up-to-date `main`, e.g. `feature/US-02-log-attempt`, following the Server Action pattern in `CLAUDE.md`. Write its `.feature` file with `gherkin-generator`.
4. **Write the US-04 `.feature` file.** US-04 is partly built: optional ratings aren't shown on the challenge page yet.
5. **Check the Next 16.4 docs for `error.js`** when they can be read, in case a built-in retry prop should replace the `router.refresh()` + `reset()` logic.
6. **Explore hooks** to run the skills or agents automatically (for example, `code-reviewer` before a PR). This is the developer's idea, not decided yet.
7. **Session note:** agents added during a session can't be launched by name until a new session starts. In this session `qa-reviewer` ran through a general agent that followed its file.
