# Handoff: logger utility and error boundaries

## Done

- Added `src/utils/logger.ts`, which exports a `logger` object with `info`, `warn` and `error` methods.
- Added a `debug` method that calls `console.debug`, but only when the `DEBUG` environment variable is set to a non-empty value. It reads `DEBUG` on each call.
- Each message is prefixed with a timestamp and level, e.g. `[2026-10-29T10:56:59.123Z] [INFO] message`.
- Recorded the error handling convention in `docs/adr/005-error-handling.md` and `CLAUDE.md`: expected errors are returned from Server Actions, unexpected errors (SQLite failures, bugs) throw to an error boundary.
- Added `src/app/error.tsx`, the error boundary for route render errors. It logs the error with `logger.error`, shows the error digest as a reference, and its **Try again** button calls `router.refresh()` then `reset()` so Server Components re-run their queries.
- Added `src/app/global-error.tsx` for errors in the root layout itself. It renders its own `<html>` and `<body>`, imports `globals.css`, and **Try again** does a full page reload.
- `npm run typecheck`, `npm run lint` and `npm test` all pass.
- Everything is committed and pushed on `certification-delivery` (`d1d8544`, `041fcb9`, `53cccdf`).

## Decisions

- **Timestamp:** UTC in ISO 8601 format, from `new Date().toISOString()`.
- **Console methods:** each level calls the console method of the same name (`console.info`, `console.warn`, `console.error`), so browser and terminal tools can filter by level.
- **Extra arguments:** each method takes optional values after the message and passes them to the console unchanged, so objects and errors keep their normal formatting.
- **Kept out on purpose:** level filtering, file or remote output, and JSON output. The request didn't ask for them, and `CLAUDE.md` asks for simple solutions.
- **No logger tests:** `CLAUDE.md` only requires unit tests for `src/lib/domain/`, and the logger is a thin wrapper around `console`.
- **No ESLint change:** the ESLint config has no `no-console` rule, so lint passes without one.
- **Error boundary props:** both boundaries use the long-standing `{ error, reset }` props. A local hook blocks reading `node_modules/next/dist/docs/`, so the Next 16.4 docs weren't checked. Typecheck accepts these props.
- **No error message shown:** Next hides thrown error messages in production, so the boundaries show a generic message plus `error.digest` to match against server logs.
- **`global-error.tsx` skips the Geist fonts and the nav,** because they belong to the root layout that failed.

## Next

1. **Decide where the logger lives.** It's in `src/utils/`, but `CLAUDE.md` puts shared code in `src/lib/` and `src/components/`. Moving it to `src/lib/logger.ts` would match that layout; the imports in `src/app/error.tsx` and `src/app/global-error.tsx` would need updating.
2. **Check the error boundaries in the browser.** Neither has been tried against a real thrown error yet. A temporary `throw` in a page (and in `layout.tsx` for `global-error.tsx`) is enough.
3. **Check the Next 16.4 docs for `error.js`** when they can be read, in case a built-in retry prop should replace the `router.refresh()` + `reset()` logic.
4. **Optional:** add a small `logger.test.ts` that spies on `console` and checks the prefix format.
