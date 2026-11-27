import type { Citation, Precision } from './types';

export type Grade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'F';
export type MoveTag = 'blockbuster' | 'deadline';

/** One team's side of a trade or signing. */
export interface MoveSide {
  /** Team id from people.ts. */
  team: string;
  /** What the team got (or, for the team a free agent left, what it lost). */
  got: string;
  /** Letter grades the move got at the time, one per grader. Empty when nobody graded it. */
  graded?: Grade[];
  /** The site's grade with hindsight, from what actually happened (records and results from Basketball Reference). */
  hindsight: Grade;
  /** One line on why, in hindsight. */
  why: string;
}

/**
 * A trade, free agency signing or draft-night deal, told as the consensus at
 * the time against what happened. Opinions come from articles written that
 * week (exact quotes kept in `sources`, never shown); facts are checked on
 * basketball-reference.com.
 */
export interface Move {
  id: string;
  kind: 'trade' | 'signing' | 'draft-deal';
  date: string;
  precision: Precision;
  title: string;
  /** The deal itself, in one sentence. */
  deal: string;
  tags: MoveTag[];
  players: string[];
  sides: MoveSide[];
  /** What people said at the time: the consensus, the grades, the doubts. */
  then: string;
  /** What actually happened. */
  happened: string;
  /** Ripple effects, season by season: [season label, what came of it]. */
  ripples: [string, string][];
  /** Narratives on the site this move connects to (story ids). */
  stories?: string[];
  sources: Citation[];
}
