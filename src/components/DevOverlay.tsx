import type { Orchestrator } from "../hooks/useGameOrchestrator";

interface DevOverlayProps {
  o: Orchestrator;
}

export function DevOverlay({ o }: DevOverlayProps) {
  if (!o.devMode) return null;

  const entries: [string, unknown][] = [
    ["screen", o.screen],
    ["isMultiplayer", o.isMultiplayer],
    ["isCompetition", o.isCompetition],
    ["isReader", o.isReader],
    ["mpRole", o.mpRole],
    ["roomCode", o.roomCode],
    ["currentReader", o.currentReader],
    ["playerName", o.playerName],
    ["players", o.players.length],
    ["peers", o.mpPeers.length],
    ["connected", o.mpConnected],
    ["card", o.currentCard?.id ?? "none"],
    ["clueIndex", o.clueIndex],
    ["revealed", o.revealed],
    ["earnedPoints", o.earnedPoints],
    ["cardsRemaining", o.cardsRemaining],
    ["buzzWinner", o.buzzWinner],
    ["hasBuzzed", o.hasBuzzed],
    ["isLockedOut", o.isLockedOut],
    ["cmdBarOpen", o.cmdBarOpen],
    ["lastRound", `${o.lastRound.winnerName ?? "-"} ${o.lastRound.points}p`],
    ["availableGames", o.availableGames.length],
    ["gameSync", o.gameSync ? "yes" : "no"],
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-sm text-[10px] font-mono text-emerald-400 p-3 max-h-[50vh] overflow-y-auto pointer-events-none">
      <div className="flex flex-wrap gap-x-4 gap-y-0.5">
        {entries.map(([key, val]) => (
          <span key={key}>
            <span className="text-muted">{key}:</span>{" "}
            <span className={val === true ? "text-emerald-400" : val === false ? "text-red-400" : "text-white"}>
              {String(val)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
