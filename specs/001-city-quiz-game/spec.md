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

### User Story 5 - Game Modes: Freeplay & Competition (Priority: P1)

When opening the app, the player sees a start screen to choose game mode. "Frilek" (freeplay) works like the current game — no score tracking, just cards. "Tävling" (competition) asks players to enter their names, then tracks scores per player throughout the session. After each correct guess in competition mode, the reader taps the name of the player who guessed correctly to award them the points. A scoreboard is visible showing all players and their scores, sorted by points.

**Why this priority**: Transforms the app from a solo card viewer into a proper multiplayer party game.

**Independent Test**: Start a competition game with 3 players, play 2 rounds awarding points to different players, verify scoreboard reflects correct totals.

**Acceptance Scenarios**:

1. **Given** the app is opened, **When** the start screen loads, **Then** two game mode options are displayed: "Frilek" and "Tävling".
2. **Given** "Tävling" is selected, **When** the player setup screen appears, **Then** the user can add player names (minimum 2) and start the game.
3. **Given** a competition game is in progress and a correct guess is made, **When** the city is revealed, **Then** buttons with each player's name appear to assign the points.
4. **Given** points are assigned to a player, **When** the scoreboard updates, **Then** that player's total increases by the earned points.
5. **Given** a competition game is in progress, **When** viewing the game, **Then** a compact scoreboard is visible showing all players sorted by score.
6. **Given** "Frilek" is selected, **When** the game starts, **Then** no player setup or scoreboard is shown — the game works as before.

---

### User Story 6 - Command Bar (Priority: P2)

At any time during gameplay, the player can press `Cmd+K` (or `Ctrl+K`) to open a VS Code-style command bar. The bar shows searchable commands like "Nollställ poäng" (reset scores), "Korrigera poäng" (correct points), "Hoppa över kort" (skip card), "Ny omgång" (new game), and "Lägg till spelare" (add player). Typing filters the list, pressing Enter executes the highlighted command. Pressing Escape closes the bar.

**Why this priority**: Power-user feature for smooth game management without cluttering the main UI.

**Independent Test**: Open command bar, type "noll", verify "Nollställ poäng" is filtered and can be executed.

**Acceptance Scenarios**:

1. **Given** any game screen is displayed, **When** the player presses `Cmd+K` or `Ctrl+K`, **Then** a command bar overlay appears with a text input and list of available commands.
2. **Given** the command bar is open, **When** the player types text, **Then** the command list filters to show only matching commands.
3. **Given** a command is highlighted, **When** the player presses Enter, **Then** the command executes and the bar closes.
4. **Given** the command bar is open, **When** the player presses Escape, **Then** the bar closes without executing anything.
5. **Given** a competition game with scores, **When** "Nollställ poäng" is executed, **Then** all player scores reset to 0.
6. **Given** a competition game, **When** "Korrigera poäng" is executed for a player, **Then** a small input allows adjusting that player's score up or down.

---

### User Story 7 - Buzzer Mechanics & Score Summary (Priority: P1)

In multiplayer mode, buzzing must be fair and carry risk. When a player buzzes in, the host sees who buzzed and can mark them "Rätt" (correct) or "Fel" (wrong). If wrong, that player is locked out from buzzing again on the current card — but other players can still buzz. Buzz state resets when the host advances to the next clue (not just next card), giving players fresh chances each clue. After each card is completed (reveal + point assignment), a score summary screen is shown before the next card, displaying all players ranked by score with the round's point change highlighted.

**Why this priority**: Core to making multiplayer feel like a real quiz show with tension and strategy.

**Independent Test**: Start multiplayer, player buzzes wrong on clue 1 → locked out, another player buzzes on clue 2 → correct. Score summary appears between cards.

**Acceptance Scenarios**:

1. **Given** a player buzzes in multiplayer, **When** the host taps "Fel" (wrong), **Then** that player is locked out from buzzing on the current card and other players can still buzz.
2. **Given** a player is locked out, **When** the host advances to the next clue, **Then** all buzz states reset and all players (including locked-out ones) can buzz again.
3. **Given** a card round is completed, **When** points are assigned (or nobody guessed), **Then** a score summary screen appears showing all players ranked by score.
4. **Given** the score summary is displayed, **When** the host taps "Nästa kort", **Then** the next card is drawn.
5. **Given** multiplayer mode, **When** nobody buzzes on a clue, **Then** the host can still advance to the next clue or reveal the answer normally.

---

### User Story 8 - Host as Participant (Priority: P1)

In multiplayer mode, the person who creates the room is also a participant — not a passive game master. When creating a game, the host enters their name. All players (including the host) see the same UI: either BuzzerView or ReaderView depending on whose turn it is to read. The reader role rotates each card. The current reader sees the card with the answer and controls clue advancement + Rätt/Fel. Everyone else sees the buzzer. There is no separate "host device" view — the host's device behaves identically to any other player's device.

**Why this priority**: Without this, the host can't play — they're stuck being the game master. Everyone should be able to participate.

**Independent Test**: Create a 3-player multiplayer game. Round 1: Player A reads (sees card + answer + Rätt/Fel), Players B and C see buzzers. Round 2: Player B reads, Players A and C see buzzers. Verify the host's device shows the buzzer when it's not their turn.

**Acceptance Scenarios**:

1. **Given** a player creates a multiplayer game, **When** the lobby screen appears, **Then** they MUST enter their own name before starting.
2. **Given** the game starts with 3 players (including host), **When** round 1 begins, **Then** one player sees the ReaderView with card + answer + Rätt/Fel controls, and the other two see BuzzerView.
3. **Given** a round is completed, **When** the next card is drawn, **Then** the reader role rotates to the next player.
4. **Given** the host is not the current reader, **When** they view the game, **Then** they see the same BuzzerView as any other non-reader player.
5. **Given** the current reader's device, **When** someone buzzes, **Then** the reader sees Rätt/Fel buttons to judge the answer.
6. **Given** all players have been reader once, **When** the next rotation happens, **Then** it wraps back to the first player.

---

### User Story 9 - Hint Voting (Priority: P2)

In multiplayer mode, non-reader players can vote to advance to the next hint by tapping a "Nästa ledtråd" button on their buzzer screen. A vote counter shows how many have voted. When a majority of non-reader players vote, the clue auto-advances. Votes reset when the clue changes or a new card is drawn. The reader can see the vote count on their screen.

**Why this priority**: Keeps the game pace collaborative — prevents one reader from dragging or rushing.

**Independent Test**: 3-player game, 2 non-readers vote → clue auto-advances.

**Acceptance Scenarios**:

1. **Given** a non-reader player, **When** they tap "Nästa ledtråd", **Then** their vote is counted and the vote count updates on all screens.
2. **Given** a majority of non-readers have voted, **When** the threshold is reached, **Then** the clue auto-advances to the next hint.
3. **Given** votes have been cast, **When** the clue advances (by vote or reader), **Then** all votes reset to 0.
4. **Given** the reader's view, **When** players vote, **Then** the reader sees the current vote count.

---

### Edge Cases

- What happens when there is only 1 card left and it gets hidden? → Show "No more cards" message.
- What happens if the card data file is empty? → Show a friendly message that no cards are available.
- What happens if the user rapidly taps "Next Clue"? → Each tap reveals exactly one additional clue; no double-reveals.
- What happens if nobody guesses correctly in competition mode? → No points awarded, proceed to next card.
- What happens if a player is added mid-game via command bar? → They start with 0 points.
- What happens if command bar is opened during the reveal phase? → Commands still work normally.
- What if only 1 player name is entered in competition mode? → Require minimum 2 players to start.
- What if all players are locked out on a card? → Host can still advance clues or reveal answer; no buzzes possible.
- What if a player disconnects during a round? → Their lockout state is irrelevant; they simply can't buzz.

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
- **FR-014**: System MUST offer a start screen with "Frilek" (freeplay) and "Tävling" (competition) game modes.
- **FR-015**: In competition mode, system MUST allow adding player names (minimum 2) before starting.
- **FR-016**: In competition mode, system MUST display player name buttons on reveal to assign points to the correct guesser.
- **FR-017**: In competition mode, system MUST display a scoreboard sorted by points throughout the game.
- **FR-018**: System MUST provide a command bar (Cmd+K / Ctrl+K) with searchable game commands.
- **FR-019**: Command bar MUST support: reset scores, correct scores, skip card, new game, add player.
- **FR-020**: Command bar MUST filter commands as the user types and execute on Enter.
- **FR-021**: In multiplayer, buzz state MUST reset when the host advances to a new clue.
- **FR-022**: In multiplayer, a wrong buzz MUST lock the player out from buzzing again on the current card only.
- **FR-023**: Host MUST be able to mark a buzz as "Rätt" (correct) or "Fel" (wrong).
- **FR-024**: A score summary screen MUST appear between cards showing ranked players with round point changes.
- **FR-025**: In multiplayer, the host MUST enter their own name and participate as a regular player.
- **FR-026**: In multiplayer, all players (including host) MUST see BuzzerView when not reading and ReaderView when reading.
- **FR-027**: The current reader MUST control clue advancement and Rätt/Fel from their device.
- **FR-028**: The reader role MUST rotate to the next player after each card.
- **FR-029**: Non-reader players MUST be able to vote to advance to the next hint.
- **FR-030**: When a majority of non-readers vote, the clue MUST auto-advance.

### Key Entities

- **CityCard**: Represents a single quiz card. Contains an id (slug), city name, country, and exactly 5 clues ordered from hardest to easiest.
- **Session State**: Tracks which cards have been seen or hidden during the current browser session. Not persisted across page refreshes.
- **Player**: A named participant in competition mode. Has a name and cumulative score.
- **Game Mode**: Either "freeplay" (no scoring) or "competition" (player tracking + scoreboard).
- **Command**: A named action available in the command bar, with a label, optional keyboard shortcut, and execute function.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can complete a full card round (all 5 clues or correct guess) in under 60 seconds of interaction time.
- **SC-002**: Hiding a card and drawing a new one takes less than 1 second from the user's perspective.
- **SC-003**: The game is fully playable on a mobile phone screen without horizontal scrolling or unreadable text.
- **SC-004**: A new city card can be generated and added to the game using the Claude skill in under 2 minutes.
- **SC-005**: 100% of played sessions have no repeated cards (unless session is reset).

## Assumptions

- The game is played in person with one device shared/shown among players — no multiplayer networking needed.
- Score tracking is in-app in competition mode; freeplay has no scoring.
- The game UI language is Swedish.
- Cards are bundled with the app as static data — no backend or database needed.
- Deployment is via Docker container serving the static build (e.g., nginx).
- The Claude Code card creation skill is a developer tool, not accessible from the game UI.
- Session state lives in React component state — no localStorage persistence needed for v1.
