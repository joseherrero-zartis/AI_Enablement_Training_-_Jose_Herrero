# US-08: See my overall progress

**Story:** As a home baker, I can see a dashboard of my overall progress and my next challenge, so that I stay motivated and can jump straight back into baking.

| PRD | Complexity | Depends on |
|---|---|---|
| F5 | S | US-01, US-06 |

## Acceptance criteria

1. The home page shows "X / Y mastered" and a progress bar, where Y is the total number of challenges.
2. It shows the current level, which is the level of the next challenge to work on.
3. It shows the next suggested challenge (the first unlocked challenge that isn't mastered) and links to it.
4. When every challenge is mastered, it shows a completion message instead of a next challenge.
5. The dashboard reflects new attempts, masteries and undos as soon as I navigate back to it.

## Notes

- Built in the scaffold with `summarizeProgress()`. It becomes meaningful once US-06 exists, and what remains is checking it end to end.
- No badges, streaks or points (PRD §4).
