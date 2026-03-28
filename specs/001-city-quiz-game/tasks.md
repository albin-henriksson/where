# Tasks: City Quiz Card Game

**Input**: Design documents from `/specs/001-city-quiz-game/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: Playwright e2e tests required for all user stories (FR-013).

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup

**Purpose**: Project initialization with Vite + React + TypeScript + Tailwind + Playwright

- [x] T001 Configure Tailwind CSS in src/index.css with @import "tailwindcss"
- [x] T002 [P] Create CityCard type definition in src/data/types.ts
- [x] T003 [P] Create starter city cards dataset (5+ cards) in src/data/cards.ts
- [x] T004 Remove default Vite boilerplate from src/App.tsx and src/App.css
- [x] T005 Install and configure Playwright with playwright.config.ts (baseURL: localhost:5173, webServer config for pnpm dev)

---

## Phase 2: Foundational

**Purpose**: Core game hook that all UI stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Implement useGameSession hook in src/hooks/useGameSession.ts with Fisher-Yates shuffle, card draw, clue progression, reveal, skip, and next-card logic

**Checkpoint**: Game state logic ready — UI implementation can begin

---

## Phase 3: User Story 1 - Play a Quiz Round (Priority: P1) 🎯 MVP

**Goal**: Core gameplay loop — show clues progressively, handle correct guess and exhausted clues, reveal city, draw next card

**Independent Test**: Open app, see first clue, tap "Next Clue" through all 5, see city revealed. Refresh and play again tapping "Correct" at clue 2 — verify 4 points shown.

### Implementation for User Story 1

- [x] T007 [US1] Create CardView component in src/components/CardView.tsx — displays current clue, clue number indicator (1-5), and point value
- [x] T008 [US1] Add "Next Clue" and "Correct" action buttons to CardView in src/components/CardView.tsx
- [x] T009 [US1] Create RevealView in src/components/CardView.tsx — shows city name, country, and earned points after round ends
- [x] T010 [US1] Add "Next Card" button to RevealView that draws the next unseen card
- [x] T011 [US1] Wire up CardView and game hook in src/App.tsx as the main game screen

### E2E Tests for User Story 1

- [x] T012 [US1] Write Playwright test in e2e/quiz-round.spec.ts: verify first clue is displayed on load
- [x] T013 [US1] Write Playwright test in e2e/quiz-round.spec.ts: click "Next Clue" 4 times, verify all 5 clues revealed progressively and point value decreases
- [x] T014 [US1] Write Playwright test in e2e/quiz-round.spec.ts: click "Correct" on clue 2, verify city name revealed with 4 points
- [x] T015 [US1] Write Playwright test in e2e/quiz-round.spec.ts: exhaust all clues without guessing, verify city revealed with 0 points
- [x] T016 [US1] Write Playwright test in e2e/quiz-round.spec.ts: complete a card and click "Next Card", verify a new card is drawn

**Checkpoint**: Full quiz round playable and validated by e2e tests

---

## Phase 4: User Story 2 - Hide/Skip a Card (Priority: P1)

**Goal**: Allow reader to skip unwanted cards via keyboard shortcut and semi-hidden button

**Independent Test**: Press Escape on a card — verify it disappears and a new card is drawn. Verify skipped card never reappears.

### Implementation for User Story 2

- [x] T017 [US2] Create SkipButton component in src/components/SkipButton.tsx — subtle, low-opacity button positioned in corner
- [x] T018 [US2] Add keyboard listener for Escape key to trigger skip in src/App.tsx
- [x] T019 [US2] Integrate SkipButton into the card view layout in src/App.tsx

### E2E Tests for User Story 2

- [x] T020 [US2] Write Playwright test in e2e/skip-card.spec.ts: press Escape key, verify new card is drawn (different clue text)
- [x] T021 [US2] Write Playwright test in e2e/skip-card.spec.ts: click skip button, verify new card is drawn
- [x] T022 [US2] Write Playwright test in e2e/skip-card.spec.ts: skip a card and play through remaining, verify skipped card never reappears

**Checkpoint**: Cards can be skipped via tap or keyboard, validated by e2e tests

---

## Phase 5: User Story 3 - Session Card Tracking (Priority: P2)

**Goal**: Show end-of-deck message when all cards are exhausted

**Independent Test**: Play/skip through all cards and verify "Inga fler kort!" message appears.

### Implementation for User Story 3

- [x] T023 [US3] Create EmptyDeck component in src/components/EmptyDeck.tsx — displays "Inga fler kort!" message
- [x] T024 [US3] Conditionally render EmptyDeck when no cards remain in src/App.tsx

### E2E Tests for User Story 3

- [x] T025 [US3] Write Playwright test in e2e/session-tracking.spec.ts: skip all cards rapidly, verify "Inga fler kort!" message is displayed
- [x] T026 [US3] Write Playwright test in e2e/session-tracking.spec.ts: verify no repeated cards appear during a full session playthrough

**Checkpoint**: Session gracefully handles deck exhaustion, validated by e2e tests

---

## Phase 6: User Story 4 - Claude Card Creation Skill (Priority: P2)

**Goal**: Claude Code slash command that researches a city and generates a new card entry

**Independent Test**: Run `/add-city-card Stockholm` and verify a properly structured card is appended to src/data/cards.ts.

### Implementation for User Story 4

- [ ] T027 [US4] Create Claude skill file at .claude/commands/add-city-card.md with instructions to research city, generate 5 Swedish clues (hardest→easiest), check for duplicates, and append to src/data/cards.ts

**Checkpoint**: New city cards can be generated via Claude Code skill (manual validation — no e2e for developer tooling)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Deployment, styling refinement, mobile optimization

- [ ] T028 [P] Create Dockerfile with multi-stage build (node build → nginx serve) at project root
- [ ] T029 [P] Add .dockerignore at project root
- [ ] T030 Style mobile-first card layout with Tailwind in src/components/CardView.tsx — large readable text, centered card, touch-friendly buttons
- [ ] T031 Add Swedish game title and minimal header to src/App.tsx
- [ ] T032 Clean up unused Vite scaffold files (src/assets/, public/vite.svg)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T002 (types) from Setup — BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Phase 2 (useGameSession hook)
  - US1 and US2 can proceed in parallel after Phase 2
  - US3 depends on US1 (needs card play flow to test exhaustion)
  - US4 is fully independent (developer tool, no UI dependency)
- **E2E tests**: Run after implementation tasks within each user story
- **Polish (Phase 7)**: Can start after US1 for Dockerfile; styling after all UI stories

### Within Each User Story

- Components before wiring into App.tsx
- Implementation before e2e tests
- Core functionality before polish

### Parallel Opportunities

- T002 and T003 can run in parallel (different files)
- T017 (SkipButton) can run in parallel with T007-T011 (CardView) — different files
- T023 (EmptyDeck) can run in parallel with other component tasks
- T027 (Claude skill) is fully independent — can run anytime
- T028 and T029 (Docker) are independent of all UI work
- E2e test files for different stories are independent

---

## Parallel Example: After Phase 2

```bash
# These can all start simultaneously after useGameSession is complete:
Task: "T007 [US1] Create CardView component"
Task: "T017 [US2] Create SkipButton component"
Task: "T023 [US3] Create EmptyDeck component"
Task: "T027 [US4] Create Claude skill"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006)
3. Complete Phase 3: User Story 1 (T007-T016)
4. **STOP and VALIDATE**: Run `pnpm exec playwright test e2e/quiz-round.spec.ts`
5. Deploy if ready

### Incremental Delivery

1. Setup + Foundational → Game logic ready
2. Add US1 + e2e tests → Playable quiz round (MVP!)
3. Add US2 + e2e tests → Skip/hide cards
4. Add US3 + e2e tests → Deck exhaustion handling
5. Add US4 → Card creation tooling
6. Polish → Dockerfile, styling, cleanup

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable after Phase 2
- E2e tests validate each story's acceptance scenarios from spec.md
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
- Run all e2e tests: `pnpm exec playwright test`
