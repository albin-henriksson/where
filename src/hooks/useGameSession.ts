import { useState, useCallback, useMemo } from "react";
import type { CityCard, Difficulty } from "../data/types";
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
  seenCardIds: string[];
}

export interface GameActions {
  nextClue: () => void;
  correct: () => void;
  skip: () => void;
  nextCard: () => void;
  restoreSession: (seenIds: string[], difficulties?: Difficulty[]) => void;
  filterByDifficulty: (difficulties: Difficulty[]) => void;
}

function initDeck() {
  const shuffled = shuffle(cards);
  return { first: shuffled[0] ?? null, rest: shuffled.slice(1) };
}

export function useGameSession(): GameState & GameActions {
  const [{ first, rest }] = useState(initDeck);
  const [remaining, setRemaining] = useState<CityCard[]>(rest);
  const [currentCard, setCurrentCard] = useState<CityCard | null>(first);
  const [clueIndex, setClueIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState<number | null>(null);
  const [seenCardIds, setSeenCardIds] = useState<string[]>([]);

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
    (pool: CityCard[], markCurrentSeen = true) => {
      if (markCurrentSeen) {
        setSeenCardIds((prev) => {
          const cur = currentCard?.id;
          return cur && !prev.includes(cur) ? [...prev, cur] : prev;
        });
      }
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
    [currentCard],
  );

  const skip = useCallback(() => {
    drawNext(remaining);
  }, [remaining, drawNext]);

  const nextCard = useCallback(() => {
    drawNext(remaining);
  }, [remaining, drawNext]);

  const restoreSession = useCallback((seenIds: string[], difficulties?: Difficulty[]) => {
    const seenSet = new Set(seenIds);
    const diffSet = difficulties ? new Set(difficulties) : null;
    const pool = cards.filter((c) => !seenSet.has(c.id) && (!diffSet || diffSet.has(c.difficulty)));
    const unseen = shuffle(pool);
    setSeenCardIds(seenIds);
    if (unseen.length === 0) {
      setCurrentCard(null);
      setRemaining([]);
    } else {
      setCurrentCard(unseen[0]);
      setRemaining(unseen.slice(1));
    }
    setClueIndex(0);
    setRevealed(false);
    setEarnedPoints(null);
  }, []);

  const filterByDifficulty = useCallback((difficulties: Difficulty[]) => {
    const diffSet = new Set(difficulties);
    const pool = shuffle(cards.filter((c) => diffSet.has(c.difficulty)));
    setSeenCardIds([]);
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
  }, []);

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
    seenCardIds,
    nextClue,
    correct,
    skip,
    nextCard,
    restoreSession,
    filterByDifficulty,
  };
}
