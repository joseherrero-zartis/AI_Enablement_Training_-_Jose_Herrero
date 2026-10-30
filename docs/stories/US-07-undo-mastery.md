# US-07: Undo mastery

**Story:** As a home baker, I can undo marking a challenge as mastered, so that I can correct a mistake or admit I need more practice.

| PRD | Complexity | Depends on |
|---|---|---|
| F4 | S | US-06 |

## Acceptance criteria

1. A mastered challenge has an "Undo mastery" action that asks for confirmation.
2. Undoing clears the mastered date and reflection note. The status becomes *In progress* if the challenge has attempts, or *Not started* if it doesn't.
3. Challenges that were already unlocked stay unlocked, and their attempts stay accessible.
4. Marking the challenge as mastered again works as described in US-06.

## Notes

- The "never re-lock" rule is a PRD decision (F4). Cover it with a unit test.
