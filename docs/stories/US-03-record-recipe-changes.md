# US-03: Record recipe changes for an attempt

**Story:** As a home baker, I can note what I changed in the recipe for an attempt, and how it turned out, so that I learn which adjustments actually improve my bakes.

| PRD | Complexity | Depends on |
|---|---|---|
| F3 | M | US-02 |

## Acceptance criteria

1. While logging an attempt, I can add zero or more recipe changes. Each one has a description (required, e.g. "hydration 65% → 70%") and an outcome (optional, e.g. "more open crumb").
2. I can add and remove change rows in the form before submitting.
3. The attempt and its changes are saved together. If any part fails, nothing is saved (one transaction).
4. Change rows with an empty description are ignored rather than saved as blank changes.
5. Saved changes appear under their attempt on the challenge page, as a simple list of "description → outcome".

## Notes

- Free-text only. No structured ingredient model, recipe diffing or versioning (PRD F3).
- Extends the US-02 form and Server Action, so it doesn't need a separate page.
- A row with an outcome but no description is rejected with an error rather than ignored, so the baker's input is never silently dropped (decision 2026-10-30).
