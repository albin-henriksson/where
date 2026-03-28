import { useState, useCallback } from "react";
import type { GameMode, Player } from "../data/types";

export type GameScreen = "start" | "playing";

export interface GameStateValue {
  screen: GameScreen;
  mode: GameMode;
  players: Player[];
}

export interface GameStateActions {
  startGame: (mode: GameMode, playerNames?: string[]) => void;
  resetGame: () => void;
  awardPoints: (playerId: string, points: number) => void;
  resetScores: () => void;
  adjustScore: (playerId: string, delta: number) => void;
  addPlayer: (name: string) => void;
  removePlayer: (playerId: string) => void;
}

let nextId = 0;
function makeId() {
  return `p${++nextId}`;
}

export function useGameState(): GameStateValue & GameStateActions {
  const [screen, setScreen] = useState<GameScreen>("start");
  const [mode, setMode] = useState<GameMode>("freeplay");
  const [players, setPlayers] = useState<Player[]>([]);

  const startGame = useCallback(
    (gameMode: GameMode, playerNames?: string[]) => {
      setMode(gameMode);
      if (gameMode === "competition" && playerNames) {
        setPlayers(
          playerNames.map((name) => ({ id: makeId(), name, score: 0 })),
        );
      } else {
        setPlayers([]);
      }
      setScreen("playing");
    },
    [],
  );

  const resetGame = useCallback(() => {
    setScreen("start");
    setPlayers([]);
  }, []);

  const awardPoints = useCallback((playerId: string, points: number) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId ? { ...p, score: p.score + points } : p,
      ),
    );
  }, []);

  const resetScores = useCallback(() => {
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0 })));
  }, []);

  const adjustScore = useCallback((playerId: string, delta: number) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId ? { ...p, score: p.score + delta } : p,
      ),
    );
  }, []);

  const addPlayer = useCallback((name: string) => {
    setPlayers((prev) => [...prev, { id: makeId(), name, score: 0 }]);
  }, []);

  const removePlayer = useCallback((playerId: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
  }, []);

  return {
    screen,
    mode,
    players,
    startGame,
    resetGame,
    awardPoints,
    resetScores,
    adjustScore,
    addPlayer,
    removePlayer,
  };
}
