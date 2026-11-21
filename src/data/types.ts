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
  /** Where this narrative comes from. A story with none is still a draft. */
  sources?: Citation[];
}

/** A video, podcast, article or book that narratives are drawn from. */
export interface Source {
  id: string;
  kind: 'video' | 'podcast' | 'article' | 'book';
  title: string;
  /** Channel, show, publication or author. */
  outlet: string;
  /** Where to watch, listen or read it. */
  url?: string;
  /** When it came out, YYYY-MM-DD (or YYYY-MM / YYYY if that is all we know). */
  published?: string;
  /** When it was added to the site, YYYY-MM-DD. */
  added: string;
  /** One or two sentences on what it covers. */
  about: string;
  /** Transcript or notes kept in the repo, e.g. sources/transcripts/<id>.md. */
  transcript?: string;
}

/** A pointer from a narrative to the exact place in a source that backs it up. */
export interface Citation {
  source: string;
  /** Timestamp in the video or episode: M:SS or H:MM:SS. */
  at?: string;
  /** Page or section, for articles and books. */
  page?: string;
  /** A short quote that supports the narrative. */
  quote?: string;
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
