import type { Player } from "../data/types";

interface ScoreboardProps {
  players: Player[];
}

export function Scoreboard({ players }: ScoreboardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div
      data-testid="scoreboard"
      className="flex gap-4 overflow-x-auto px-6 py-2 w-full max-w-sm mx-auto justify-center"
    >
      {sorted.map((player, i) => (
        <div
          key={player.id}
          className={`flex flex-col items-center gap-0.5 min-w-[3rem] transition-all duration-300 ${
            i === 0 && player.score > 0 ? "text-white" : "text-muted"
          }`}
        >
          <span className="text-lg font-bold tabular-nums">{player.score}</span>
          <span className="text-[10px] uppercase tracking-wider truncate max-w-[4rem]">
            {player.name}
          </span>
        </div>
      ))}
    </div>
  );
}
