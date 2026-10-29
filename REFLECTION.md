## Day 1 
I have chosen this project because I have baking as a hobbie but I always end up following recipes but never mastering them. I envy The Great British Bake Off's participants as they achieve really good bakes. I know that there are techniques to master before being able to reach those levels. I don't know which are the techniques and I would like to have a clear learning path. It should be created in a way I cannot take shortcuts and that it doesn't leave me progress until I have solid foundations.

Having a PRD document allows me not to miss the point of what I want to achieve and also give a foundational context for all US.

I have chosen Next.js because it is a framework I feel visually appealing and with a code that is easy to read. I have chosen SQLite as first iteration. In case I would like to expand this application to other users I would need a proper backend system as all validations (as login validation) should happen in the backend.

Another thing I have learnt is the basic structure for AI-driven development projects.

I have created the private repository in Github as I am running this training by miself so I don't have a trainer to provide me with the repository in Azure. 

## Day 2
I have worked on a logger utility in `src/utils/logger.ts`. It has `info`, `warn` and `error` methods, and each message is prefixed with a UTC timestamp and the level, e.g. `[2026-10-29T10:56:59.123Z] [INFO] message`.

At the end of the session I asked Claude to write a `HANDOFF.md` with what was done, the decisions taken and the next steps. Then I cleared the context and started a new session that resumed the work only from that file. This showed me that a good handoff document lets me continue the work without losing the reasoning behind earlier decisions.

In the new session I added a `debug` level that only outputs when the `DEBUG` environment variable is set. Typecheck, lint and tests pass. The logger is not committed yet and nothing in the app uses it yet. I still need to decide whether it should live in `src/lib/` to match the project structure.

What I observed is that `/compact` helps summarizing the session in a more volatile way than `HANDOFF.md` which is persistent and could be shared among developers. I have not much experience with this WoW but I am thinking if it would be useful to have a `/handoff` skill within `z-cora` or even a scheduled task to do it for me every night.

I also decided the error handling approach for the whole project. Instead of just accepting the first answer, I asked Claude for the well-known patterns so I could compare them: throwing everything to error boundaries, returning expected errors and throwing unexpected ones, a `Result<T, E>` type everywhere, typed domain exceptions, and an action wrapper library like `next-safe-action`. I chose to return expected errors (validation, a locked challenge) from the Server Actions and show them in the form with `useActionState`, and to let unexpected errors (database failures, bugs) throw to `app/error.tsx`. For validation I chose hand-written functions in `src/lib/domain/` instead of Zod, so there are no new dependencies. What convinced me is that Next.js hides the message of thrown errors in production, so throwing validation errors would never show the user a clear message, which US-02 requires. The other options were valid, but too much ceremony for five actions and one user.

I recorded the decision in two places: a short rule in `CLAUDE.md`, so Claude follows it in every session, and `docs/adr/005-error-handling.md`, with the context and the alternatives I rejected. I learnt that asking for options before deciding, and writing the decision down where the AI reads it, keeps the project consistent and saves me from repeating the same instructions.

After a `/clear` I asked Claude to summarize how the project handles database errors. The answer was based on the ADR and the code, and it also showed what was still missing: the `app/error.tsx` error boundary that the convention relies on didn't exist yet. I asked Claude to add it, and then `app/global-error.tsx` for errors in the root layout itself. Both show a generic message with an error reference, because Next.js hides the real message in production, and both use the logger, so it is finally used in the app. Typecheck, lint and tests pass, but I still need to try both pages against a real error in the browser.

Claude couldn't read the Next.js docs in `node_modules` because a local hook blocks that folder. `AGENTS.md` asks to read those docs before writing Next.js code, so two of my own rules were in conflict. Claude told me about it and left it as a next step in `HANDOFF.md` instead of hiding it. I learnt that the guardrails I set up can get in each other's way, and that it's important the AI says so when it happens.

I committed and pushed everything, and asked Claude to update `HANDOFF.md`. When it suggested "correcting" my Day 2 notes in this file because they said the logger wasn't committed yet, I realised I had never told it that this file is my diary. Those lines were true when I wrote them. I first explained it in the chat, and Claude saved it as a memory, but then I asked to write the rule in `CLAUDE.md` instead. A memory only lives on my machine, while `CLAUDE.md` is in the repository, so any developer or AI session working on the project follows the same rule. I learnt that rules about how to work with the project belong in the project, not in one person's setup.
