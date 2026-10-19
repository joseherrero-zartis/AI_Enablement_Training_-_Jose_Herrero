# US-01: Browse the baking journey

**Story:** As a home baker, I can see every challenge in the journey in order of difficulty, with its status, so that I know where I am and what I'll learn next.

| PRD | Complexity | Depends on |
|---|---|---|
| F1 | S | None |

## Acceptance criteria

1. The journey page lists all seeded challenges in position order, grouped by level (Beginner → Intermediate → Advanced → Master).
2. Each challenge shows its title, technique, level and status: *Locked*, *Not started*, *In progress* or *Mastered*.
3. On a fresh database, only the first challenge is unlocked. Every other challenge shows as *Locked*.
4. Locked challenges are visible but not clickable. Opening a locked challenge's URL directly shows a "master the previous challenge to unlock this one" message instead of its recipe and attempts.
5. Unlocked challenges open a detail page showing the description and base recipe, or "No base recipe written yet" if it's empty.

## Notes

- Mostly built in the scaffold (`/journey`, `/challenges/[slug]`). What remains is checking it against these criteria and testing it.
- Writing the base recipes in `seed-data.ts` is a content task, not part of this story.
