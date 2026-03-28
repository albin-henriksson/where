# Data Model: City Quiz Card Game

**Date**: 2026-03-28

## Entities

### CityCard

Represents a single quiz card in the game deck.

| Field   | Type                                         | Description                                    |
|---------|----------------------------------------------|------------------------------------------------|
| id      | string                                       | URL-safe slug, e.g. "istanbul", "buenos-aires" |
| city    | string                                       | Display name, e.g. "Istanbul"                  |
| country | string                                       | Country name in Swedish, e.g. "Turkiet"        |
| clues   | [string, string, string, string, string]     | Exactly 5 clues, index 0 = hardest, 4 = easiest |

**Identity**: `id` field, must be unique across all cards.
**Validation**: Exactly 5 clues required. All string fields non-empty.

### SessionState (runtime only, not persisted)

Tracks game progress within a single browser session.

| Field        | Type       | Description                                      |
|--------------|------------|--------------------------------------------------|
| remainingIds | string[]   | Shuffled array of card IDs not yet seen/hidden    |
| currentCard  | CityCard ∣ null | The card currently being played              |
| clueIndex    | number     | Current clue being shown (0-4)                   |
| revealed     | boolean    | Whether the city answer has been revealed         |
| earnedPoints | number ∣ null | Points earned on current card (null if not yet scored) |

**Lifecycle**:
1. Session starts → all card IDs shuffled into `remainingIds`
2. Card drawn → popped from `remainingIds`, set as `currentCard`, `clueIndex = 0`
3. "Next Clue" → `clueIndex++` (max 4)
4. "Correct" → `revealed = true`, `earnedPoints = 5 - clueIndex`
5. All clues exhausted → `revealed = true`, `earnedPoints = 0`
6. "Next Card" → return to step 2
7. `remainingIds` empty → show empty deck message

## Relationships

```
CityCard (static data, N entries)
    │
    └── referenced by SessionState.currentCard (1 at a time)

SessionState.remainingIds ⊂ CityCard[].id (shrinks as cards are played/hidden)
```
