# Research: City Quiz Card Game

**Date**: 2026-03-28

## Decisions

### Card Data Format

**Decision**: TypeScript array of typed objects in `src/data/cards.ts`
**Rationale**: Type safety at compile time, no runtime parsing needed, co-located with app code, IDE autocomplete for card authors.
**Alternatives considered**:
- JSON files: No type safety, requires import assertion or fetch
- YAML: Requires parser dependency, no type safety
- Database/CMS: Overkill for static content, adds backend dependency

### State Management

**Decision**: React `useState` + custom hook (`useGameSession`)
**Rationale**: Game state is simple (current card, seen set, clue index). No cross-component state sharing beyond prop drilling from App. Adding a state library would violate Simplicity First.
**Alternatives considered**:
- Zustand: Clean API but unnecessary for this scope
- Context + Reducer: More boilerplate than useState for simple state
- localStorage persistence: Deferred — session reset on refresh is acceptable per spec

### Card Randomization

**Decision**: Fisher-Yates shuffle of unseen card IDs at session start, pop from shuffled array
**Rationale**: True random without replacement. Simple, well-understood algorithm. Avoids repeated random picks that could cluster.
**Alternatives considered**:
- Random index pick each time: Could feel non-random with small decks
- Pre-seeded PRNG: Unnecessary complexity for a party game

### Styling Approach

**Decision**: Tailwind CSS 4 utility classes, no component library
**Rationale**: Fast to iterate, mobile-first responsive design built-in, minimal bundle size, no UI library overhead.
**Alternatives considered**:
- Radix UI + Tailwind: Good for complex forms/modals but overkill for a card display app
- CSS Modules: More files to manage, less rapid iteration

### Claude Skill for Card Creation

**Decision**: Custom slash command in `.claude/commands/add-city-card.md` that uses WebSearch to research cities and writes to `src/data/cards.ts`
**Rationale**: Leverages Claude Code's built-in tools (WebSearch, Read, Edit) for research and file writing. No external tooling needed.
**Alternatives considered**:
- Standalone script: Would need API key management, separate runtime
- MCP server: Overkill for a file-append operation

## No Unresolved Items

All technical decisions resolved. No NEEDS CLARIFICATION remaining.
