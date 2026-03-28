import { useGameOrchestrator, type Orchestrator } from "./hooks/useGameOrchestrator";
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
import { DevOverlay } from "./components/DevOverlay";
import { IntroScreen } from "./components/IntroScreen";

function buildSync(o: Orchestrator) {
  return o.gameSync ?? (o.currentCard ? {
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
}

function renderScreen(o: Orchestrator) {
  if (o.screen === "mp-buzzer") {
    const sync = buildSync(o);
    if (!sync) return null;
    return (
      <BuzzerView
        clueText={sync.clueText} clueIndex={sync.clueIndex} pointValue={sync.pointValue}
        revealed={sync.revealed} cityName={sync.cityName} country={sync.country}
        earnedPoints={sync.earnedPoints} buzzWinner={o.buzzWinner}
        hasBuzzed={o.hasBuzzed} isLockedOut={o.isLockedOut} playerName={o.playerName}
        players={sync.players} imageUrl={sync.imageUrl}
        hintVoteCount={sync.hintVoteCount} totalNonReaders={sync.totalNonReaders}
        onBuzz={o.buzz} onVoteNextHint={o.voteNextHint}
      />
    );
  }

  if (o.screen === "mp-reader") {
    const isHostReader = o.mpRole === "host";
    const sync = buildSync(o);
    if (!sync) return null;
    return (
      <ReaderView
        clueText={sync.clueText} clueIndex={sync.clueIndex} pointValue={sync.pointValue}
        revealed={sync.revealed} cityName={sync.cityName} country={sync.country}
        earnedPoints={sync.earnedPoints} imageUrl={sync.imageUrl}
        buzzWinner={o.buzzWinner} hintVoteCount={sync.hintVoteCount}
        totalNonReaders={sync.totalNonReaders} players={sync.players}
        onNextClue={() => isHostReader ? o.nextClue() : o.sendReaderAction("next-clue")}
        onSkip={() => isHostReader ? o.skipCard() : o.sendReaderAction("skip")}
        onBuzzCorrect={() => isHostReader ? o.buzzCorrect() : o.sendReaderAction("buzz-correct")}
        onBuzzWrong={() => isHostReader ? o.buzzWrong() : o.sendReaderAction("buzz-wrong")}
        onNoOneGuessed={() => isHostReader ? o.noOneGuessed() : o.sendReaderAction("no-one-guessed")}
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
          mode={o.mpRole} roomCode={o.roomCode} connected={o.mpConnected}
          peers={o.mpPeers} initialRoomCode={o.initialRoomCode}
          availableGames={o.availableGames} onHost={o.hostGame} onJoin={o.joinGame}
          onStart={o.startMultiplayer} onBack={o.backToStart}
        />
      </div>
    );
  }

  if (o.screen === "intro") {
    return (
      <IntroScreen
        onContinue={o.dismissIntroScreen}
        onDontShowAgain={o.dismissIntroForever}
      />
    );
  }

  if (o.screen === "start") {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-surface">
        <StartScreen
          onStart={(mode, names) => mode === "freeplay" ? o.startFreeplay() : o.startCompetition(names ?? [])}
          onMultiplayer={o.openMultiplayer}
          availableGames={o.availableGames}
          onJoinGame={o.joinDiscoveredGame}
          selectedDifficulties={o.selectedDifficulties}
          onDifficultyChange={o.setSelectedDifficulties}
        />
      </div>
    );
  }

  if (o.screen === "summary") {
    const syncPlayers = o.gameSync?.players?.map((p) => ({ ...p })) ?? o.players;
    const isHost = o.mpRole === "host";
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-surface relative px-6">
        <ScoreSummary
          players={syncPlayers}
          lastRoundPoints={o.gameSync?.lastRoundPoints ?? o.lastRound.points}
          lastRoundWinner={o.gameSync?.lastRoundWinner ?? o.lastRound.winnerName}
          cityName={o.gameSync?.summaryCityName ?? o.lastRound.cityName ?? undefined}
          country={o.gameSync?.summaryCountry ?? o.lastRound.country ?? undefined}
          onNextCard={isHost || !o.isMultiplayer ? o.nextCardFromSummary : undefined}
        />
      </div>
    );
  }

  // Local game (freeplay or local competition)
  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-surface relative px-6">
      <div className="absolute top-5 left-0 right-0 flex flex-col items-center gap-1">
        <h1 className="text-[10px] font-medium tracking-[0.3em] text-muted/40 uppercase">where</h1>
        {o.isCompetition && o.players.length > 0 && <Scoreboard players={o.players} />}
      </div>
      {o.currentCard && (
        <p className="absolute bottom-5 text-[10px] text-muted/30 tabular-nums tracking-wider">
          {o.cardsRemaining} kort kvar
        </p>
      )}
      {o.currentCard ? (
        <>
          <SkipButton onClick={o.skipCard} />
          <CardView
            card={o.currentCard} clueIndex={o.clueIndex} revealed={o.revealed}
            earnedPoints={o.earnedPoints} players={o.isCompetition ? o.players : undefined}
            showAnswer={o.showAnswer} onNextClue={o.nextClue} onCorrect={o.markCorrect}
            onNextCard={o.isCompetition ? o.noOneGuessed : o.skipCard}
            onAwardPoints={o.awardPoints}
          />
        </>
      ) : (
        <EmptyDeck />
      )}
    </div>
  );
}

function App() {
  const o = useGameOrchestrator();

  return (
    <>
      <DevOverlay o={o} />
      {renderScreen(o)}
      <CommandBar
        open={o.cmdBarOpen} onClose={o.closeCmdBar} players={o.players}
        isCompetition={o.isCompetition} onResetScores={o.resetScores}
        onAdjustScore={o.adjustScore} onAddPlayer={o.addPlayer}
        onSkipCard={() => { o.skipCard(); o.closeCmdBar(); }}
        onNewGame={o.newGame} onQuitGame={o.quitGame}
        onToggleDevMode={o.toggleDevMode} devMode={o.devMode}
      />
    </>
  );
}

export default App;
