# Handoff: logger utility

## Done

- Added `src/utils/logger.ts`, which exports a `logger` object with `info`, `warn` and `error` methods.
- Added a `debug` method that calls `console.debug`, but only when the `DEBUG` environment variable is set to a non-empty value. It reads `DEBUG` on each call.
- Each message is prefixed with a timestamp and level, e.g. `[2026-10-29T10:56:59.123Z] [INFO] message`.
- `npm run typecheck`, `npm run lint` and `npm test` all pass.
- Nothing is committed yet (`src/utils/` is untracked), and nothing in the app uses the logger yet.

## Decisions

- **Timestamp:** UTC in ISO 8601 format, from `new Date().toISOString()`.
- **Console methods:** each level calls the console method of the same name (`console.info`, `console.warn`, `console.error`), so browser and terminal tools can filter by level.
- **Extra arguments:** each method takes optional values after the message and passes them to the console unchanged, so objects and errors keep their normal formatting.
- **Kept out on purpose:** level filtering, file or remote output, and JSON output. The request didn't ask for them, and `CLAUDE.md` asks for simple solutions.
- **No tests:** `CLAUDE.md` only requires unit tests for `src/lib/domain/`, and the logger is a thin wrapper around `console`.
- **No ESLint change:** the ESLint config has no `no-console` rule, so lint passes without one.

## Next

1. **Decide where the file lives.** It's in `src/utils/` as requested, but `CLAUDE.md` puts shared code in `src/lib/` and `src/components/`. Moving it to `src/lib/logger.ts` would match that layout.
2. **Commit it** on the `certification-delivery` branch.
3. **Optional:** use it where logging is useful, such as Server Actions or DB seeding. Import it with the `@/` alias.
4. **Optional:** add a small `logger.test.ts` that spies on `console` and checks the prefix format.
