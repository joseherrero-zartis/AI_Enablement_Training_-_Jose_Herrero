# User stories

Stories for Baker's Journey v1, based on the [PRD](../PRD.md). The user in every story is the single home baker (PRD §2).

| ID | Story | PRD | Size | Depends on |
|---|---|---|---|---|
| [US-01](US-01-browse-journey.md) | Browse the baking journey | F1 | S | None |
| [US-02](US-02-log-attempt.md) | Log a baking attempt | F2 | M | US-01 |
| [US-03](US-03-record-recipe-changes.md) | Record recipe changes for an attempt | F3 | M | US-02 |
| [US-04](US-04-review-attempt-history.md) | Review my attempt history | F2, F3 | S | US-02, US-03 |
| [US-05](US-05-edit-delete-attempt.md) | Edit or delete an attempt | F2, F3 | S | US-02, US-03 |
| [US-06](US-06-mark-mastered.md) | Mark a challenge as mastered | F4, F1 | M | US-01, US-02 |
| [US-07](US-07-undo-mastery.md) | Undo mastery | F4 | S | US-06 |
| [US-08](US-08-progress-dashboard.md) | See my overall progress | F5 | S | US-01, US-06 |

**Sizes:** S ≈ up to half a day, M ≈ 1–2 days, for one part-time developer. That's 5 S + 3 M, about 5–8 days in total, which fits the PRD's 2–4 week window.

## Suggested build order

1. **US-01**: confirm the journey and locking (mostly scaffolded)
2. **US-02 → US-03**: the core logging flow (the PRD's "log an attempt in under 2 minutes" success criterion)
3. **US-06 → US-07**: mastery and unlocking, which make the journey progress
4. **US-04, US-08**: finish the history and dashboard views
5. **US-05**: editing and deleting attempts

After step 2 the app is usable for real bakes (PRD §5: at least 4 real bakes). After step 3 the journey works end to end.
