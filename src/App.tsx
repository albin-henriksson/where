import { useEffect, useState, useCallback, useRef } from "react";
import { useGameSession } from "./hooks/useGameSession";
import { useGameState } from "./hooks/useGameState";
import { useMultiplayer } from "./hooks/useMultiplayer";
import { StartScreen } from "./components/StartScreen";
import { MultiplayerLobby } from "./components/MultiplayerLobby";
import { BuzzerView } from "./components/BuzzerView";
import { CardView } from "./components/CardView";
import { Scoreboard } from "./components/Scoreboard";
import { ScoreSummary } from "./components/ScoreSummary";
import { CommandBar } from "./components/CommandBar";
import { EmptyDeck } from "./components/EmptyDeck";
import { SkipButton } from "./components/SkipButton";

function App() {
  const gameState = useGameState();
  const session = useGameSession();
  const mp = useMultiplayer();
  const [cmdBarOpen, setCmdBarOpen] = useState(false);
  const [mpScreen, setMpScreen] = useState<"lobby" | "playing" | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [lastRoundPoints, setLastRoundPoints] = useState(0);
  const [lastRoundWinner, setLastRoundWinner] = useState<string | null>(null);
  const prevClueIndex = useRef(session.clueIndex);

  const isCompetition = gameState.mode === "competition";
  const isMultiplayerHost = mp.role === "host" && mpScreen === "playing";
  const isMultiplayerPlayer = mp.role === "player";

  // Reset buzz when clue advances (host side)
  useEffect(() => {
    if (isMultiplayerHost && session.clueIndex !== prevClueIndex.current) {
      mp.resetBuzz();
      prevClueIndex.current = session.clueIndex;
    }
  }, [isMultiplayerHost, session.clueIndex, mp]);

  // Sync game state to multiplayer peers when host
  useEffect(() => {
    if (!isMultiplayerHost || !session.currentCard) return;

    mp.syncGameState({
      type: "game-sync",
      clueText: session.currentCard.clues[session.clueIndex],
      clueIndex: session.clueIndex,
      pointValue: 5 - session.clueIndex,
      revealed: session.revealed,
      cityName: session.revealed ? session.currentCard.city : undefined,
      country: session.revealed ? session.currentCard.country : undefined,
      earnedPoints: session.earnedPoints,
      buzzWinner: mp.buzzWinner,
      players: gameState.players,
    });
  }, [
    isMultiplayerHost,
    session.currentCard,
    session.clueIndex,
    session.revealed,
    session.earnedPoints,
    mp.buzzWinner,
    gameState.players,
  ]);

  const handleAwardPoints = useCallback(
    (playerId: string) => {
      if (session.earnedPoints && session.earnedPoints > 0) {
        gameState.awardPoints(playerId, session.earnedPoints);
        setLastRoundPoints(session.earnedPoints);
        const player = gameState.players.find((p) => p.id === playerId);
        setLastRoundWinner(player?.name ?? null);
      }
      mp.resetBuzzFull();
      if (isCompetition) {
        setShowSummary(true);
      } else {
        session.nextCard();
      }
    },
    [session, gameState, mp, isCompetition],
  );

  const handleNextCardFromSummary = useCallback(() => {
    setShowSummary(false);
    setLastRoundPoints(0);
    setLastRoundWinner(null);
    session.nextCard();
  }, [session]);

  const handleNoOneGuessed = useCallback(() => {
    setLastRoundPoints(0);
    setLastRoundWinner(null);
    mp.resetBuzzFull();
    if (isCompetition) {
      setShowSummary(true);
    } else {
      session.nextCard();
    }
  }, [session, mp, isCompetition]);

  // Host: correct buzz
  const handleBuzzCorrect = useCallback(() => {
    if (!mp.buzzWinner) return;
    const player = gameState.players.find((p) => p.name === mp.buzzWinner);
    if (player) {
      session.correct();
      // Slight delay to let earnedPoints update, then award
      setTimeout(() => {
        const points = 5 - session.clueIndex;
        gameState.awardPoints(player.id, points);
        setLastRoundPoints(points);
        setLastRoundWinner(player.name);
        mp.resetBuzzFull();
        setShowSummary(true);
      }, 50);
    }
  }, [mp.buzzWinner, gameState, session, mp]);

  // Host: wrong buzz
  const handleBuzzWrong = useCallback(() => {
    mp.wrongBuzz();
  }, [mp]);

  const handleMultiplayerStart = useCallback(() => {
    const playerNames = mp.peers.map((p) => p.name);
    gameState.startGame("competition", playerNames);
    setMpScreen("playing");
  }, [mp.peers, gameState]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdBarOpen((prev) => !prev);
      }
      if (e.key === "Escape" && !cmdBarOpen && gameState.screen === "playing" && !isMultiplayerPlayer) {
        session.skip();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [session, cmdBarOpen, gameState.screen, isMultiplayerPlayer]);

  // Multiplayer player view (buzzer)
  if (isMultiplayerPlayer && mp.gameSync) {
    return (
      <BuzzerView
        clueText={mp.gameSync.clueText}
        clueIndex={mp.gameSync.clueIndex}
        pointValue={mp.gameSync.pointValue}
        revealed={mp.gameSync.revealed}
        cityName={mp.gameSync.cityName}
        country={mp.gameSync.country}
        earnedPoints={mp.gameSync.earnedPoints}
        buzzWinner={mp.buzzWinner}
        hasBuzzed={mp.hasBuzzed}
        isLockedOut={mp.isLockedOut}
        playerName={playerName}
        players={mp.gameSync.players}
        onBuzz={mp.buzz}
      />
    );
  }

  // Multiplayer player waiting
  if (isMultiplayerPlayer && !mp.gameSync) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-surface animate-fade-in">
        <p className="text-text-dim text-lg">Väntar på att spelet ska börja...</p>
        <p className="text-muted text-sm mt-2">Ansluten till rum {mp.roomCode}</p>
      </div>
    );
  }

  // Multiplayer lobby
  if (mpScreen === "lobby") {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-surface">
        <MultiplayerLobby
          mode={mp.role}
          roomCode={mp.roomCode}
          connected={mp.connected}
          peers={mp.peers}
          onHost={mp.hostGame}
          onJoin={(code, name) => {
            setPlayerName(name);
            mp.joinGame(code, name);
          }}
          onStart={handleMultiplayerStart}
          onBack={() => {
            mp.cleanup();
            setMpScreen(null);
          }}
        />
      </div>
    );
  }

  // Start screen
  if (gameState.screen === "start" && !mpScreen) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-surface">
        <StartScreen
          onStart={gameState.startGame}
          onMultiplayer={() => setMpScreen("lobby")}
        />
      </div>
    );
  }

  // Score summary between rounds
  if (showSummary && isCompetition) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-surface relative px-6">
        <ScoreSummary
          players={gameState.players}
          lastRoundPoints={lastRoundPoints}
          lastRoundWinner={lastRoundWinner}
          onNextCard={handleNextCardFromSummary}
        />
      </div>
    );
  }

  // Main game (host or local)
  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-surface relative px-6">
      {/* Header */}
      <div className="absolute top-5 left-0 right-0 flex flex-col items-center gap-1">
        <h1 className="text-[10px] font-medium tracking-[0.3em] text-muted/40 uppercase">
          Where
        </h1>
        {isCompetition && gameState.players.length > 0 && (
          <Scoreboard players={gameState.players} />
        )}
      </div>

      {/* Buzz notification for host with Rätt/Fel */}
      {isMultiplayerHost && mp.buzzWinner && !session.revealed && (
        <div className="absolute top-24 left-0 right-0 flex flex-col items-center gap-3 animate-score-pop z-10">
          <p className="text-white font-bold text-lg">{mp.buzzWinner} buzzade!</p>
          <div className="flex gap-3">
            <button
              data-testid="buzz-correct"
              onClick={handleBuzzCorrect}
              className="px-8 py-3 bg-emerald-500 text-white rounded-2xl text-base font-semibold active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
            >
              Rätt ✓
            </button>
            <button
              data-testid="buzz-wrong"
              onClick={handleBuzzWrong}
              className="px-8 py-3 bg-red-500/80 text-white rounded-2xl text-base font-semibold active:scale-95 transition-all"
            >
              Fel ✗
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      {session.currentCard && (
        <p className="absolute bottom-5 text-[10px] text-muted/30 tabular-nums tracking-wider">
          {session.cardsRemaining} kort kvar
        </p>
      )}

      {/* Main content */}
      {session.currentCard ? (
        <>
          <SkipButton onClick={() => { mp.resetBuzzFull(); session.skip(); }} />
          <CardView
            card={session.currentCard}
            clueIndex={session.clueIndex}
            revealed={session.revealed}
            earnedPoints={session.earnedPoints}
            players={isCompetition ? gameState.players : undefined}
            showAnswer={isCompetition || isMultiplayerHost}
            onNextClue={session.nextClue}
            onCorrect={session.correct}
            onNextCard={isCompetition ? handleNoOneGuessed : () => { mp.resetBuzzFull(); session.nextCard(); }}
            onAwardPoints={handleAwardPoints}
          />
        </>
      ) : (
        <EmptyDeck />
      )}

      {/* Command Bar */}
      <CommandBar
        open={cmdBarOpen}
        onClose={() => setCmdBarOpen(false)}
        players={gameState.players}
        isCompetition={isCompetition}
        onResetScores={gameState.resetScores}
        onAdjustScore={gameState.adjustScore}
        onAddPlayer={gameState.addPlayer}
        onSkipCard={() => {
          mp.resetBuzzFull();
          session.skip();
          setCmdBarOpen(false);
        }}
        onNewGame={() => {
          mp.cleanup();
          setMpScreen(null);
          gameState.resetGame();
          setCmdBarOpen(false);
        }}
      />
    </div>
  );
}

export default App;
