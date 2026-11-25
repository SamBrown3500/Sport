import type { Category, Story } from '../data/types';

/*
 * NBA seasons and the four season-page categories.
 *
 * A season is named by the year it starts: 2014 is the 2014-15 season. It runs
 * from July of that year to the end of the next June, so the Finals in June
 * close out a season and the July free agency period opens the next one.
 * The draft is the exception: a Draft Drama story from the spring lottery or a
 * June draft belongs to the season that draft class plays its first year in.
 */

export const CATEGORIES: { id: Category; name: string; blurb: string }[] = [
  { id: 'mvp-race', name: 'MVP Race', blurb: 'Who was supposed to win MVP, who did, and why one player got it over another.' },
  { id: 'draft-drama', name: 'Draft Drama', blurb: 'Lotteries, draft nights and the picks people called reaches, busts or steals at the time, against how they turned out.' },
  { id: 'contenders', name: 'Contenders', blurb: 'The favorites: who was expected to win it all, how analysts saw the big series going, and what happened instead.' },
  { id: 'surprises', name: 'Surprises', blurb: 'Upsets, runs nobody predicted, collapses and shocks that broke the consensus.' },
];
export const categoryInfo = (id: string) => CATEGORIES.find((c) => c.id === id);
export const isCategory = (id: string): id is Category => CATEGORIES.some((c) => c.id === id);

/** The BAA's first season, which the NBA counts as its own. */
export const FIRST_SEASON = 1946;

/** The first season with a league MVP award (1955-56). */
export const FIRST_MVP_SEASON = 1955;

export const seasonLabel = (start: number) => `${start}-${String((start + 1) % 100).padStart(2, '0')}`;

/** The season a basketball story belongs to, by its start date. */
export function seasonOf(story: Story): number {
  if (story.season !== undefined) return story.season;
  const [y, m] = story.date.split('-').map(Number);
  if (!m) return y - 1; // a year-only date is most often about that spring's playoffs
  const draftSpring = story.categories?.[0] === 'draft-drama' && m >= 4 && m <= 6;
  return m >= 7 || draftSpring ? y : y - 1;
}

/** The seasons that overlap a calendar year: the one ending in it and the one starting in it. */
export const seasonsInYear = (year: number) => [year - 1, year].filter((s) => s >= FIRST_SEASON);

/** The season being played now (or the one about to start, in the summer). */
export function currentSeason(now = new Date()): number {
  return now.getMonth() + 1 >= 7 ? now.getFullYear() : now.getFullYear() - 1;
}
