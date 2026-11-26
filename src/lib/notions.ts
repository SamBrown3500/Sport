import { notions, type Notion, type NotionVerdict } from '../data/notions';
import { takes } from '../data/takes';
import type { Story } from '../data/types';

/* Preconceived notions (src/data/notions.ts), looked up by story. */

export const notionFor = (story: Story | string): Notion | undefined =>
  notions[typeof story === 'string' ? story : story.id];

/** The one-line take (expected, then what happened) for a story, if it has one. */
export const takeFor = (story: Story | string): string | undefined =>
  takes[typeof story === 'string' ? story : story.id];

/** What lists show for a story: its take, or its title when it is only an event. */
export const headline = (story: Story): string => takes[story.id] ?? story.title;

export interface StoryNotion { story: Story; expected: string; happened: string; verdict: NotionVerdict }

/** The stories in a list that have a notion, in the list's order. */
export function notionsIn(list: Story[]): StoryNotion[] {
  const out: StoryNotion[] = [];
  for (const story of list) {
    const n = notions[story.id];
    if (n) out.push({ story, expected: n[0], happened: n[1], verdict: n[2] });
  }
  return out;
}

/** How many of a list's notions held, busted, were mixed or are open. */
export function verdictCounts(list: StoryNotion[]): Record<NotionVerdict, number> {
  const c: Record<NotionVerdict, number> = { held: 0, busted: 0, mixed: 0, open: 0 };
  for (const n of list) c[n.verdict]++;
  return c;
}
