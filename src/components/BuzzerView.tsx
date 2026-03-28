interface BuzzerViewProps {
  clueText: string;
  clueIndex: number;
  pointValue: number;
  revealed: boolean;
  cityName?: string;
  country?: string;
  earnedPoints?: number | null;
  buzzWinner: string | null;
  hasBuzzed: boolean;
  playerName: string;
  players: { id: string; name: string; score: number }[];
  onBuzz: () => void;
}

export function BuzzerView({
  clueText,
  clueIndex,
  pointValue,
  revealed,
  cityName,
  country,
  earnedPoints,
  buzzWinner,
  hasBuzzed,
  playerName,
  players,
  onBuzz,
}: BuzzerViewProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  if (revealed && cityName) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-surface px-6 animate-scale-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">{cityName}</h2>
          <p className="text-base text-text-dim mt-1">{country}</p>
          {earnedPoints !== null && earnedPoints !== undefined && (
            <p
              className="text-5xl font-black mt-4"
              style={{ color: earnedPoints > 0 ? "#4ade80" : "#f87171" }}
            >
              {earnedPoints}p
            </p>
          )}
          {buzzWinner && (
            <p className="text-success text-sm mt-2 animate-fade-in">
              {buzzWinner} buzzade först!
            </p>
          )}
        </div>

        {/* Scoreboard */}
        <div className="flex gap-4 justify-center">
          {sorted.map((p, i) => (
            <div
              key={p.id}
              className={`flex flex-col items-center gap-0.5 ${
                i === 0 && p.score > 0 ? "text-white" : "text-muted"
              }`}
            >
              <span className="text-lg font-bold tabular-nums">{p.score}</span>
              <span className="text-[10px] uppercase tracking-wider">
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-between bg-surface px-6 py-12">
      {/* Top: clue info */}
      <div className="flex flex-col items-center gap-4 w-full max-w-sm">
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i <= clueIndex ? "bg-white" : "bg-card-border"
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-text-dim tabular-nums">
            {pointValue}p
          </span>
        </div>

        <p className="text-lg leading-relaxed text-white text-center">
          {clueText}
        </p>
      </div>

      {/* Center: buzzer */}
      <div className="flex flex-col items-center gap-4">
        {buzzWinner ? (
          <div className="animate-scale-in text-center">
            <p className="text-2xl font-bold text-white">{buzzWinner}</p>
            <p className="text-sm text-muted mt-1">buzzade först!</p>
          </div>
        ) : (
          <button
            data-testid="buzz-button"
            onClick={onBuzz}
            disabled={hasBuzzed}
            className={`w-40 h-40 rounded-full text-2xl font-black uppercase tracking-wider transition-all active:scale-90 ${
              hasBuzzed
                ? "bg-card-border text-muted"
                : "bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)]"
            }`}
          >
            {hasBuzzed ? "Väntar..." : "BUZZ"}
          </button>
        )}
      </div>

      {/* Bottom: scoreboard */}
      <div className="flex gap-4 justify-center">
        {sorted.map((p) => (
          <div
            key={p.id}
            className={`flex flex-col items-center gap-0.5 ${
              p.name === playerName ? "text-white" : "text-muted"
            }`}
          >
            <span className="text-lg font-bold tabular-nums">{p.score}</span>
            <span className="text-[10px] uppercase tracking-wider">
              {p.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
