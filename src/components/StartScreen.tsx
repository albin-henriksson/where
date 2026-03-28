import { useState } from "react";
import type { GameMode } from "../data/types";

interface StartScreenProps {
  onStart: (mode: GameMode, playerNames?: string[]) => void;
  onMultiplayer?: () => void;
}

export function StartScreen({ onStart, onMultiplayer }: StartScreenProps) {
  const [step, setStep] = useState<"mode" | "players">("mode");
  const [playerNames, setPlayerNames] = useState<string[]>(["", ""]);
  const [newName, setNewName] = useState("");

  const validPlayers = playerNames.filter((n) => n.trim().length > 0);

  if (step === "players") {
    return (
      <div className="flex flex-col items-center gap-6 p-8 w-full max-w-sm mx-auto animate-slide-up">
        <h2 className="text-2xl font-bold text-white">Spelare</h2>
        <p className="text-xs text-muted uppercase tracking-widest">Minst 2 spelare</p>

        <div className="w-full flex flex-col gap-2">
          {playerNames.map((name, i) => (
            <div key={i} className="flex gap-2">
              <input
                data-testid={`player-input-${i}`}
                type="text"
                value={name}
                onChange={(e) => {
                  const next = [...playerNames];
                  next[i] = e.target.value;
                  setPlayerNames(next);
                }}
                placeholder={`Spelare ${i + 1}`}
                className="flex-1 bg-card border border-card-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-text-dim transition-colors"
                autoFocus={i === 0}
              />
              {playerNames.length > 2 && (
                <button
                  onClick={() =>
                    setPlayerNames(playerNames.filter((_, j) => j !== i))
                  }
                  className="px-3 text-muted hover:text-white transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newName.trim()) {
              setPlayerNames([...playerNames, newName.trim()]);
              setNewName("");
            }
          }}
          className="w-full flex gap-2"
        >
          <input
            data-testid="add-player-input"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Lägg till..."
            className="flex-1 bg-card border border-card-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-text-dim transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-3 bg-card-border text-text-dim rounded-xl hover:bg-card-hover hover:text-white transition-all"
          >
            +
          </button>
        </form>

        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={() => setStep("mode")}
            className="flex-1 py-4 px-6 bg-card-border/50 text-text-dim rounded-2xl text-base font-medium border border-card-border"
          >
            Tillbaka
          </button>
          <button
            data-testid="start-competition"
            onClick={() => onStart("competition", validPlayers.map((n) => n.trim()))}
            disabled={validPlayers.length < 2}
            className="flex-1 py-4 px-6 bg-white text-black rounded-2xl text-base font-semibold disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            Starta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-10 p-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-5xl font-black text-white tracking-tight">
          where
        </h1>
        <p className="text-muted mt-3 text-sm">Välj spelläge</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          data-testid="mode-freeplay"
          onClick={() => onStart("freeplay")}
          className="group bg-card border border-card-border rounded-2xl p-5 text-left hover:border-text-dim/30 transition-all active:scale-[0.98]"
        >
          <h3 className="text-lg font-semibold text-white">Frilek</h3>
          <p className="text-sm text-muted mt-0.5">
            Utan poäng — bara kort och ledtrådar.
          </p>
        </button>

        <button
          data-testid="mode-competition"
          onClick={() => setStep("players")}
          className="group bg-card border border-card-border rounded-2xl p-5 text-left hover:border-text-dim/30 transition-all active:scale-[0.98]"
        >
          <h3 className="text-lg font-semibold text-white">Tävling</h3>
          <p className="text-sm text-muted mt-0.5">
            Med poäng — den som gissar rätt får poängen.
          </p>
        </button>

        <button
          data-testid="mode-multiplayer"
          onClick={onMultiplayer}
          className="group bg-card border border-card-border rounded-2xl p-5 text-left hover:border-text-dim/30 transition-all active:scale-[0.98]"
        >
          <h3 className="text-lg font-semibold text-white">Multiplayer</h3>
          <p className="text-sm text-muted mt-0.5">
            Varje spelare har en egen enhet med buzzer.
          </p>
        </button>
      </div>
    </div>
  );
}
