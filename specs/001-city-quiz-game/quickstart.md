# Quickstart: City Quiz Card Game

## Prerequisites

- Node.js 18+
- pnpm

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

Opens at http://localhost:5173

## Adding New City Cards

### Via Claude Code skill

```
/add-city-card Stockholm
```

This researches the city and appends a new card to `src/data/cards.ts`.

### Manually

Edit `src/data/cards.ts` and add a new entry to the `cards` array:

```typescript
{
  id: "city-slug",
  city: "City Name",
  country: "Country in Swedish",
  clues: [
    "Hardest clue - very vague, could be many cities",
    "Hard clue - narrows it down to a region",
    "Medium clue - distinctive but not unique",
    "Easy clue - most people familiar with the city would guess",
    "Giveaway clue - almost states the answer directly",
  ],
}
```

## Build

```bash
pnpm build
```

Output in `dist/` — deploy as static site anywhere.
