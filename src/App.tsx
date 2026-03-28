import { useEffect, useState, useCallback } from "react";
import { useGameSession } from "./hooks/useGameSession";
import { useGameState } from "./hooks/useGameState";
import { StartScreen } from "./components/StartScreen";
import { CardView } from "./components/CardView";
import { Scoreboard } from "./components/Scoreboard";
import { CommandBar } from "./components/CommandBar";
import { EmptyDeck } from "./components/EmptyDeck";
import { SkipButton } from "./components/SkipButton";

function App() {
  const gameState = useGameState();
  const session = useGameSession();
  const [cmdBarOpen, setCmdBarOpen] = useState(false);

  const isCompetition = gameState.mode === "competition";

  const handleAwardPoints = useCallback(
    (playerId: string) => {
      if (session.earnedPoints && session.earnedPoints > 0) {
        gameState.awardPoints(playerId, session.earnedPoints);
      }
      session.nextCard();
    },
    [session, gameState],
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdBarOpen((prev) => !prev);
      }
      if (e.key === "Escape" && !cmdBarOpen && gameState.screen === "playing") {
        session.skip();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [session, cmdBarOpen, gameState.screen]);

  if (gameState.screen === "start") {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-surface">
        <StartScreen onStart={gameState.startGame} />
      </div>
    );
  }

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

      {/* Footer */}
      {session.currentCard && (
        <p className="absolute bottom-5 text-[10px] text-muted/30 tabular-nums tracking-wider">
          {session.cardsRemaining} kort kvar
        </p>
      )}

      {/* Main content */}
      {session.currentCard ? (
        <>
          <SkipButton onClick={session.skip} />
          <CardView
            card={session.currentCard}
            clueIndex={session.clueIndex}
            revealed={session.revealed}
            earnedPoints={session.earnedPoints}
            players={isCompetition ? gameState.players : undefined}
            onNextClue={session.nextClue}
            onCorrect={session.correct}
            onNextCard={session.nextCard}
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
          session.skip();
          setCmdBarOpen(false);
        }}
        onNewGame={() => {
          gameState.resetGame();
          setCmdBarOpen(false);
        }}
      />
    </div>
  );
}

export default App;
