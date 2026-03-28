import type { CityCard, Player } from "../data/types";

interface CardViewProps {
  card: CityCard;
  clueIndex: number;
  revealed: boolean;
  earnedPoints: number | null;
  players?: Player[];
  showAnswer?: boolean;
  onNextClue: () => void;
  onCorrect: () => void;
  onNextCard: () => void;
  onAwardPoints?: (playerId: string) => void;
}

export function CardView({
  card,
  clueIndex,
  revealed,
  earnedPoints,
  players,
  showAnswer,
  onNextClue,
  onCorrect,
  onNextCard,
  onAwardPoints,
}: CardViewProps) {
  const isCompetition = players && players.length > 0;

  if (revealed) {
    return (
      <div className="relative w-full max-w-sm mx-auto animate-scale-in">
        {/* Stack shadows */}
        <div className="absolute -bottom-2 left-3 right-3 h-full rounded-3xl bg-card-border/40" />
        <div className="absolute -bottom-4 left-6 right-6 h-full rounded-3xl bg-card-border/20" />

        {/* Main card */}
        <div className="relative bg-card border border-card-border rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-5">
            <div className="text-center animate-fade-in">
              <h2
                data-testid="city-name"
                className="text-3xl font-bold text-white"
              >
                {card.city}
              </h2>
              <p data-testid="country" className="text-base text-text-dim mt-1">
                {card.country}
              </p>
            </div>

            <div
              data-testid="points"
              className="text-6xl font-black tabular-nums animate-slide-up"
              style={{ color: earnedPoints ? "#4ade80" : "#f87171" }}
            >
              {earnedPoints === 0 ? "0" : earnedPoints}
              <span className="text-base font-medium ml-2 opacity-60">p</span>
            </div>

            {isCompetition && earnedPoints && earnedPoints > 0 ? (
              <div className="w-full flex flex-col gap-2 animate-slide-up">
                <p className="text-xs text-muted text-center uppercase tracking-widest mb-1">
                  Vem gissade rätt?
                </p>
                {players.map((player) => (
                  <button
                    key={player.id}
                    data-testid={`award-${player.name}`}
                    onClick={() => onAwardPoints?.(player.id)}
                    className="w-full py-3 px-4 bg-card-border/40 text-text rounded-xl text-base font-medium active:scale-95 transition-all hover:bg-card-border/70 border border-card-border"
                  >
                    {player.name}
                  </button>
                ))}
                <button
                  data-testid="award-nobody"
                  onClick={onNextCard}
                  className="w-full py-2 px-4 text-muted text-sm hover:text-text-dim transition-colors mt-1"
                >
                  Ingen gissade rätt
                </button>
              </div>
            ) : (
              <button
                data-testid="next-card"
                onClick={onNextCard}
                className="w-full py-4 px-6 bg-white text-black rounded-2xl text-lg font-semibold active:scale-95 transition-all hover:bg-white/90 animate-slide-up"
              >
                Nästa kort
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const pointValue = 5 - clueIndex;

  return (
    <div key={card.id} className="relative w-full max-w-sm mx-auto animate-card-enter">
      {/* Stack shadows */}
      <div className="absolute -bottom-2 left-3 right-3 h-full rounded-3xl bg-card-border/40" />
      <div className="absolute -bottom-4 left-6 right-6 h-full rounded-3xl bg-card-border/20" />

      {/* Main card */}
      <div className="relative bg-card border border-card-border rounded-3xl p-8">
        <div className="flex flex-col gap-6">
          {/* Reader answer (competition mode) */}
          {showAnswer && (
            <div data-testid="reader-answer" className="text-center -mt-1 mb--2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted/60">
                {card.city}, {card.country}
              </p>
            </div>
          )}

          {/* Progress dots + points */}
          <div className="flex items-center justify-between">
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
            <span
              data-testid="point-value"
              className="text-sm font-semibold text-text-dim tabular-nums"
            >
              {pointValue}p
            </span>
          </div>

          {/* Clue text */}
          <p
            data-testid="clue-text"
            className="text-xl leading-relaxed text-white text-center min-h-[5rem] flex items-center justify-center animate-fade-in"
          >
            {card.clues[clueIndex]}
          </p>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              data-testid="next-clue"
              onClick={onNextClue}
              className="flex-1 py-4 px-6 bg-card-border/50 text-text-dim rounded-2xl text-base font-medium active:scale-95 transition-all hover:bg-card-border border border-card-border"
            >
              {clueIndex < 4 ? "Nästa" : "Visa svar"}
            </button>
            <button
              data-testid="correct"
              onClick={onCorrect}
              className="flex-1 py-4 px-6 bg-white text-black rounded-2xl text-base font-semibold active:scale-95 transition-all hover:bg-white/90"
            >
              Rätt!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
