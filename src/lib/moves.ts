import { moves, offseasonOverviews, type Grade, type Move, type MoveTag } from '../data/moves';
import type { Story } from '../data/types';
import { getStory } from './db';

/*
 * Trades and free agency: helpers for the Moves pages, the Moves tab on team
 * and player pages, and the free agency summer pages. See src/data/moves.ts.
 */

const GRADE_POINTS: Record<Grade, number> = {
  'A+': 12, A: 11, 'A-': 10, 'B+': 9, B: 8, 'B-': 7, 'C+': 6, C: 5, 'C-': 4, 'D+': 3, D: 2, 'D-': 1, F: 0,
};
export const gradePoints = (g: Grade) => GRADE_POINTS[g];

/** Average of the grades a side got at the time, in grade points, or undefined if ungraded. */
export function gradedThen(grades: Grade[] | undefined): number | undefined {
  if (!grades?.length) return undefined;
  return grades.reduce((n, g) => n + GRADE_POINTS[g], 0) / grades.length;
}

/** How far hindsight moved a side's grade: positive = aged better than graded. */
export function swing(side: Move['sides'][number]): number | undefined {
  const then = gradedThen(side.graded);
  return then === undefined ? undefined : GRADE_POINTS[side.hindsight] - then;
}

/** The biggest gap between a grade at the time and the hindsight grade, on any side of the move. */
export function biggestSwing(m: Move): number {
  return Math.max(0, ...m.sides.map((s) => Math.abs(swing(s) ?? 0)));
}

/** A "biggest miss": some side's hindsight grade is more than a full letter away from how it was graded. */
export const isMiss = (m: Move) => biggestSwing(m) >= 4;

/** NBA season a move belongs to, by start year: July to June, so an offseason move counts toward the season ahead. */
export function moveSeason(m: Move): number {
  const y = Number(m.date.slice(0, 4));
  const mo = Number(m.date.slice(5, 7) || '7');
  return mo >= 7 ? y : y - 1;
}

/** The offseason a move happened in (June to October of that year), if any. */
export function offseasonOf(m: Move): number | undefined {
  const mo = Number(m.date.slice(5, 7) || '0');
  return mo >= 6 && mo <= 10 ? Number(m.date.slice(0, 4)) : undefined;
}

export const allMoves = [...moves].sort((a, b) => b.date.localeCompare(a.date));
export const getMove = (id: string) => moves.find((m) => m.id === id);
export const movesForTeam = (team: string) => allMoves.filter((m) => m.sides.some((s) => s.team === team));
export const movesForPlayer = (player: string) => allMoves.filter((m) => m.players.includes(player));
export const movesInSeason = (start: number) => allMoves.filter((m) => moveSeason(m) === start);
export const movesFromSource = (id: string) => allMoves.filter((m) => m.sources.some((c) => c.source === id));

/** Summers that have a free agency page: every offseason with at least one move on file. */
export const offseasons = [...new Set(allMoves.map(offseasonOf).filter((y): y is number => y !== undefined))].sort((a, b) => b - a);
export const movesInOffseason = (year: number) => allMoves.filter((m) => offseasonOf(m) === year).reverse();
export const offseasonOverview = (year: number): string | undefined => offseasonOverviews[year];

export const MOVE_KINDS: Record<Move['kind'], string> = { trade: 'Trade', signing: 'Free agency', 'draft-deal': 'Draft-night deal' };
export const MOVE_TAGS: Record<MoveTag, string> = { blockbuster: 'Blockbuster', deadline: 'Deadline deal' };

export type MoveFilter = 'all' | Move['kind'] | MoveTag | 'misses';
export function matchesFilter(m: Move, f: MoveFilter): boolean {
  if (f === 'all') return true;
  if (f === 'misses') return isMiss(m);
  if (f === 'trade' || f === 'signing' || f === 'draft-deal') return m.kind === f;
  return m.tags.includes(f);
}

/** Related narratives that exist on the site. */
export const relatedStories = (m: Move): Story[] => (m.stories ?? []).map(getStory).filter((s): s is Story => !!s);
