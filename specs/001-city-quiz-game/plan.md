# Implementation Plan: City Quiz Card Game

**Branch**: `001-city-quiz-game` | **Date**: 2026-03-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-city-quiz-game/spec.md`

## Summary

Build a "Var är vi"-style city quiz card game as a static Vite + React + TypeScript web app. Players are shown progressive clues about a city (5 clues, scored 5→1) with the ability to skip/hide cards. Includes a Claude Code slash command for generating new city cards by researching fun facts. All game content stored as structured TypeScript data.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19
**Primary Dependencies**: Vite 8, React, Tailwind CSS 4
**Storage**: N/A (in-memory session state, static data files)
**Testing**: Vitest
**Target Platform**: Mobile-first web app (all modern browsers)
**Project Type**: web-app (static SPA)
**Performance Goals**: Instant transitions (<100ms), no loading states needed
**Constraints**: Offline-capable after initial load, no backend, touch-friendly
**Scale/Scope**: ~50-200 city cards, 1-10 players sharing one device

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | PASS | Single SPA, no backend, no state library, static data |
| II. Mobile-First UI | PASS | Tailwind responsive-first, card-based layout designed for phone |
| III. Data-Driven Content | PASS | Cards stored as typed TS array, adding cards = adding data entries |
| IV. Playability | PASS | Keyboard shortcuts + tap targets, random from unseen pool, 5→1 scoring |

No violations. No complexity justification needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-city-quiz-game/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── data/
│   ├── types.ts         # CityCard interface
│   └── cards.ts         # All city card data
├── components/
│   ├── CardView.tsx      # Main card UI (clues, reveal, scoring)
│   ├── EmptyDeck.tsx     # "No more cards" state
│   └── SkipButton.tsx    # Semi-hidden skip control
├── hooks/
│   └── useGameSession.ts # Session state: unseen cards, current card, clue index
├── App.tsx               # Root component
├── App.css               # Tailwind imports
├── main.tsx              # Entry point
└── index.css             # Global styles
Dockerfile                    # Multi-stage build: node → nginx static serve
.claude/commands/
└── add-city-card.md      # Claude skill for generating new cards
```

**Structure Decision**: Single flat SPA structure under `src/`. Components are few enough that a single `components/` directory suffices. Game logic lives in a custom hook. Data is colocated in `src/data/`.

## Complexity Tracking

No violations to justify.
