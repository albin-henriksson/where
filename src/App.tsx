import { useGameOrchestrator } from "./hooks/useGameOrchestrator";
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
  const o = useGameOrchestrator();

  if (o.screen === "mp-buzzer" && o.gameSync) {
    return (
      <BuzzerView
        clueText={o.gameSync.clueText}
        clueIndex={o.gameSync.clueIndex}
        pointValue={o.gameSync.pointValue}
        revealed={o.gameSync.revealed}
        cityName={o.gameSync.cityName}
        country={o.gameSync.country}
        earnedPoints={o.gameSync.earnedPoints}
        buzzWinner={o.buzzWinner}
        hasBuzzed={o.hasBuzzed}
        isLockedOut={o.isLockedOut}
        playerName={o.playerName}
        players={o.gameSync.players}
        imageUrl={o.gameSync.imageUrl}
        onBuzz={o.buzz}
      />
    );
  }

  if (o.screen === "mp-waiting") {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-surface animate-fade-in">
        <p className="text-text-dim text-lg">Väntar på att spelet ska börja...</p>
        <p className="text-muted text-sm mt-2">Ansluten till rum {o.roomCode}</p>
      </div>
    );
  }

  if (o.screen === "mp-lobby") {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-surface">
        <MultiplayerLobby
          mode={o.mpRole}
          roomCode={o.roomCode}
          connected={o.mpConnected}
          peers={o.mpPeers}
          initialRoomCode={o.initialRoomCode}
          onHost={o.hostGame}
          onJoin={o.joinGame}
          onStart={o.startMultiplayer}
          onBack={o.backToStart}
        />
      </div>
    );
  }

  if (o.screen === "start") {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-surface">
        <StartScreen
          onStart={(mode, names) =>
            mode === "freeplay" ? o.startFreeplay() : o.startCompetition(names ?? [])
          }
          onMultiplayer={o.openMultiplayer}
        />
      </div>
    );
  }

  if (o.screen === "summary") {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-surface relative px-6">
        <ScoreSummary
          players={o.players}
          lastRoundPoints={o.lastRound.points}
          lastRoundWinner={o.lastRound.winnerName}
          onNextCard={o.nextCardFromSummary}
        />
      </div>
    );
  }

  // Main game view
  const isMultiplayerHost = o.mpRole === "host" && o.screen === "playing";

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-surface relative px-6">
      {/* Header */}
      <div className="absolute top-5 left-0 right-0 flex flex-col items-center gap-1">
        <h1 className="text-[10px] font-medium tracking-[0.3em] text-muted/40 uppercase">
          Where
        </h1>
        {o.isCompetition && o.players.length > 0 && (
          <Scoreboard players={o.players} />
        )}
        {isMultiplayerHost && o.currentReader && (
          <p className="text-[10px] text-muted/40 mt-1">
            Läsare: <span className="text-text-dim">{o.currentReader}</span>
          </p>
        )}
      </div>

      {/* Buzz notification with Rätt/Fel */}
      {isMultiplayerHost && o.buzzWinner && !o.revealed && (
        <div className="absolute top-28 left-0 right-0 flex flex-col items-center gap-3 animate-score-pop z-10">
          <p className="text-white font-bold text-lg">{o.buzzWinner} buzzade!</p>
          <div className="flex gap-3">
            <button
              data-testid="buzz-correct"
              onClick={o.buzzCorrect}
              className="px-8 py-3 bg-emerald-500 text-white rounded-2xl text-base font-semibold active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
            >
              Rätt ✓
            </button>
            <button
              data-testid="buzz-wrong"
              onClick={o.buzzWrong}
              className="px-8 py-3 bg-red-500/80 text-white rounded-2xl text-base font-semibold active:scale-95 transition-all"
            >
              Fel ✗
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      {o.currentCard && (
        <p className="absolute bottom-5 text-[10px] text-muted/30 tabular-nums tracking-wider">
          {o.cardsRemaining} kort kvar
        </p>
      )}

      {/* Main content */}
      {o.currentCard ? (
        <>
          <SkipButton onClick={o.skipCard} />
          <CardView
            card={o.currentCard}
            clueIndex={o.clueIndex}
            revealed={o.revealed}
            earnedPoints={o.earnedPoints}
            players={o.isCompetition ? o.players : undefined}
            showAnswer={o.showAnswer}
            isMultiplayerHost={isMultiplayerHost}
            onNextClue={o.nextClue}
            onCorrect={o.markCorrect}
            onNextCard={o.isCompetition ? o.noOneGuessed : o.skipCard}
            onAwardPoints={o.awardPoints}
          />
        </>
      ) : (
        <EmptyDeck />
      )}

      {/* Command Bar */}
      <CommandBar
        open={o.cmdBarOpen}
        onClose={o.closeCmdBar}
        players={o.players}
        isCompetition={o.isCompetition}
        onResetScores={o.resetScores}
        onAdjustScore={o.adjustScore}
        onAddPlayer={o.addPlayer}
        onSkipCard={() => { o.skipCard(); o.closeCmdBar(); }}
        onNewGame={o.newGame}
      />
    </div>
  );
}

export default App;
