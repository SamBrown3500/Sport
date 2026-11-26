import type { Story } from '../data/types';
import { notions } from '../data/notions';

/*
 * How big a story is, for sorting decade pages "by most important" (gam,
 * 2026-11-26). A plain score from what the data already says: titles,
 * league-changing events and MVPs count most, then how hard the story broke
 * the consensus, how many years it ran and how many stars it involved.
 */

const TAG_WEIGHT: Record<string, number> = {
  championships: 6, dynasties: 6, 'league history': 6, founding: 6, mergers: 5, 'rival leagues': 3,
  expansion: 3, 'rule changes': 4, lockouts: 4, pandemic: 4, tragedies: 4, Finals: 4, 'Finals MVP': 2,
  MVP: 4, superteams: 4, upsets: 3, records: 3, comebacks: 3, collapses: 3, 'what-ifs': 2, rivalries: 2,
  trades: 2, 'free agency': 2, steals: 2, busts: 2, lottery: 2, relocation: 2, scandals: 2,
  draft: 1, playoffs: 1, injuries: 1, awards: 1, controversies: 1, retirements: 1,
};
/** Stories everyone remembers the decade by: they jump to the top. */
export const LANDMARKS = new Set([
  'baa-founded', 'nba-formed', 'nba-integration', 'shot-clock', 'russell-trade', 'mikan-lakers-dynasty', 'celtics-eight',
  'wilt-100', 'russell-last-title', 'willis-reed-game-7-1970', 'aba-merger', 'three-pointer', 'magic-bird-era',
  'magic-game-6-1980', 'showtime-riley-titles', 'jordan-drafted', 'len-bias-death', 'bad-boys-pistons-titles',
  'bulls-dynasty', 'bulls-first-title', 'magic-hiv', 'dream-team', 'jordan-retires', 'jordan-returns-im-back', 'im-back',
  'spurs-win-duncan-lottery', 'last-shot', 'lockout-1999', 'lakers-three-peat', 'lebron-drafted', 'malice-palace',
  'kobe-81', 'celtics-win-2008-title', 'the-decision', 'heat-big-three-formed', 'linsanity', 'warriors-73-9',
  'cavs-comeback', 'durant-leaves-for-warriors', 'kobe-dies', 'nba-suspends', 'nba-bubble', 'mavs-trade-luka-2025',
  'thunder-win-2025-title', 'knicks-win-2026-title',
]);
const VERDICT_WEIGHT = { busted: 3, mixed: 1.5, held: 1, open: 0 } as const;

/** `from` is the first year of the page asking: stories carried over from before it count less there. */
export function importance(s: Story, from?: number): number {
  let score = LANDMARKS.has(s.id) ? 14 : 0;
  for (const t of s.tags) score += TAG_WEIGHT[t] ?? 0;
  const n = notions[s.id];
  if (n) score += VERDICT_WEIGHT[n[2]];
  if (s.kind === 'storyline') score += 3;
  if (s.sources?.length) score += 1;
  score += Math.min(s.players.length, 4) * 0.25;
  if (from !== undefined && Number(s.date.slice(0, 4)) < from) score -= 15;
  return score;
}

/** Most important first; ties go to the earlier story. */
export const byImportance = (from?: number) => (a: Story, b: Story) =>
  importance(b, from) - importance(a, from) || a.date.localeCompare(b.date);
