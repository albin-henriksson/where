import type { Player } from "../data/types";

interface ScoreSummaryProps {
  players: Player[];
  lastRoundPoints: number;
  lastRoundWinner: string | null;
  onNextCard: () => void;
}

export function ScoreSummary({
  players,
  lastRoundPoints,
  lastRoundWinner,
  onNextCard,
}: ScoreSummaryProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const topScore = sorted[0]?.score ?? 0;

  return (
    <div className="flex flex-col items-center gap-6 p-8 w-full max-w-sm mx-auto animate-scale-in">
      <h2 className="text-xs uppercase tracking-[0.3em] text-muted">
        Ställning
      </h2>

      <div className="w-full flex flex-col gap-2">
        {sorted.map((player, i) => {
          const isWinner = player.name === lastRoundWinner;
          const isLeading = i === 0 && player.score > 0;
          const barWidth =
            topScore > 0
              ? Math.max(8, (player.score / topScore) * 100)
              : 8;

          return (
            <div
              key={player.id}
              className="flex items-center gap-3 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
            >
              <span
                className={`text-sm font-medium w-20 truncate text-right ${
                  isLeading ? "text-white" : "text-text-dim"
                }`}
              >
                {player.name}
              </span>

              <div className="flex-1 h-8 bg-card-border/30 rounded-lg overflow-hidden relative">
                <div
                  className={`h-full rounded-lg transition-all duration-700 ease-out ${
                    isLeading
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-500"
                      : "bg-card-border"
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
                {isWinner && lastRoundPoints > 0 && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400 animate-fade-in">
                    +{lastRoundPoints}
                  </span>
                )}
              </div>

              <span
                className={`text-lg font-bold tabular-nums w-10 ${
                  isLeading ? "text-white" : "text-text-dim"
                }`}
              >
                {player.score}
              </span>
            </div>
          );
        })}
      </div>

      <button
        data-testid="summary-next"
        onClick={onNextCard}
        className="w-full py-4 px-6 bg-white text-black rounded-2xl text-lg font-semibold active:scale-95 transition-all hover:bg-white/90 mt-2"
      >
        Nästa kort
      </button>
    </div>
  );
}
