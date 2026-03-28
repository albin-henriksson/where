import { useState, useCallback, useMemo } from "react";
import type { CityCard } from "../data/types";
import { cards } from "../data/cards";

function shuffle<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface GameState {
  currentCard: CityCard | null;
  clueIndex: number;
  revealed: boolean;
  earnedPoints: number | null;
  cardsRemaining: number;
}

export interface GameActions {
  nextClue: () => void;
  correct: () => void;
  skip: () => void;
  nextCard: () => void;
}

export function useGameSession(): GameState & GameActions {
  const [remaining, setRemaining] = useState<CityCard[]>(() => shuffle(cards));
  const [currentCard, setCurrentCard] = useState<CityCard | null>(() => {
    const shuffled = shuffle(cards);
    setRemaining(shuffled.slice(1));
    return shuffled[0] ?? null;
  });
  const [clueIndex, setClueIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState<number | null>(null);

  const nextClue = useCallback(() => {
    if (revealed) return;
    if (clueIndex < 4) {
      setClueIndex((i) => i + 1);
    } else {
      setRevealed(true);
      setEarnedPoints(0);
    }
  }, [clueIndex, revealed]);

  const correct = useCallback(() => {
    if (revealed) return;
    setRevealed(true);
    setEarnedPoints(5 - clueIndex);
  }, [clueIndex, revealed]);

  const drawNext = useCallback(
    (pool: CityCard[]) => {
      if (pool.length === 0) {
        setCurrentCard(null);
        setRemaining([]);
      } else {
        setCurrentCard(pool[0]);
        setRemaining(pool.slice(1));
      }
      setClueIndex(0);
      setRevealed(false);
      setEarnedPoints(null);
    },
    [],
  );

  const skip = useCallback(() => {
    drawNext(remaining);
  }, [remaining, drawNext]);

  const nextCard = useCallback(() => {
    drawNext(remaining);
  }, [remaining, drawNext]);

  const cardsRemaining = useMemo(
    () => remaining.length + (currentCard ? 1 : 0),
    [remaining.length, currentCard],
  );

  return {
    currentCard,
    clueIndex,
    revealed,
    earnedPoints,
    cardsRemaining,
    nextClue,
    correct,
    skip,
    nextCard,
  };
}
