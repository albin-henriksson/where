import { Command } from "cmdk";
import { useState } from "react";
import type { Player } from "../data/types";

interface CommandBarProps {
  open: boolean;
  onClose: () => void;
  players: Player[];
  isCompetition: boolean;
  onResetScores: () => void;
  onAdjustScore: (playerId: string, delta: number) => void;
  onAddPlayer: (name: string) => void;
  onSkipCard: () => void;
  onNewGame: () => void;
  onQuitGame?: () => void;
  onToggleDevMode?: () => void;
  devMode?: boolean;
}

export function CommandBar({
  open,
  onClose,
  players,
  isCompetition,
  onResetScores,
  onAdjustScore,
  onAddPlayer,
  onSkipCard,
  onNewGame,
  onQuitGame,
  onToggleDevMode,
  devMode,
}: CommandBarProps) {
  const [subMenu, setSubMenu] = useState<
    null | "adjust-player" | "adjust-amount"
  >(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [adjustValue, setAdjustValue] = useState("");

  if (!open) return null;

  function close() {
    setSubMenu(null);
    setSelectedPlayerId(null);
    setAdjustValue("");
    onClose();
  }

  function handleAdjustSubmit() {
    if (selectedPlayerId && adjustValue) {
      const delta = parseInt(adjustValue, 10);
      if (!isNaN(delta)) {
        onAdjustScore(selectedPlayerId, delta);
      }
    }
    close();
  }

  return (
    <div
      data-testid="command-bar-overlay"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] animate-fade-in"
      onClick={close}
    >
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md mx-4 animate-scale-in"
      >
        <Command
          data-testid="command-bar"
          className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-2xl"
          loop
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              close();
            }
          }}
        >
          {subMenu === "adjust-amount" ? (
            <div className="p-4">
              <p className="text-xs text-muted uppercase tracking-widest mb-3">
                Justera poäng för{" "}
                {players.find((p) => p.id === selectedPlayerId)?.name}
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAdjustSubmit();
                }}
              >
                <input
                  data-testid="adjust-score-input"
                  type="number"
                  value={adjustValue}
                  onChange={(e) => setAdjustValue(e.target.value)}
                  placeholder="t.ex. +3 eller -2"
                  className="w-full bg-surface border border-card-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-text-dim"
                  autoFocus
                />
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubMenu("adjust-player");
                      setAdjustValue("");
                    }}
                    className="flex-1 py-2 text-sm text-muted hover:text-white transition-colors"
                  >
                    Tillbaka
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-white text-black rounded-xl text-sm font-semibold"
                  >
                    Justera
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <Command.Input
                data-testid="command-input"
                placeholder="Sök kommando..."
                className="w-full bg-transparent border-b border-card-border px-4 py-4 text-white placeholder:text-muted focus:outline-none text-base"
                autoFocus
              />
              <Command.List className="max-h-64 overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-muted">
                  Inget kommando hittades.
                </Command.Empty>

                {subMenu === "adjust-player" ? (
                  <Command.Group
                    heading="Välj spelare"
                    className="text-[10px] text-muted uppercase tracking-widest px-2 py-1"
                  >
                    {players.map((player) => (
                      <Command.Item
                        key={player.id}
                        value={player.name}
                        onSelect={() => {
                          setSelectedPlayerId(player.id);
                          setSubMenu("adjust-amount");
                        }}
                        className="px-3 py-2.5 rounded-xl text-sm text-text-dim cursor-pointer data-[selected=true]:bg-card-border data-[selected=true]:text-white transition-colors"
                      >
                        {player.name}{" "}
                        <span className="text-muted ml-1">({player.score}p)</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                ) : (
                  <>
                    <Command.Group
                      heading="Spel"
                      className="text-[10px] text-muted uppercase tracking-widest px-2 py-1"
                    >
                      <Command.Item
                        data-testid="cmd-skip"
                        value="Hoppa över kort"
                        onSelect={() => {
                          onSkipCard();
                          close();
                        }}
                        className="px-3 py-2.5 rounded-xl text-sm text-text-dim cursor-pointer data-[selected=true]:bg-card-border data-[selected=true]:text-white transition-colors"
                      >
                        Hoppa över kort
                      </Command.Item>
                      <Command.Item
                        data-testid="cmd-new-game"
                        value="Ny omgång"
                        onSelect={() => {
                          onNewGame();
                          close();
                        }}
                        className="px-3 py-2.5 rounded-xl text-sm text-text-dim cursor-pointer data-[selected=true]:bg-card-border data-[selected=true]:text-white transition-colors"
                      >
                        Ny omgång
                      </Command.Item>
                      {onToggleDevMode && (
                        <Command.Item
                          data-testid="cmd-dev-mode"
                          value="Dev mode diagnostik"
                          onSelect={() => {
                            onToggleDevMode();
                            close();
                          }}
                          className="px-3 py-2.5 rounded-xl text-sm text-text-dim cursor-pointer data-[selected=true]:bg-card-border data-[selected=true]:text-white transition-colors"
                        >
                          {devMode ? "Stäng dev mode" : "Dev mode"}
                        </Command.Item>
                      )}
                      {onQuitGame && (
                        <Command.Item
                          data-testid="cmd-quit"
                          value="Avsluta spel"
                          onSelect={() => {
                            onQuitGame();
                            close();
                          }}
                          className="px-3 py-2.5 rounded-xl text-sm text-danger cursor-pointer data-[selected=true]:bg-card-border data-[selected=true]:text-danger transition-colors"
                        >
                          Avsluta spel
                        </Command.Item>
                      )}
                    </Command.Group>

                    {isCompetition && (
                      <Command.Group
                        heading="Poäng"
                        className="text-[10px] text-muted uppercase tracking-widest px-2 py-1 mt-2"
                      >
                        <Command.Item
                          data-testid="cmd-reset-scores"
                          value="Nollställ poäng"
                          onSelect={() => {
                            onResetScores();
                            close();
                          }}
                          className="px-3 py-2.5 rounded-xl text-sm text-text-dim cursor-pointer data-[selected=true]:bg-card-border data-[selected=true]:text-white transition-colors"
                        >
                          Nollställ poäng
                        </Command.Item>
                        <Command.Item
                          data-testid="cmd-adjust-scores"
                          value="Korrigera poäng"
                          onSelect={() => setSubMenu("adjust-player")}
                          className="px-3 py-2.5 rounded-xl text-sm text-text-dim cursor-pointer data-[selected=true]:bg-card-border data-[selected=true]:text-white transition-colors"
                        >
                          Korrigera poäng
                        </Command.Item>
                        <Command.Item
                          data-testid="cmd-add-player"
                          value="Lägg till spelare"
                          onSelect={() => {
                            const name = prompt("Spelarnamn:");
                            if (name?.trim()) {
                              onAddPlayer(name.trim());
                            }
                            close();
                          }}
                          className="px-3 py-2.5 rounded-xl text-sm text-text-dim cursor-pointer data-[selected=true]:bg-card-border data-[selected=true]:text-white transition-colors"
                        >
                          Lägg till spelare
                        </Command.Item>
                      </Command.Group>
                    )}
                  </>
                )}
              </Command.List>
            </>
          )}
        </Command>
      </div>
    </div>
  );
}
