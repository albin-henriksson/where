export type Difficulty = 1 | 2 | 3;

export interface CityCard {
  /** Unique identifier, e.g. "stockholm", "gothenburg" */
  id: string;
  /** Display name of the city */
  city: string;
  /** Country the city is in */
  country: string;
  /** 1 = easy (well-known), 2 = medium, 3 = hard (obscure) */
  difficulty: Difficulty;
  /** 5 clues ordered hardest → easiest. Clue 1 is vague, clue 5 is a giveaway. */
  clues: [string, string, string, string, string];
  /** URL to an image shown as the 3rd clue (replaces text clue at index 2). */
  imageUrl?: string;
}

export type GameMode = "freeplay" | "competition";

export interface Player {
  id: string;
  name: string;
  score: number;
}
