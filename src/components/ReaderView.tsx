interface ReaderViewProps {
  clueText: string;
  clueIndex: number;
  pointValue: number;
  revealed: boolean;
  cityName?: string;
  country?: string;
  earnedPoints?: number | null;
  imageUrl?: string;
  players: { id: string; name: string; score: number }[];
}

export function ReaderView({
  clueText,
  clueIndex,
  pointValue,
  revealed,
  cityName,
  country,
  earnedPoints,
  imageUrl,
  players,
}: ReaderViewProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  if (revealed && cityName) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-surface px-6 animate-scale-in">
        <div className="text-center mb-6">
          <p className="text-xs text-muted uppercase tracking-widest mb-2">Svaret var</p>
          <h2 className="text-4xl font-bold text-white">{cityName}</h2>
          <p className="text-base text-text-dim mt-1">{country}</p>
          {earnedPoints !== null && earnedPoints !== undefined && (
            <p
              className="text-5xl font-black mt-4 animate-score-pop"
              style={{ color: earnedPoints > 0 ? "#4ade80" : "#f87171" }}
            >
              {earnedPoints}p
            </p>
          )}
        </div>
        <div className="flex gap-4 justify-center">
          {sorted.map((p) => (
            <div key={p.id} className="flex flex-col items-center gap-0.5 text-muted">
              <span className="text-lg font-bold tabular-nums">{p.score}</span>
              <span className="text-[10px] uppercase tracking-wider">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-surface px-6">
      <div className="w-full max-w-sm">
        {/* Answer visible to reader */}
        <div className="text-center mb-6">
          <p className="text-xs text-muted/40 uppercase tracking-widest mb-1">Du läser</p>
          <p className="text-lg font-bold text-white/20">{cityName || "..."}</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-card-border rounded-3xl p-8 animate-card-enter">
          <div className="flex items-center justify-between mb-6">
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

          {clueIndex === 2 && imageUrl ? (
            <img src={imageUrl} alt="Bildledtråd" className="max-h-48 w-full object-cover rounded-xl animate-fade-in" />
          ) : (
            <p className="text-xl leading-relaxed text-white text-center min-h-[5rem] flex items-center justify-center animate-fade-in">
              {clueText}
            </p>
          )}
        </div>

        {/* Scoreboard */}
        <div className="flex gap-4 justify-center mt-6">
          {sorted.map((p) => (
            <div key={p.id} className="flex flex-col items-center gap-0.5 text-muted">
              <span className="text-lg font-bold tabular-nums">{p.score}</span>
              <span className="text-[10px] uppercase tracking-wider">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
