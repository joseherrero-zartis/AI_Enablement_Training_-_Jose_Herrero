# US-05: Edit or delete an attempt

**Story:** As a home baker, I can edit or delete an attempt I logged, so that my record stays accurate when I make a typo or log something by mistake.

| PRD | Complexity | Depends on |
|---|---|---|
| F2, F3 | S | US-02, US-03 |

## Acceptance criteria

1. Each attempt has "Edit" and "Delete" actions.
2. Editing opens the same fields as logging (date, notes, ratings, recipe changes), pre-filled. Saving applies the same validation as US-02.
3. Deleting asks for confirmation first, then removes the attempt and its recipe changes.
4. If I delete the only attempt on a challenge that isn't mastered, its status goes back to *Not started*.
5. Deleting attempts never changes a challenge's mastered or unlocked state.

## Notes

- Covers the "attempt CRUD" item in the PRD's engineering success criteria.
- Editing recipe changes can be done by replacing the attempt's change list on save. No per-row history is needed.
