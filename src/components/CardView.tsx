import type { CityCard } from "../data/types";

interface CardViewProps {
  card: CityCard;
  clueIndex: number;
  revealed: boolean;
  earnedPoints: number | null;
  onNextClue: () => void;
  onCorrect: () => void;
  onNextCard: () => void;
}

export function CardView({
  card,
  clueIndex,
  revealed,
  earnedPoints,
  onNextClue,
  onCorrect,
  onNextCard,
}: CardViewProps) {
  if (revealed) {
    return (
      <div className="relative w-full max-w-sm mx-auto">
        {/* Stack shadows */}
        <div className="absolute -bottom-2 left-3 right-3 h-full rounded-3xl bg-card-border/30" />
        <div className="absolute -bottom-4 left-6 right-6 h-full rounded-3xl bg-card-border/15" />

        {/* Main card */}
        <div className="relative bg-card border border-card-border rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <h2
                data-testid="city-name"
                className="text-3xl font-bold text-text"
              >
                {card.city}
              </h2>
              <p data-testid="country" className="text-lg text-text-dim mt-1">
                {card.country}
              </p>
            </div>

            <div
              data-testid="points"
              className="text-6xl font-black tabular-nums"
              style={{ color: earnedPoints ? "#34d399" : "#f87171" }}
            >
              {earnedPoints === 0 ? "0" : earnedPoints}
              <span className="text-lg font-medium ml-2 opacity-70">poäng</span>
            </div>

            <button
              data-testid="next-card"
              onClick={onNextCard}
              className="w-full py-4 px-6 bg-accent text-white rounded-2xl text-lg font-semibold active:scale-95 transition-all hover:brightness-110 shadow-lg shadow-accent/25"
            >
              Nästa kort
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pointValue = 5 - clueIndex;

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Stack shadows */}
      <div className="absolute -bottom-2 left-3 right-3 h-full rounded-3xl bg-card-border/30" />
      <div className="absolute -bottom-4 left-6 right-6 h-full rounded-3xl bg-card-border/15" />

      {/* Main card */}
      <div className="relative bg-card border border-card-border rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col gap-6">
          {/* Progress dots + points */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i <= clueIndex
                      ? "bg-accent shadow-sm shadow-accent/50"
                      : "bg-card-border"
                  }`}
                />
              ))}
            </div>
            <span
              data-testid="point-value"
              className="text-sm font-semibold text-accent tabular-nums"
            >
              {pointValue} poäng
            </span>
          </div>

          {/* Clue text */}
          <p
            data-testid="clue-text"
            className="text-xl leading-relaxed text-text text-center min-h-[5rem] flex items-center justify-center"
          >
            {card.clues[clueIndex]}
          </p>

          {/* Clue number */}
          <p className="text-center text-xs text-muted uppercase tracking-widest">
            Ledtråd {clueIndex + 1} av 5
          </p>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              data-testid="next-clue"
              onClick={onNextClue}
              className="flex-1 py-4 px-6 bg-card-border/50 text-text-dim rounded-2xl text-lg font-medium active:scale-95 transition-all hover:bg-card-border/80 border border-card-border"
            >
              {clueIndex < 4 ? "Nästa ledtråd" : "Visa svar"}
            </button>
            <button
              data-testid="correct"
              onClick={onCorrect}
              className="flex-1 py-4 px-6 bg-success/15 text-success rounded-2xl text-lg font-semibold active:scale-95 transition-all hover:bg-success/25 border border-success/30"
            >
              Rätt!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
