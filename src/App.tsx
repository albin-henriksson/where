import { useGameOrchestrator } from "./hooks/useGameOrchestrator";
import { StartScreen } from "./components/StartScreen";
import { MultiplayerLobby } from "./components/MultiplayerLobby";
import { BuzzerView } from "./components/BuzzerView";
import { ReaderView } from "./components/ReaderView";
import { CardView } from "./components/CardView";
import { Scoreboard } from "./components/Scoreboard";
import { ScoreSummary } from "./components/ScoreSummary";
import { CommandBar } from "./components/CommandBar";
import { EmptyDeck } from "./components/EmptyDeck";
import { SkipButton } from "./components/SkipButton";

function App() {
  const o = useGameOrchestrator();

  if (o.screen === "mp-buzzer") {
    // Host-as-buzzer uses local gameSync or session data
    const sync = o.gameSync ?? (o.currentCard ? {
      clueText: o.currentCard.clues[o.clueIndex],
      clueIndex: o.clueIndex,
      pointValue: 5 - o.clueIndex,
      revealed: o.revealed,
      cityName: o.currentCard.city,
      country: o.currentCard.country,
      earnedPoints: o.earnedPoints,
      players: o.players.map((p) => ({ id: p.id, name: p.name, score: p.score })),
      imageUrl: o.clueIndex === 2 ? o.currentCard.imageUrl : undefined,
      hintVoteCount: 0,
      totalNonReaders: 0,
    } : null);
    if (!sync) return null;

    return (
      <BuzzerView
        clueText={sync.clueText}
        clueIndex={sync.clueIndex}
        pointValue={sync.pointValue}
        revealed={sync.revealed}
        cityName={sync.cityName}
        country={sync.country}
        earnedPoints={sync.earnedPoints}
        buzzWinner={o.buzzWinner}
        hasBuzzed={o.hasBuzzed}
        isLockedOut={o.isLockedOut}
        playerName={o.playerName}
        players={sync.players}
        imageUrl={sync.imageUrl}
        hintVoteCount={sync.hintVoteCount}
        totalNonReaders={sync.totalNonReaders}
        onBuzz={o.buzz}
        onVoteNextHint={o.voteNextHint}
      />
    );
  }

  if (o.screen === "mp-reader") {
    // Host-as-reader uses session data directly, remote reader uses gameSync
    const isHostReader = o.mpRole === "host";
    const sync = o.gameSync ?? (o.currentCard ? {
      clueText: o.currentCard.clues[o.clueIndex],
      clueIndex: o.clueIndex,
      pointValue: 5 - o.clueIndex,
      revealed: o.revealed,
      cityName: o.currentCard.city,
      country: o.currentCard.country,
      earnedPoints: o.earnedPoints,
      players: o.players.map((p) => ({ id: p.id, name: p.name, score: p.score })),
      imageUrl: o.clueIndex === 2 ? o.currentCard.imageUrl : undefined,
      hintVoteCount: 0,
      totalNonReaders: 0,
    } : null);
    if (!sync) return null;

    return (
      <ReaderView
        clueText={sync.clueText}
        clueIndex={sync.clueIndex}
        pointValue={sync.pointValue}
        revealed={sync.revealed}
        cityName={sync.cityName}
        country={sync.country}
        earnedPoints={sync.earnedPoints}
        imageUrl={sync.imageUrl}
        buzzWinner={o.buzzWinner}
        hintVoteCount={sync.hintVoteCount}
        totalNonReaders={sync.totalNonReaders}
        players={sync.players}
        onNextClue={() => isHostReader ? o.nextClue() : o.sendReaderAction("next-clue")}
        onSkip={() => isHostReader ? o.skipCard() : o.sendReaderAction("skip")}
        onBuzzCorrect={() => isHostReader ? o.buzzCorrect() : o.sendReaderAction("buzz-correct")}
        onBuzzWrong={() => isHostReader ? o.buzzWrong() : o.sendReaderAction("buzz-wrong")}
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
          availableGames={o.availableGames}
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
    // Use gameSync data for remote players, local data for host/local
    const syncPlayers = o.gameSync?.players?.map((p) => ({ ...p })) ?? o.players;
    const pts = o.gameSync?.lastRoundPoints ?? o.lastRound.points;
    const winner = o.gameSync?.lastRoundWinner ?? o.lastRound.winnerName;
    const city = o.gameSync?.summaryCityName ?? o.lastRound.cityName ?? undefined;
    const country = o.gameSync?.summaryCountry ?? o.lastRound.country ?? undefined;
    const isHost = o.mpRole === "host";

    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-surface relative px-6">
        <ScoreSummary
          players={syncPlayers}
          lastRoundPoints={pts}
          lastRoundWinner={winner}
          cityName={city}
          country={country}
          onNextCard={isHost || !o.isMultiplayer ? o.nextCardFromSummary : undefined}
        />
      </div>
    );
  }

  // Local game view (freeplay or local competition — not multiplayer)
  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-surface relative px-6">
      {/* Header */}
      <div className="absolute top-5 left-0 right-0 flex flex-col items-center gap-1">
        <h1 className="text-[10px] font-medium tracking-[0.3em] text-muted/40 uppercase">
          where
        </h1>
        {o.isCompetition && o.players.length > 0 && (
          <Scoreboard players={o.players} />
        )}
      </div>

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
