# PRD: Baker's Journey

**Status:** Draft · **Owner:** Jose Herrero · **Date:** 2026-10-19 · **Type:** Training project

## 1. Problem statement

Home bakers who want to improve step by step have no clear path from beginner to advanced. Recipes are spread across books, blogs and videos, with no order of difficulty. Bakers lose track of what they've already tried, what went wrong, and what they changed. Notes end up in notebooks, phone memos or nowhere, so lessons get forgotten and the same mistakes come back.

**Baker's Journey** is a personal web app that gives a self-taught baker:
- a **structured path** of baking challenges ordered by difficulty, each one built around a core technique, and
- **one place to record** attempts, evaluations, recipe changes and mastery, so progress is visible and lessons stick.

## 2. User personas

**Primary: "The self-taught home baker" (the author)**
- A beginner or early-intermediate baker who learns from online recipes.
- Bakes 1–3 times a week and wants to get steadily better, not just follow recipes.
- Pain points: doesn't know what to learn next, forgets what changed between attempts, can't tell whether they're actually improving.
- Goal: work through a clear progression, from simple quick breads to laminated doughs, and know when a technique has been mastered.

*Secondary (not targeted in v1):* other hobby bakers who could later use the same journey.

## 3. Core features

### F1. Baking journey (ordered challenge list)
- A predefined, seeded list of about 15–25 challenges, grouped into levels (e.g. *Beginner → Intermediate → Advanced → Master*).
- Each challenge has: title, technique it teaches (e.g. creaming, kneading, lamination, tempering), difficulty level, a short description, and a base recipe (ingredients + steps as text).
- Challenges are shown in order, with their status: *Locked / Not started / In progress / Mastered*.
- **Sequential unlocking:** only the first challenge is available at the start. Each later challenge unlocks when the one before it is marked *Mastered*. Locked challenges are visible (title, technique, level) but can't be opened to log attempts.

### F2. Attempt log with notes and evaluation
- Log one or more **attempts** for each challenge: date, free-text notes, and a 1–5 rating covering the overall result (and optionally taste, texture, appearance).
- Attempts are listed newest first on the challenge page, so improvement over time is easy to see.

### F3. Recipe change tracking
- For each attempt, record **what changed** compared with the base recipe or the previous attempt (e.g. "hydration 65% → 70%", "baked 5 min longer"), plus the outcome.
- Shown as a simple list for each attempt. No diffing or recipe versioning engine.

### F4. Mastery checkpoint
- The user marks a challenge as **Mastered** by hand, with an optional reflection note ("Why I consider this mastered").
- Marking a challenge as mastered unlocks the next challenge in the journey.
- It can be undone at any time. Undoing does **not** re-lock challenges that are already unlocked, so attempts logged on them stay accessible.
- Optional soft guidance: show a hint such as "3 attempts rated 4+" without enforcing it.

### F5. Progress overview
- A dashboard showing overall progress (e.g. "7 / 20 mastered"), the current level, and the next suggested challenge.

## 4. Out of scope (v1)

- Multiple users, sign-up/login, sharing or social features
- User-created or editable journey structure (the journey is seeded data; editing it is a stretch goal)
- Photo uploads and media storage
- Recipe import from URLs, scaling, unit conversion or nutrition data
- Timers, reminders, notifications
- Native mobile apps (a responsive web UI is enough)
- AI recipe suggestions or automatic evaluation
- Gamification beyond the basic progress overview (badges, streaks, points)

## 5. Success criteria

**Product**
- The author can go from opening the app to logging an attempt (notes, rating, changes) in **under 2 minutes**.
- All 5 core features work end to end with data that persists between sessions.
- The author actually uses it for **at least 4 real bakes** during the training period.

**Engineering (training goals)**
- Clean, readable codebase with a README that explains setup in a few commands.
- Automated tests cover core logic (status changes, sequential unlocking, attempt CRUD, progress calculation).
- The app runs locally with a single command; deployment is optional.

## 6. Constraints

- **Time:** a training project, roughly 2–4 weeks of part-time work. Scope must fit that.
- **Team:** a single developer, assisted by AI tools.
- **Tech (suggested, keep it simple):**
  - Frontend: React (Vite) or a server-rendered framework such as Next.js
  - Persistence: **SQLite** (decided). One local database file holds the seeded journey and all user data.
  - Backend: a thin server layer (API routes or server actions) to read and write SQLite. No microservices, queues or cloud infra.
- **Data:** the journey content (challenges and base recipes) is hand-written seed data. Its quality depends on the author's own research.
- **Known limitations:** single-user and local-first, so data lives in one SQLite file on one machine unless deployed. Mastery is self-assessed and subjective. No backup or sync in v1.

## 7. Decisions log

| Date | Decision | Rationale |
|---|---|---|
| 2026-10-19 | Use SQLite for persistence | More realistic practice than localStorage, and still zero infrastructure |
| 2026-10-19 | Challenges unlock in sequence when the previous one is mastered | Keeps the learning path structured, from simple to advanced |
