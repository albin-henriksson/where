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
    <div className="min-h-svh flex flex-col items-center justify-center bg-gray-50 relative">
      <h1 className="absolute top-6 left-0 right-0 text-center text-sm font-medium tracking-widest text-gray-300 uppercase">
        Var är vi?
      </h1>

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
