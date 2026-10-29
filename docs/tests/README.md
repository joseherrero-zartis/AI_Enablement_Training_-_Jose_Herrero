# Gherkin scenarios

Behaviour scenarios for Baker's Journey, written in [Gherkin](https://cucumber.io/docs/gherkin/reference/). Each file describes how one [user story](../stories/README.md) should behave, in plain language.

## Conventions

- **One `.feature` file per user story,** named like the story: `US-02-log-attempt.md` → `US-02-log-attempt.feature`.
- **The `Feature:` line uses the story's ID and title,** for example `Feature: US-02 Log a baking attempt`.
- **Every acceptance criterion is covered by at least one scenario.** Tag each scenario with the story and criterion it covers, for example `@US-02 @AC-3`.
- **Describe what the baker sees and does,** not how the code works (no SQL, components or function names).
- **Use `Background:`** for steps every scenario in the file shares, such as "Given challenge 1 is unlocked".
- **Keep the PRD's rules,** for example ratings 1–5 and a locked challenge can't be opened. Don't add behaviour that isn't in the story or the PRD.

## Status

These files are specifications, not automated tests. There's no Cucumber runner in the project yet. Use them to agree on behaviour before building a story, and as a checklist for manual testing.
