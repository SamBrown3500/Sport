import type { NotionVerdict } from '../data/notions';
import type { Category, Source, Story } from '../data/types';
import { getSource, nbaStories } from './db';
import { outletOf } from './filters';
import { notionsIn, type StoryNotion } from './notions';

/*
 * Hot takes tracker (sample, gam 2026-11-27): how often the calls made AT THE
 * TIME came true, grouped by who made them. A call counts for a voice only when
 * one of its sources came out on or before the narrative's date, so a history
 * video looking back never gets credit for a call it didn't make. The verdict
 * is the notion's (src/data/notions.ts); nothing is scored by hand.
 */

export interface Voice {
  id: string;
  name: string;
  /** One line on what calls this voice made. */
  about: string;
  match: (src: Source) => boolean;
}

const isGmSurvey = (s: Source) => /GM Survey/.test(s.title);
const isSI = (s: Source) => outletOf(s) === 'Sports Illustrated';
const REPORTERS = new Set(['Associated Press', 'ESPN', 'CBS Sports', 'CBS News', 'NBC Sports']);

export const VOICES: Voice[] = [
  { id: 'gms', name: 'League GMs', about: 'Preseason picks for the title, MVP, rookies and surprises, voted by the general managers.', match: isGmSurvey },
  { id: 'si', name: 'Sports Illustrated', about: 'Magazine previews, midseason pieces and draft grades.', match: isSI },
  { id: 'reporters', name: 'Draft-night and trade-day reporting', about: 'Wire and network stories written the day a pick or trade happened.', match: (s) => s.kind === 'article' && REPORTERS.has(outletOf(s)) },
  { id: 'analysts', name: 'YouTube analysts', about: 'In-season and reaction videos recorded before the outcome was known.', match: (s) => s.kind === 'video' || s.kind === 'podcast' },
];

/** Came out on or before the story's date. Videos need at least a month to count. */
function atTheTime(src: Source, story: Story): boolean {
  const p = src.published;
  if (!p) return false;
  if (src.kind !== 'article' && p.length < 7) return false;
  const n = Math.min(p.length, story.date.length);
  return p.slice(0, n) <= story.date.slice(0, n);
}

export interface Score {
  calls: StoryNotion[];
  held: number; busted: number; mixed: number; open: number;
  /** Held, plus half credit for partly right, over every decided call. Undefined with none decided. */
  rate?: number;
}

export function score(calls: StoryNotion[]): Score {
  const c: Record<NotionVerdict, number> = { held: 0, busted: 0, mixed: 0, open: 0 };
  for (const n of calls) c[n.verdict]++;
  const decided = c.held + c.busted + c.mixed;
  return { calls, ...c, rate: decided ? (c.held + c.mixed / 2) / decided : undefined };
}

const allNotions = notionsIn(nbaStories);

/** The calls a voice made at the time, newest first. */
export function callsBy(voice: Voice): StoryNotion[] {
  return allNotions.filter((n) => (n.story.sources ?? []).some((c) => {
    const src = getSource(c.source);
    return !!src && voice.match(src) && atTheTime(src, n.story);
  })).sort((a, b) => b.story.date.localeCompare(a.story.date));
}

/** Every notion on file: the consensus as the narratives describe it. */
export const consensusCalls = allNotions;

export const byCategory = (calls: StoryNotion[], c: Category) => calls.filter((n) => n.story.categories?.includes(c));

export const pct = (r?: number) => (r === undefined ? '—' : `${Math.round(r * 100)}%`);
