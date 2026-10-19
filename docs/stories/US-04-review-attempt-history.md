# US-04: Review my attempt history

**Story:** As a home baker, I can see all my past attempts at a challenge, newest first, so that I can tell whether I'm improving and avoid repeating mistakes.

| PRD | Complexity | Depends on |
|---|---|---|
| F2, F3 | S | US-02, US-03 |

## Acceptance criteria

1. The challenge page lists all attempts for that challenge, newest bake date first. Attempts on the same date are ordered by when they were logged, newest first.
2. Each attempt shows its date, overall rating, any optional ratings that were given, its notes and its recipe changes.
3. With no attempts yet, the page shows "No attempts logged yet."
4. Long notes keep their line breaks and don't break the layout on a phone-width screen.

## Notes

- The query and basic list exist in the scaffold (`getChallengeBySlug`). Optional ratings aren't displayed yet.
- No charts or trends in v1. The ordered list is the "see improvement" view.
