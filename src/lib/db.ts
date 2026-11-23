import { players, teams } from '../data/people';
import { sources } from '../data/sources';
import { stories } from '../data/stories';
import type { Category, Player, Source, Story, Team } from '../data/types';
import { byDate, overlaps, span } from './dates';
import { seasonOf } from './seasons';
import { seasonOverviews, type OverviewKey } from '../data/seasonOverviews';

/*
 * The data layer. Today it reads the starter files in src/data; later it can
 * call a database or API without the pages changing.
 */

export const allStories = [...stories].sort(byDate);
const playerById = new Map(players.map((p) => [p.id, p]));
const teamById = new Map(teams.map((t) => [t.id, t]));
const storyById = new Map(stories.map((s) => [s.id, s]));
const sourceById = new Map(sources.map((s) => [s.id, s]));

export const getPlayer = (id: string): Player | undefined => playerById.get(id);
export const getTeam = (id: string): Team | undefined => teamById.get(id);
export const getStory = (id: string): Story | undefined => storyById.get(id);
export const getSource = (id: string): Source | undefined => sourceById.get(id);
export { players, teams };

/** Newest additions first. */
export const allSources = [...sources].sort((a, b) => b.added.localeCompare(a.added) || a.title.localeCompare(b.title));
export const storiesFromSource = (id: string) => allStories.filter((s) => s.sources?.some((c) => c.source === id));
export const isSourced = (s: Story) => (s.sources?.length ?? 0) > 0;

export const storiesForPlayer = (id: string) => allStories.filter((s) => s.players.includes(id));
export const storiesForTeam = (id: string) => allStories.filter((s) => s.teams.includes(id));
export const storiesBetween = (from: string, to: string) => allStories.filter((s) => overlaps(s, from, to));

/** Moments dated to exactly this day. */
export const momentsOn = (day: string) => allStories.filter((s) => s.precision === 'day' && s.date === day && s.kind === 'moment');

/** Storylines in progress on this day (they started before or on it and haven't ended). */
export const storylinesDuring = (day: string) =>
  allStories.filter((s) => s.kind === 'storyline' && overlaps(s, day, day));

/** Day-precise stories on this month and day in any year, for "On this day". */
export const onThisDay = (month: number, day: number) => {
  const suffix = `-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return allStories.filter((s) => s.precision === 'day' && s.date.endsWith(suffix));
};

export function related(story: Story): Story[] {
  const [a, b] = span(story);
  return allStories
    .filter((s) => s.id !== story.id)
    .map((s) => {
      let score = 0;
      for (const p of s.players) if (story.players.includes(p)) score += 3;
      for (const t of s.teams) if (story.teams.includes(t)) score += 2;
      for (const t of s.tags) if (story.tags.includes(t)) score += 1;
      if (overlaps(s, a, b)) score += 1;
      return { s, score };
    })
    .filter((x) => x.score >= 3)
    .sort((x, y) => y.score - x.score || byDate(x.s, y.s))
    .slice(0, 5)
    .map((x) => x.s);
}

/* NBA seasons and their categories (see lib/seasons.ts). */
export const nbaStories = allStories.filter((s) => s.sport === 'basketball' && s.league === 'NBA');
export const storiesInSeason = (start: number) => nbaStories.filter((s) => seasonOf(s) === start);
export const storiesInCategory = (c: Category) => allStories.filter((s) => s.categories?.includes(c));
export const seasonOverview = (start: number, c: Category): string | undefined => seasonOverviews[`${start}:${c}` as OverviewKey];
