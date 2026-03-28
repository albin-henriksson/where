import { useState } from "react";

interface ReaderViewProps {
  clueText: string;
  clueIndex: number;
  pointValue: number;
  revealed: boolean;
  cityName?: string;
  country?: string;
  earnedPoints?: number | null;
  imageUrl?: string;
  buzzWinner: string | null;
  hintVoteCount?: number;
  totalNonReaders?: number;
  players: { id: string; name: string; score: number }[];
  onNextClue: () => void;
  onSkip: () => void;
  onBuzzCorrect: () => void;
  onBuzzWrong: () => void;
  onNoOneGuessed: () => void;
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
  buzzWinner,
  hintVoteCount = 0,
  totalNonReaders = 0,
  players,
  onNextClue,
  onSkip,
  onBuzzCorrect,
  onBuzzWrong,
  onNoOneGuessed,
}: ReaderViewProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const [imgError, setImgError] = useState(false);

  if (revealed) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-surface px-6 animate-scale-in">
        <div className="text-center mb-6">
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
        <button
          data-testid="reader-next-card"
          onClick={onNoOneGuessed}
          className="w-64 py-4 px-6 bg-white text-black rounded-2xl text-lg font-semibold active:scale-95 transition-all hover:bg-white/90 mb-6"
        >
          Nästa kort
        </button>
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
    <div className="min-h-svh flex flex-col items-center justify-between bg-surface px-6 py-10">
      {/* Answer visible to reader */}
      <div className="text-center">
        <p className="text-[10px] text-text-dim/60 uppercase tracking-widest mb-1">Svaret är</p>
        <p className="text-lg font-bold text-white/60">{cityName || "..."}, {country || ""}</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">
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

          {clueIndex === 2 && imageUrl && !imgError ? (
            <img src={imageUrl} alt="Bildledtråd" className="max-h-48 w-full object-cover rounded-xl animate-fade-in" onError={() => setImgError(true)} />
          ) : (
            <p className="text-xl leading-relaxed text-white text-center min-h-[5rem] flex items-center justify-center animate-fade-in">
              {clueText}
            </p>
          )}

          {/* Buzz notification with Rätt/Fel */}
          {buzzWinner && (
            <div className="mt-6 flex flex-col items-center gap-3 animate-score-pop">
              <p className="text-white font-bold">{buzzWinner} buzzade!</p>
              <div className="flex gap-3 w-full">
                <button
                  data-testid="reader-buzz-correct"
                  onClick={onBuzzCorrect}
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-2xl text-base font-semibold active:scale-95 transition-all"
                >
                  Rätt ✓
                </button>
                <button
                  data-testid="reader-buzz-wrong"
                  onClick={onBuzzWrong}
                  className="flex-1 py-3 bg-red-500/80 text-white rounded-2xl text-base font-semibold active:scale-95 transition-all"
                >
                  Fel ✗
                </button>
              </div>
            </div>
          )}

          {/* Game controls (when nobody is buzzing) */}
          {!buzzWinner && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <button
                data-testid="reader-next-clue"
                onClick={onNextClue}
                className="w-full py-4 px-6 bg-card-border/50 text-text-dim rounded-2xl text-base font-medium active:scale-95 transition-all hover:bg-card-border border border-card-border"
              >
                {clueIndex < 4 ? "Nästa" : "Visa svar"}
              </button>
              <button
                data-testid="reader-skip"
                onClick={onSkip}
                className="text-[10px] text-muted/30 hover:text-muted/60 transition-opacity"
              >
                hoppa över
              </button>
            </div>
          )}

          {/* Hint vote indicator */}
          {hintVoteCount > 0 && totalNonReaders > 0 && !buzzWinner && (
            <p className="text-center text-xs text-muted mt-3 animate-fade-in">
              {hintVoteCount}/{totalNonReaders} vill ha nästa ledtråd
            </p>
          )}
        </div>
      </div>

      {/* Scoreboard */}
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
