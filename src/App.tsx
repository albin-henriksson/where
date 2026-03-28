import { useEffect } from "react";
import { useGameSession } from "./hooks/useGameSession";
import { CardView } from "./components/CardView";
import { EmptyDeck } from "./components/EmptyDeck";
import { SkipButton } from "./components/SkipButton";

function App() {
  const {
    currentCard,
    clueIndex,
    revealed,
    earnedPoints,
    cardsRemaining,
    nextClue,
    correct,
    skip,
    nextCard,
  } = useGameSession();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        skip();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [skip]);

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-surface relative px-6">
      <h1 className="absolute top-6 left-0 right-0 text-center text-xs font-semibold tracking-[0.3em] text-muted/50 uppercase">
        Var är vi?
      </h1>

      {currentCard && (
        <p className="absolute bottom-6 text-xs text-muted/30 tabular-nums">
          {cardsRemaining} kort kvar
        </p>
      )}

      {currentCard ? (
        <>
          <SkipButton onClick={skip} />
          <CardView
            card={currentCard}
            clueIndex={clueIndex}
            revealed={revealed}
            earnedPoints={earnedPoints}
            onNextClue={nextClue}
            onCorrect={correct}
            onNextCard={nextCard}
          />
        </>
      ) : (
        <EmptyDeck />
      )}
    </div>
  );
}

export default App;
