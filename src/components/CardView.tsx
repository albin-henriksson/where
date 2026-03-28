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
      <div className="flex flex-col items-center gap-6 p-8 max-w-md mx-auto">
        <div className="text-center">
          <h2
            data-testid="city-name"
            className="text-3xl font-bold text-gray-900"
          >
            {card.city}
          </h2>
          <p data-testid="country" className="text-lg text-gray-500 mt-1">
            {card.country}
          </p>
        </div>

        <div
          data-testid="points"
          className="text-5xl font-bold tabular-nums"
          style={{ color: earnedPoints ? "#22c55e" : "#ef4444" }}
        >
          {earnedPoints === 0 ? "0" : earnedPoints} poäng
        </div>

        <button
          data-testid="next-card"
          onClick={onNextCard}
          className="w-full py-4 px-6 bg-gray-900 text-white rounded-2xl text-lg font-medium active:scale-95 transition-transform"
        >
          Nästa kort
        </button>
      </div>
    );
  }

  const pointValue = 5 - clueIndex;

  return (
    <div className="flex flex-col items-center gap-6 p-8 max-w-md mx-auto">
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${
                i <= clueIndex ? "bg-gray-900" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <span
          data-testid="point-value"
          className="text-sm font-medium text-gray-500"
        >
          {pointValue} {pointValue === 1 ? "poäng" : "poäng"}
        </span>
      </div>

      <p
        data-testid="clue-text"
        className="text-xl leading-relaxed text-gray-800 text-center min-h-[4rem]"
      >
        {card.clues[clueIndex]}
      </p>

      <div className="flex gap-3 w-full">
        <button
          data-testid="next-clue"
          onClick={onNextClue}
          className="flex-1 py-4 px-6 bg-gray-100 text-gray-700 rounded-2xl text-lg font-medium active:scale-95 transition-transform"
        >
          {clueIndex < 4 ? "Nästa ledtråd" : "Visa svar"}
        </button>
        <button
          data-testid="correct"
          onClick={onCorrect}
          className="flex-1 py-4 px-6 bg-green-600 text-white rounded-2xl text-lg font-medium active:scale-95 transition-transform"
        >
          Rätt!
        </button>
      </div>
    </div>
  );
}
