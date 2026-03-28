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

- [x] T027 [US4] Create Claude skill file at .claude/commands/add-city-card.md with instructions to research city, generate 5 Swedish clues (hardest→easiest), check for duplicates, and append to src/data/cards.ts

**Checkpoint**: New city cards can be generated via Claude Code skill (manual validation — no e2e for developer tooling)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Deployment, styling refinement, mobile optimization

- [x] T028 [P] Create Dockerfile with multi-stage build (node build → nginx serve) at project root
- [x] T029 [P] Add .dockerignore at project root
- [x] T030 Style mobile-first card layout with Tailwind in src/components/CardView.tsx — large readable text, centered card, touch-friendly buttons
- [x] T031 Add Swedish game title and minimal header to src/App.tsx
- [x] T032 Clean up unused Vite scaffold files (src/assets/, public/vite.svg)

---

## Phase 8: User Story 5 - Game Modes: Freeplay & Competition (Priority: P1)

**Goal**: Start screen with mode selection, player setup for competition, score tracking and assignment per player, visible scoreboard

**Independent Test**: Start competition with 3 players, play 2 rounds assigning points to different players, verify scoreboard totals.

### Implementation for User Story 5

- [x] T033 [US5] Add Player and GameMode types to src/data/types.ts
- [x] T034 [US5] Create useGameState hook in src/hooks/useGameState.ts — manages game mode, player list, scores, reset, add/remove players, adjust scores
- [x] T035 [US5] Create StartScreen component in src/components/StartScreen.tsx — mode selection (Frilek/Tävling) + player name input for competition
- [x] T036 [US5] Create Scoreboard component in src/components/Scoreboard.tsx — compact sorted player scores display
- [x] T037 [US5] Update CardView reveal to show player assignment buttons in competition mode in src/components/CardView.tsx
- [x] T038 [US5] Wire up game state, start screen, and scoreboard in src/App.tsx — screen routing between start/game

### E2E Tests for User Story 5

- [x] T039 [US5] Write Playwright test in e2e/game-modes.spec.ts: verify start screen shows two mode options
- [x] T040 [US5] Write Playwright test in e2e/game-modes.spec.ts: select Frilek, verify game starts without player setup
- [x] T041 [US5] Write Playwright test in e2e/game-modes.spec.ts: select Tävling, add 2 players, start game, guess correct, assign points to player, verify scoreboard updates
- [x] T042 [US5] Write Playwright test in e2e/game-modes.spec.ts: verify nobody-guessed scenario awards no points in competition mode

**Checkpoint**: Both game modes fully functional with score tracking in competition mode

---

## Phase 9: User Story 6 - Command Bar (Priority: P2)

**Goal**: VS Code-style Cmd+K command palette with searchable game commands

**Independent Test**: Open command bar, type "noll", verify "Nollställ poäng" filters and executes.

### Implementation for User Story 6

- [x] T043 [US6] Install cmdk package (pnpm add cmdk)
- [x] T044 [US6] Create CommandBar component in src/components/CommandBar.tsx using cmdk — styled dark overlay with search input, filtered command list, keyboard navigation
- [x] T045 [US6] Define command registry in src/hooks/useGameState.ts — commands: reset scores, correct scores, skip card, new game, add player
- [x] T046 [US6] Wire CommandBar into App.tsx with Cmd+K / Ctrl+K keyboard shortcut
- [x] T047 [US6] Implement "Korrigera poäng" flow — selecting player then adjusting score via nested cmdk group

### E2E Tests for User Story 6

- [x] T048 [US6] Write Playwright test in e2e/command-bar.spec.ts: Cmd+K opens bar, Escape closes it
- [x] T049 [US6] Write Playwright test in e2e/command-bar.spec.ts: type to filter commands, Enter executes
- [x] T050 [US6] Write Playwright test in e2e/command-bar.spec.ts: execute "Nollställ poäng" and verify all scores reset to 0

**Checkpoint**: Command bar fully functional with all game management commands

---

## Phase 10: User Story 7 - Buzzer Mechanics & Score Summary (Priority: P1)

**Goal**: Fair buzzer with lockout on wrong answer, reset per clue, score summary between rounds, flashier animations with accent colors

**Independent Test**: Player buzzes wrong → locked out, another buzzes on next clue → correct. Score summary shown between cards.

### Implementation for User Story 7

- [ ] T051 [US7] Add lockout tracking to useMultiplayer hook — lockedOutPlayers set, wrongBuzz handler, reset on clue change
- [ ] T052 [US7] Add "Rätt"/"Fel" buttons to host view when someone buzzes (instead of auto-awarding)
- [ ] T053 [US7] Create ScoreSummary component in src/components/ScoreSummary.tsx — ranked players with round delta, animated
- [ ] T054 [US7] Wire score summary between card rounds in App.tsx — show after reveal+award, before next card
- [ ] T055 [US7] Sync buzz reset on clue advance from host to players via trystero
- [ ] T056 [US7] Update BuzzerView to show lockout state and disable buzz for locked-out players
- [ ] T057 [US7] Add flashier animations and accent colors — pulse on buzz, glow effects, gradient accents, confetti on correct

### E2E Tests for User Story 7

- [ ] T058 [US7] Write Playwright test in e2e/buzzer-mechanics.spec.ts: wrong buzz locks out player, others can still buzz
- [ ] T059 [US7] Write Playwright test in e2e/buzzer-mechanics.spec.ts: buzz resets on next clue
- [ ] T060 [US7] Write Playwright test in e2e/buzzer-mechanics.spec.ts: score summary appears between rounds

**Checkpoint**: Buzzer is fair with risk, score summary flows between rounds, flashy animations

---

## Phase 11: User Story 8 - Host as Participant (Priority: P1)

**Goal**: Host enters their name and plays like everyone else. No separate host device — reader role rotates, reader controls the game from their phone.

**Independent Test**: 3-player game. Round 1: Alice reads (card+answer+controls), Bob and Charlie buzz. Round 2: Bob reads, Alice and Charlie buzz. Verify host device shows buzzer when not reading.

### Implementation for User Story 8

- [ ] T061 [US8] Add host name input to MultiplayerLobby hosting screen
- [ ] T062 [US8] Include host as a player in the game state (add host to peers/players list)
- [ ] T063 [US8] Refactor orchestrator: host device shows BuzzerView or ReaderView based on rotation (not always CardView)
- [ ] T064 [US8] Move game control (next clue, Rätt/Fel, skip) to ReaderView — reader controls the game via trystero messages to host
- [ ] T065 [US8] Add "reader-action" message type in useMultiplayer: reader sends nextClue/correct/wrong/skip to host, host executes
- [ ] T066 [US8] Remove separate host CardView rendering — all players use same BuzzerView/ReaderView flow

### E2E Tests for User Story 8

- [ ] T067 [US8] Write Playwright test in e2e/host-as-player.spec.ts: 3 players connect, first player sees ReaderView, others see BuzzerView
- [ ] T068 [US8] Write Playwright test in e2e/host-as-player.spec.ts: after round completes, reader rotates to next player
- [ ] T069 [US8] Write Playwright test in e2e/host-as-player.spec.ts: host device shows BuzzerView when not their turn to read

**Checkpoint**: All players have identical experience, reader rotates, no separate host view

---

## Phase 12: User Story 9 - Hint Voting (Priority: P2)

**Goal**: Non-reader players can vote to advance to the next hint. When a majority votes, the reader is notified (or it auto-advances). This keeps the game flowing without one person controlling the pace.

**Independent Test**: 3 players, 2 non-readers vote for next hint → hint advances automatically.

### Implementation for User Story 9

- [ ] T070 [US9] Add "vote-next-hint" message type in useMultiplayer
- [ ] T071 [US9] Add vote button to BuzzerView — "Nästa ledtråd" with vote count indicator
- [ ] T072 [US9] Track votes in orchestrator — when majority of non-reader players vote, auto-advance to next clue
- [ ] T073 [US9] Reset votes when clue advances or card changes
- [ ] T074 [US9] Show vote count on reader's ReaderView so they can see demand

### E2E Tests for User Story 9

- [ ] T075 [US9] Write Playwright test in e2e/hint-voting.spec.ts: player votes for next hint, vote count updates
- [ ] T076 [US9] Write Playwright test in e2e/hint-voting.spec.ts: majority vote auto-advances the clue

**Checkpoint**: Game pace is collaborative, not just reader-controlled

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T002 (types) from Setup — BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Phase 2 (useGameSession hook)
  - US1 and US2 can proceed in parallel after Phase 2
  - US3 depends on US1 (needs card play flow to test exhaustion)
  - US4 is fully independent (developer tool, no UI dependency)
- **US5 (Phase 8)**: Depends on US1 being complete (game loop must work before adding modes)
- **US6 (Phase 9)**: Depends on US5 (command bar needs game state/players to act on)
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
7. Add US5 + e2e tests → Game modes with competition scoring
8. Add US6 + e2e tests → Command bar for game management
9. Add US7 + e2e tests → Buzzer mechanics, score summary, flashy animations

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable after Phase 2
- E2e tests validate each story's acceptance scenarios from spec.md
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
- Run all e2e tests: `pnpm exec playwright test`
