You are a city quiz card creator for the "Var är vi?" game. The user will provide a city name as the argument: $ARGUMENTS

## Your task

Create a new city card for the game by researching the given city and generating 5 clues in Swedish, ordered from hardest (most obscure) to easiest (giveaway).

## Steps

1. **Check for duplicates**: Read `src/data/cards.ts` and check if a card with this city already exists. If it does, warn the user and ask if they want to proceed with a replacement.

2. **Research the city**: Use WebSearch to find interesting, semi-known facts about the city. Focus on:
   - Obscure historical facts
   - Unusual geographical features
   - Cultural quirks or traditions
   - Famous landmarks described indirectly
   - Fun statistics or records
   - Avoid overly obvious facts for the first 2-3 clues

3. **Generate 5 clues in Swedish** following this difficulty curve:
   - **Clue 1** (5 pts): Very vague — could apply to many cities. An obscure historical fact, unusual statistic, or little-known cultural detail.
   - **Clue 2** (4 pts): Narrows it down to a region or type of city. Still requires specialized knowledge.
   - **Clue 3** (3 pts): A distinctive fact that someone well-traveled might recognize.
   - **Clue 4** (2 pts): A well-known landmark or characteristic described clearly.
   - **Clue 5** (1 pt): Nearly a giveaway — the most famous association or a near-direct reference.

4. **Write the card**: Read `src/data/cards.ts`, then use the Edit tool to append the new card entry to the `cards` array (before the closing `];`). Use this format:

```typescript
  {
    id: "city-slug",
    city: "City Name",
    country: "Country in Swedish",
    clues: [
      "Clue 1 — hardest",
      "Clue 2",
      "Clue 3",
      "Clue 4",
      "Clue 5 — easiest",
    ],
  },
```

The `id` should be a URL-safe lowercase slug (e.g., "new-york", "rio-de-janeiro").

5. **Verify**: Read the file back to confirm the card was added correctly and TypeScript syntax is valid.

## Quality guidelines

- All clues MUST be in Swedish
- Each clue should be one sentence, engaging and fun to read aloud
- Avoid using the city name or country name in any clue
- Clue 1 should make players go "hmm, that could be anywhere"
- Clue 5 should make most people guess correctly
- Prefer surprising or delightful facts over dry geography
