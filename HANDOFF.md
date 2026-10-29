# Handoff: logger utility and error boundaries

## Done

- Added `src/lib/logger.ts` (first written in `src/utils/`, moved after code review), which exports a `logger` object with `info`, `warn` and `error` methods.
- Added a `debug` method that calls `console.debug`, but only on the server and only when `LOG_DEBUG=1`. It reads `LOG_DEBUG` on each call.
- Each message is prefixed with a timestamp and level, e.g. `[2026-10-29T10:56:59.123Z] [INFO] message`.
- Recorded the error handling convention in `docs/adr/005-error-handling.md` and `CLAUDE.md`: expected errors are returned from Server Actions, unexpected errors (SQLite failures, bugs) throw to an error boundary.
- Added `src/app/error.tsx`, the error boundary for route render errors. It logs the error and its digest with `logger.error`, shows the error digest as a reference, and its **Try again** button calls `router.refresh()` then `reset()` so Server Components re-run their queries.
- Added `src/app/global-error.tsx` for errors in the root layout itself. It renders its own `<html>` and `<body>`, imports `globals.css`, and **Try again** does a full page reload.
- `npm run typecheck`, `npm run lint` and `npm test` all pass.
- Everything is committed and pushed on `certification-delivery` (`d1d8544`, `041fcb9`, `53cccdf`).

## Decisions

- **Timestamp:** UTC in ISO 8601 format, from `new Date().toISOString()`.
- **Console methods:** each level calls the console method of the same name (`console.info`, `console.warn`, `console.error`), so browser and terminal tools can filter by level.
- **Extra arguments:** each method takes optional values after the message and passes them to the console unchanged, so objects and errors keep their normal formatting.
- **`LOG_DEBUG`, not `DEBUG`:** other libraries read `DEBUG` (e.g. `DEBUG=*` for the `debug` package), which would turn this logger on too. Only the exact value `1` enables it, so `LOG_DEBUG=0` stays off. Next only exposes `NEXT_PUBLIC_*` variables to the browser, so `debug()` is server-only.
- **Where it's safe to call:** Server Actions, client effects, or Server Components after `await connection()`. The timestamp reads the current time, which `cacheComponents` forbids during a prerender.
- **Error pages log the digest:** `{ digest: error.digest }` is logged with the error, so the browser console line matches the "Error reference" on the page and the full error in the server logs.
- **Kept out on purpose:** level filtering, file or remote output, and JSON output. The request didn't ask for them, and `CLAUDE.md` asks for simple solutions.
- **Two logger tests only** (`src/lib/logger.test.ts`): the prefix format, and that `debug()` stays silent unless `LOG_DEBUG=1`. The rest is a thin wrapper around `console`.
- **No ESLint change:** the ESLint config has no `no-console` rule, so lint passes without one.
- **Error boundary props:** both boundaries use the long-standing `{ error, reset }` props. A local hook blocks reading `node_modules/next/dist/docs/`, so the Next 16.4 docs weren't checked. Typecheck accepts these props.
- **No error message shown:** Next hides thrown error messages in production, so the boundaries show a generic message plus `error.digest` to match against server logs.
- **`global-error.tsx` skips the Geist fonts and the nav,** because they belong to the root layout that failed.

## Next

1. **Check the error boundaries in the browser.** Neither has been tried against a real thrown error yet. A temporary `throw` in a page (and in `layout.tsx` for `global-error.tsx`) is enough.
2. **Check the Next 16.4 docs for `error.js`** when they can be read, in case a built-in retry prop should replace the `router.refresh()` + `reset()` logic.
