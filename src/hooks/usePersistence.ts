const STORAGE_KEY = "where-game-state";

interface PersistedState {
  mode: "freeplay" | "competition";
  players: { id: string; name: string; score: number }[];
  seenCardIds: string[];
  readerIndex: number;
  timestamp: number;
}

export function saveGameState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be unavailable
  }
}

export function loadGameState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as PersistedState;
    // Expire after 24 hours
    if (Date.now() - state.timestamp > 24 * 60 * 60 * 1000) {
      clearGameState();
      return null;
    }
    return state;
  } catch {
    return null;
  }
}

export function clearGameState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
