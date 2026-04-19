# Vibe Coding Viability Guide

A practical playbook for making the `where` project safe and productive to
develop with an AI agent ("vibe coding") as the primary author. Each section
states a concrete **problem** we are hitting today, then the **solution**
we want to put in place, with enough detail that a model or a human can act
on it without further clarification.

The guide is opinionated on purpose — vibe coding only works when the
feedback loop is tight, the guardrails are explicit, and the environment is
reproducible. The less the agent has to guess, the less it hallucinates.

---

## TL;DR — The Five Pillars

| # | Problem | Solution |
|---|---------|----------|
| 1 | Hard to tell if a change is correct | Spec-anchored Playwright E2E tests, one per user story |
| 2 | Hard to tell where we are in the project | `tasks.md` checkboxes as the single source of truth, surfaced in CI + a `progress` script |
| 3 | Models write inconsistent tests and leaky types | Strict `tsconfig`, test templates, and test/type rules in `CLAUDE.md` |
| 4 | Branches collide on one checkout and dev server | Git worktrees, one per feature branch |
| 5 | Worktrees fight over ports and shared state | Per-worktree seed data + dynamic port allocation |

---

## Pillar 1 — Validation: Spec-Driven E2E Tests

### Problem

The project has a thorough spec under `specs/001-city-quiz-game/spec.md`, but
there is no automated way to ask *"does the app still do what the spec
says?"*. When a model edits a component, it can pass the type-checker, pass
lint, and still silently break a user story. We cannot vibe-code safely if
the only validator is the human eyeballing the UI.

### Solution

Treat the spec as the contract and the Playwright suite under `e2e/` as the
binding enforcement.

**Rules**

1. **One spec file per user story.** The file name mirrors the user story:
   `e2e/<kebab-case-story>.spec.ts` (we already do this — keep doing it).
2. **Every FR / acceptance criterion must map to at least one test.**
   Add a comment `// FR-013` / `// AC: player sees 4 points at clue 2`
   above each test block so the mapping is grep-able.
3. **Red-before-green.** When adding or changing a user story, the agent
   writes or updates the E2E test first, confirms it fails, then writes code.
4. **Fixtures come from `e2e/fixtures.ts`.** All tests seed through the same
   fixture so resets are predictable (see Pillar 5).
5. **`npm run test:e2e` is the merge gate.** No PR merges red.

**Coverage checklist template** — add to each user story in `tasks.md`:

```markdown
### E2E Tests for User Story N
- [ ] Happy path: <one-line scenario>
- [ ] Edge: <empty / exhausted / cancelled>
- [ ] Persistence: reload mid-flow, state intact
- [ ] Keyboard / command-bar equivalent of the primary action
```

### What to automate next

- Add a `pretest:e2e` script that greps `spec.md` for `FR-\d+` and fails if
  any FR is not referenced in an `e2e/**` test comment.
- Wire Playwright's HTML report as a PR artifact.

---

## Pillar 2 — Progress Tracking: Know Where We Are

### Problem

Halfway through a feature, nobody — human or agent — can answer *"what's
left before this ships?"* without re-reading the whole spec. Vibe coding
tends to fan out work across many small edits, and without a shared
tracker the agent either repeats completed work or skips pending work.

### Solution

Make `specs/<feature>/tasks.md` the **single source of truth** for progress,
and make it cheap to query.

**Rules**

1. Every task gets an ID (`T001`, `T002`, …) and a checkbox.
2. The agent ticks the checkbox *as soon as* the task is done and the
   relevant test is green — not at the end of the session.
3. Tasks reference files by absolute repo path (`src/hooks/useGameSession.ts`)
   so the agent never has to search.
4. Phases / checkpoints are explicit (`Phase 3`, `Checkpoint: MVP ready`).
5. Every task belongs to exactly one user story (`[US1]`, `[US2]`, …) so we
   can compute per-story progress.

**`progress` script** (to add to `package.json`):

```json
"scripts": {
  "progress": "node scripts/progress.mjs"
}
```

`scripts/progress.mjs` parses `specs/**/tasks.md`, counts `- [x]` vs `- [ ]`
per phase and per story, and prints a table:

```
Feature: 001-city-quiz-game
  Phase 1 Setup          5/5   ██████████ 100%
  Phase 3 US1 Quiz       9/9   ██████████ 100%
  Phase 4 US2 Modes      3/7   ████░░░░░░  43%
  Phase 5 US3 Multi      0/6   ░░░░░░░░░░   0%
  Overall               17/27  ██████░░░░  63%
```

**CI integration**: post the table as a sticky PR comment so reviewers see
progress at a glance, and fail the job if a PR claims "closes US2" while
US2 has unchecked boxes.

**Commit hygiene**: every commit message should reference the task IDs it
closes, e.g. `feat(us2): add Competition mode scoreboard (T024, T025)`.

---

## Pillar 3 — Model-Authored Tests, Types, and Cleanliness

### Problem

Left unconstrained, models will:

- Write tests that assert implementation details instead of behaviour.
- Sprinkle `any`, `as unknown as`, non-null assertions, and `// @ts-ignore`.
- Duplicate logic instead of reusing existing helpers.
- Add dead code, speculative abstractions, and explanatory comments that
  restate the obvious.

Any of those erode the codebase faster than a human reviewer can push back.

### Solution

Make the rules **mechanically enforced** wherever possible, and **written
into `CLAUDE.md`** where they aren't.

**Type strictness (enforced)**

`tsconfig.app.json` must include:

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

ESLint config bans the escape hatches:

```js
rules: {
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-non-null-assertion': 'error',
  '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': true }],
  '@typescript-eslint/consistent-type-imports': 'error',
}
```

**Test conventions (written)**

Add a `CLAUDE.md` section with these rules, so the agent reads them every
session:

- Tests describe user-visible behaviour. No test may reach into component
  internals (state hooks, refs) — only DOM / ARIA / URL / storage.
- Use semantic selectors: `getByRole`, `getByLabel`, `getByText`. Avoid
  `data-testid` unless the DOM is genuinely ambiguous.
- One assertion theme per test. Many expectations are fine; many themes are
  not.
- Fixtures seed deterministic data (Pillar 5) — no `Math.random()` in tests.
- A failing test must be reproducible from its name alone.

**Code cleanliness (written)**

- No comments that restate the code. Only comment non-obvious *why*.
- No speculative abstractions. Three similar lines beats a premature helper.
- Delete dead code on sight; never leave `// removed` markers.
- Prefer editing existing files over creating new ones.

**Review checklist for the agent** (paste into the PR description):

```markdown
- [ ] Every changed file is covered by at least one E2E assertion
- [ ] No new `any`, `!`, or `@ts-ignore`
- [ ] No new TODO / FIXME / "temporary" code
- [ ] `tasks.md` checkboxes updated
- [ ] `npm test && npm run lint && npm run test:e2e` all green
```

---

## Pillar 4 — Isolated Environments via Git Worktrees

### Problem

A single checkout means:

- Switching branches trashes the dev server and any in-progress state.
- Two parallel agent sessions fight over the same files and the same port
  5173.
- Hot-reload caches from branch A poison branch B.

For vibe coding we want to run **many short-lived branches in parallel**
without cross-contamination.

### Solution

Use `git worktree` so every feature branch has its own directory, its own
`node_modules` (or its own pnpm store link), its own dev server, and its
own test database / seed data.

**Layout**

```
~/code/where/                       # main checkout, tracks main
~/code/where-wt/
  ├── 001-city-quiz-game/           # worktree for branch 001-city-quiz-game
  ├── claude/project-viability/     # worktree for an agent branch
  └── ...
```

**Create a worktree**

```bash
git worktree add ../where-wt/<branch-name> -b <branch-name> origin/main
cd ../where-wt/<branch-name>
pnpm install
cp .env.example .env.local   # per-worktree env (see Pillar 5)
```

**Tear it down cleanly**

```bash
git worktree remove ../where-wt/<branch-name>
git branch -D <branch-name>   # only if truly discarded
```

**Agent conventions**

- The agent always opens its session inside its own worktree path.
- The agent never `git switch`es inside a worktree — it only commits and
  pushes on the branch the worktree was created for.
- Shared caches (pnpm store, Playwright browsers) are fine; shared state
  (dev server port, test DB, file uploads) is not — see Pillar 5.

**Helper script** `scripts/wt.sh`:

```bash
#!/usr/bin/env bash
# Usage: ./scripts/wt.sh new <branch> | rm <branch> | ls
set -euo pipefail
root="$(git rev-parse --show-toplevel)"
wt_root="${root%/*}/where-wt"
case "${1:-}" in
  new) git worktree add "$wt_root/$2" -b "$2" origin/main ;;
  rm)  git worktree remove "$wt_root/$2" ;;
  ls)  git worktree list ;;
  *)   echo "usage: wt.sh {new|rm|ls} [branch]"; exit 1 ;;
esac
```

---

## Pillar 5 — Seeded Data and Dynamic Ports per Worktree

### Problem

Worktrees solve file-level isolation but not runtime isolation. Two
worktrees running `pnpm dev` both want port 5173. Two Playwright runs
both want the same `localStorage` keys. Flaky tests and half-started
servers follow.

### Solution

Two small mechanisms, both driven off the worktree's directory path so no
manual configuration is needed.

### 5a. Dynamic ports

Derive a stable, collision-free port from the branch name.

**`scripts/port.mjs`**

```js
// Deterministic port in [5200, 5999] from the current branch name.
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
const h = createHash('sha1').update(branch).digest();
const port = 5200 + (h.readUInt16BE(0) % 800);
process.stdout.write(String(port));
```

**`vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';

const port = Number(execSync('node scripts/port.mjs').toString());

export default defineConfig({
  server: { host: true, port, strictPort: true },
  preview: { port },
});
```

**`playwright.config.ts`**

```ts
const port = Number(
  require('node:child_process').execSync('node scripts/port.mjs').toString()
);
export default defineConfig({
  use: { baseURL: `http://localhost:${port}` },
  webServer: {
    command: 'pnpm dev',
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
  },
});
```

Result: every worktree gets its own deterministic port. Two agents running
in parallel never collide, and the URL is the same across `dev`, `preview`,
and Playwright in that worktree.

### 5b. Seed data ("seedlings")

Every worktree needs to start from a known good state. Today the app is
in-memory only, but as soon as we add persistence (localStorage / IndexedDB
/ a future backend) we need this in place.

**Rules**

1. Seed data lives in `src/data/seeds/` as typed TS modules
   (`baseSeed.ts`, `multiplayerSeed.ts`, …).
2. A single entry point `src/data/seeds/index.ts` exports a
   `loadSeed(name: SeedName)` function.
3. In development and E2E, the app reads the seed name from
   `VITE_SEED` (default `base`) and hydrates state on boot.
4. Each Playwright test declares the seed it needs via the fixture:

   ```ts
   test.use({ seed: 'multiplayer' });
   ```

   The fixture resets storage and calls `loadSeed()` before each test.
5. Seed names are enumerated in a TS union so misspellings fail at compile
   time.

**Why "seedlings"**: small, composable, per-scenario. Never one giant
golden fixture — each test uses the smallest seed that exercises it, and
new seeds are cheap to add.

**CI**: the matrix runs each seed at least once on `main` to catch seed rot.

---

## Bringing It All Together

The day-to-day vibe-coding loop becomes:

1. `./scripts/wt.sh new feat/<slug>` — new worktree, new port, new branch.
2. Update `specs/<feature>/spec.md` or `tasks.md` to define the slice.
3. Ask the agent to write the failing Playwright test first.
4. Ask the agent to implement until `npm run test:e2e` passes.
5. Run `npm run progress` to confirm the tracker advanced.
6. Commit with task IDs, push, open PR.
7. CI enforces: lint + types + E2E + FR-coverage + progress delta.
8. `./scripts/wt.sh rm feat/<slug>` after merge.

When all five pillars are in place, the agent can run with a long leash:
the guardrails catch its mistakes before they reach `main`, and the human
reviewer's job shrinks from "did this actually work?" to "is this the
right thing to build?".

---

## Adoption Order (suggested)

The pillars reinforce each other, but you don't need them all at once.
A pragmatic rollout:

1. **Pillar 3** (strict types + `CLAUDE.md` rules) — pure config, lands today.
2. **Pillar 1** (spec ↔ test mapping) — already 80% there; add the FR-grep gate.
3. **Pillar 2** (`progress` script + PR comment) — one afternoon.
4. **Pillar 5a** (dynamic ports) — one file change, unblocks parallelism.
5. **Pillar 4** (worktree helper) — documentation + a shell script.
6. **Pillar 5b** (seedlings) — land when persistence lands; stub the API now.
