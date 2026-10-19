# US-02: Log a baking attempt

**Story:** As a home baker, I can log an attempt at a challenge with the date, my notes and a rating, so that I keep a record of how each bake went.

| PRD | Complexity | Depends on |
|---|---|---|
| F2 | M | US-01 |

## Acceptance criteria

1. An unlocked challenge's page has a "Log attempt" form with: date (defaults to today), notes (optional, free text), overall rating 1–5 (required), and optional taste, texture and appearance ratings (1–5).
2. Submitting a valid form saves the attempt to SQLite and shows it on the challenge page without a manual reload. It's still there after restarting the app.
3. Submitting without an overall rating, or with a value outside 1–5, is rejected with a clear error message, and nothing is saved.
4. The server refuses an attempt on a locked challenge, even if the request skips the UI.
5. A challenge with *Not started* status changes to *In progress* after its first attempt.

## Notes

- Implement as a Server Action. Validate on the server, not only in the browser.
- Success criterion: opening the app and logging an attempt should take under 2 minutes (PRD §5), so keep the form short and on the challenge page.
