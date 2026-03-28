# Feature Specification: City Quiz Card Game

**Feature Branch**: `001-city-quiz-game`
**Created**: 2026-03-28
**Status**: Draft
**Input**: User description: "A game similar to 'Var är vi' — a real-life card game where each card shows a city with 5 progressive clues. Players guess the city; correct on clue 1 = 5 points, clue 2 = 4 points, etc. Clean card-style UI. Cards can be hidden/skipped via keyboard shortcuts or a semi-hidden button. Random selection from unseen cards per session. Also includes a Claude Code skill for researching and creating new city cards stored in structured format."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Play a Quiz Round (Priority: P1)

A group of friends opens the app on a phone. A random city card appears showing only the first clue. One player reads the clue aloud. If someone guesses the city correctly, the reader taps "Correct" and 5 points are noted. If nobody guesses, the reader taps "Next Clue" to reveal clue 2 (now worth 4 points). This continues through all 5 clues. After the last clue (or a correct guess), the city name is revealed and the card is marked as seen. A new random card from unseen cards is drawn.

**Why this priority**: This is the core game loop — without it there is no game.

**Independent Test**: Can be fully tested with a small set of hardcoded cards and delivers the complete gameplay experience.

**Acceptance Scenarios**:

1. **Given** the app is opened for the first time in a session, **When** the game starts, **Then** a random city card is selected from all available cards and only the first clue is displayed.
2. **Given** clue N is displayed (N < 5), **When** the player taps "Next Clue", **Then** clue N+1 is revealed and the potential score decreases by 1.
3. **Given** any clue is displayed, **When** the player taps "Correct", **Then** the city name is revealed with the earned points (6 - clue number) and the card is marked as seen.
4. **Given** clue 5 is displayed, **When** the player taps "Next Clue", **Then** the city name is revealed with 0 points (nobody guessed it) and the card is marked as seen.
5. **Given** a card has been completed, **When** the player proceeds to the next card, **Then** only unseen cards from this session are eligible for random selection.

---

### User Story 2 - Hide/Skip a Card (Priority: P1)

The reader sees a card and recognizes the city immediately (or it's a city they don't want to play). They press a keyboard shortcut or tap a subtle button to skip/hide the card. The card is removed from the current session's pool and a new random card is drawn.

**Why this priority**: Essential for smooth real-life gameplay — avoids awkward pauses when a card is too easy or unwanted.

**Independent Test**: Can be tested by skipping a card and verifying it doesn't appear again.

**Acceptance Scenarios**:

1. **Given** a card is displayed, **When** the player presses the skip keyboard shortcut (e.g., Escape or S), **Then** the card is hidden and a new random card is drawn from remaining unseen cards.
2. **Given** a card is displayed, **When** the player taps the semi-hidden skip button, **Then** the same hide behavior occurs.
3. **Given** a card has been hidden, **When** subsequent cards are drawn, **Then** the hidden card never appears again during this session.

---

### User Story 3 - Session Card Tracking (Priority: P2)

Throughout a game session, the app tracks which cards have been seen (played or hidden). When all cards in the pool are exhausted, the player is informed that there are no more cards available.

**Why this priority**: Prevents repetition and signals session end, but the core game works without explicit tracking UI.

**Independent Test**: Can be tested by playing through all available cards and verifying the end-of-deck message.

**Acceptance Scenarios**:

1. **Given** all cards have been seen or hidden, **When** the player tries to draw a new card, **Then** a message displays "Inga fler kort!" (No more cards).
2. **Given** a session is in progress, **When** the player refreshes the browser, **Then** the session resets and all cards become available again.

---

### User Story 4 - Create New City Cards via Claude Skill (Priority: P2)

A developer uses a Claude Code slash command to generate new city cards. The skill researches the given city, finds semi-known fun facts, and produces 5 clues ordered from vague/hard to obvious/easy. The card is written to the project's structured data file.

**Why this priority**: Content creation is essential for the game's longevity but is a developer tool, not a player-facing feature.

**Independent Test**: Can be tested by running the slash command for a city and verifying the output matches the card data structure with 5 progressively easier clues.

**Acceptance Scenarios**:

1. **Given** a developer runs the card creation skill with a city name, **When** the skill completes, **Then** a new card entry is added to the cards data file with id, city, country, and 5 clues.
2. **Given** the skill generates clues, **When** reviewing the clues in order, **Then** clue 1 is the most obscure/vague and clue 5 makes the city nearly unmistakable.
3. **Given** a card for the specified city already exists, **When** the skill is run, **Then** the developer is warned about the duplicate before proceeding.

---

### Edge Cases

- What happens when there is only 1 card left and it gets hidden? → Show "No more cards" message.
- What happens if the card data file is empty? → Show a friendly message that no cards are available.
- What happens if the user rapidly taps "Next Clue"? → Each tap reveals exactly one additional clue; no double-reveals.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display one city card at a time with progressive clue reveal (clue 1 first, then 2, etc.).
- **FR-002**: System MUST calculate points as (6 - current clue number) when "Correct" is tapped, awarding 5 for clue 1 down to 1 for clue 5.
- **FR-003**: System MUST randomly select the next card from cards not yet seen or hidden in the current session.
- **FR-004**: System MUST allow hiding/skipping the current card via keyboard shortcut and a semi-hidden UI button.
- **FR-005**: System MUST reveal the city name and country when a round is completed (correct guess or all clues exhausted).
- **FR-006**: System MUST display a message when all cards have been exhausted in the session.
- **FR-007**: System MUST reset all card states when the browser session is refreshed.
- **FR-008**: The Claude Code skill MUST generate a new card with 5 clues ordered hardest-to-easiest for a given city.
- **FR-009**: The Claude Code skill MUST write the generated card to the project's structured data file in the correct format.
- **FR-010**: The Claude Code skill MUST warn if a card for the given city already exists.
- **FR-011**: Clues MUST be written in Swedish.
- **FR-012**: The project MUST include a Dockerfile that builds and serves the static site for easy deployment.
- **FR-013**: All user stories MUST be validated with Playwright end-to-end tests.

### Key Entities

- **CityCard**: Represents a single quiz card. Contains an id (slug), city name, country, and exactly 5 clues ordered from hardest to easiest.
- **Session State**: Tracks which cards have been seen or hidden during the current browser session. Not persisted across page refreshes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can complete a full card round (all 5 clues or correct guess) in under 60 seconds of interaction time.
- **SC-002**: Hiding a card and drawing a new one takes less than 1 second from the user's perspective.
- **SC-003**: The game is fully playable on a mobile phone screen without horizontal scrolling or unreadable text.
- **SC-004**: A new city card can be generated and added to the game using the Claude skill in under 2 minutes.
- **SC-005**: 100% of played sessions have no repeated cards (unless session is reset).

## Assumptions

- The game is played in person with one device shared/shown among players — no multiplayer networking needed.
- Score tracking is manual (players keep score themselves) — no in-app scoreboard for v1.
- The game UI language is Swedish.
- Cards are bundled with the app as static data — no backend or database needed.
- Deployment is via Docker container serving the static build (e.g., nginx).
- The Claude Code card creation skill is a developer tool, not accessible from the game UI.
- Session state lives in React component state — no localStorage persistence needed for v1.
