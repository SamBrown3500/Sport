/** 'Pre-league' covers pro and college play before the NFL (1920) and BAA/NBA (1946). */
export type League = 'NFL' | 'NBA' | 'AFL' | 'ABA' | 'Pre-league';
export type Sport = 'football' | 'basketball';

/** How exactly a date is known. Old sources often only give a month or a season. */
export type Precision = 'day' | 'month' | 'year';

export interface Story {
  id: string;
  /** A moment happens on one date; a storyline runs across a span. */
  kind: 'moment' | 'storyline';
  title: string;
  sport: Sport;
  league: League;
  /** ISO date at the given precision: YYYY-MM-DD, YYYY-MM or YYYY. */
  date: string;
  /** Storylines only: when the story ends, same format as `date`. */
  end?: string;
  precision: Precision;
  summary: string;
  players: string[];
  teams: string[];
  tags: string[];
  /** Other names people search for, e.g. "Ice Bowl". */
  aliases?: string[];
}

export interface Player {
  id: string;
  name: string;
  league: League;
  aliases?: string[];
}

export interface Team {
  id: string;
  name: string;
  league: League;
  aliases?: string[];
}
