# US-06: Mark a challenge as mastered

**Story:** As a home baker, I can mark a challenge as mastered with an optional reflection note, so that I record my progress and unlock the next challenge.

| PRD | Complexity | Depends on |
|---|---|---|
| F4, F1 | M | US-01, US-02 (for the hint) |

## Acceptance criteria

1. An unlocked challenge that isn't mastered has a "Mark as mastered" action with an optional reflection note ("Why I consider this mastered").
2. Confirming saves the mastered date and note, sets the status to *Mastered*, and unlocks the next challenge in the journey, all in one transaction.
3. Mastering the last challenge in the journey works and doesn't try to unlock anything.
4. When the challenge has at least 3 attempts rated 4 or higher, the page shows a hint suggesting it may be ready. The hint never blocks marking it as mastered, with or without attempts.
5. The mastered date and note are shown on the challenge page.

## Notes

- Use `getChallengeToUnlock()` from `src/lib/domain/journey.ts`. Unit test the unlock behaviour (PRD §5: "sequential unlocking").
- Mastery is self-assessed (PRD §6). There's no automatic evaluation.
