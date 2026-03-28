export interface CityCard {
  /** Unique identifier, e.g. "stockholm", "gothenburg" */
  id: string;
  /** Display name of the city */
  city: string;
  /** Country the city is in */
  country: string;
  /** 5 clues ordered hardest → easiest. Clue 1 is vague, clue 5 is a giveaway. */
  clues: [string, string, string, string, string];
}
