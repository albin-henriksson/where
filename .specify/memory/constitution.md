<!--
Sync Impact Report
- Version change: 0.0.0 → 1.0.0
- Added principles: Simplicity First, Mobile-First UI, Data-Driven Content, Playability
- Added sections: Technology Stack, Development Workflow
- Templates requiring updates: ⚠ pending (no features created yet)
- Follow-up TODOs: none
-->

# Where Constitution

## Core Principles

### I. Simplicity First
Every feature MUST start with the simplest viable implementation.
No premature abstractions, no over-engineering. A card game needs
cards, questions, and scoring — not a framework. YAGNI applies
strictly. Dependencies MUST be justified.

### II. Mobile-First UI
The game is designed to be played on phones passed around a table.
All UI MUST be touch-friendly, responsive, and legible on small
screens. Visual design MUST be clean and minimal — the content is
the experience, not chrome.

### III. Data-Driven Content
Game content (cities, questions, hints) MUST be separated from
application logic and stored as structured data (JSON/TS).
Adding a new city card MUST NOT require code changes beyond
adding a data entry.

### IV. Playability
The game MUST feel smooth in a real-life setting. Card selection
MUST be random from unseen cards. Hiding/skipping cards MUST be
fast (keyboard shortcut or subtle UI tap). Scoring MUST follow
the 5-4-3-2-1 point system faithfully.

## Technology Stack

- **Runtime**: Vite + React + TypeScript
- **Styling**: Tailwind CSS
- **State**: React state (no external state library unless justified)
- **Deployment**: Static site (no backend required)
- **Data**: Local JSON/TS files for city/question content

## Development Workflow

- Conventional Commits for all commit messages
- `pnpm` as package manager
- Lint and type-check MUST pass before commits
- Features developed incrementally; working game at every commit

## Governance

This constitution defines the guiding principles for the Where
project. Amendments require updating this file with a version bump
and documenting the change in the sync impact report comment above.

All implementation decisions MUST align with these principles.
When principles conflict, Playability and Simplicity take precedence.

**Version**: 1.0.0 | **Ratified**: 2026-03-28 | **Last Amended**: 2026-03-28
