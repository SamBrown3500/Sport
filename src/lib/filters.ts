import type { NotionVerdict } from '../data/notions';
import type { Source, Story } from '../data/types';
import { allSources, getSource } from './db';
import { notionFor } from './notions';
import { normalize } from './search';

/*
 * Filters for predictions and sources (gam, 2026-11-27): show only the
 * predictions that busted or held, and narrow any list to one source or
 * outlet ("everything from the GM Survey", "everything from Wikipedia").
 */

/** A verdict filter: one verdict, every story with a notion, or stories without one. */
export type VerdictFilter = NotionVerdict | 'all' | 'none';

export function verdictOf(story: Story): NotionVerdict | undefined {
  return notionFor(story)?.[2];
}

export function matchesVerdict(story: Story, f: VerdictFilter): boolean {
  if (f === 'all') return true;
  const v = verdictOf(story);
  return f === 'none' ? !v : v === f;
}

/**
 * The outlet a source is grouped under: its outlet without the bracketed
 * detail, so "NBA.com (John Schuhmann)" and "NBA.com" are one group.
 */
export const outletOf = (src: Source): string => src.outlet.replace(/\s*\(.*\)\s*$/, '').trim() || src.outlet;

/** Outlet ids are the outlet name, normalized, so they can sit in a link. */
export const outletId = (name: string) => normalize(name).replace(/ /g, '-');

export interface Outlet { id: string; name: string; sources: Source[] }

/** Every outlet with its sources, biggest first. */
export const outlets: Outlet[] = (() => {
  const by = new Map<string, Outlet>();
  for (const src of allSources) {
    const name = outletOf(src);
    const id = outletId(name);
    if (!by.has(id)) by.set(id, { id, name, sources: [] });
    by.get(id)!.sources.push(src);
  }
  return [...by.values()].sort((a, b) => b.sources.length - a.sources.length || a.name.localeCompare(b.name));
})();

/** A source filter: 'all', an outlet ('outlet:<id>') or one source ('source:<id>'). */
export type SourceFilter = string;

export function storyOutlets(story: Story): string[] {
  const ids = new Set<string>();
  for (const c of story.sources ?? []) {
    const src = getSource(c.source);
    if (src) ids.add(outletId(outletOf(src)));
  }
  return [...ids];
}

export function matchesSource(story: Story, f: SourceFilter): boolean {
  if (f === 'all') return true;
  if (f === 'unsourced') return !(story.sources?.length);
  if (f.startsWith('outlet:')) return storyOutlets(story).includes(f.slice(7));
  if (f.startsWith('source:')) return !!story.sources?.some((c) => c.source === f.slice(7));
  return true;
}

/** Outlets that appear in a list of stories, with how many stories each backs. */
export function outletsIn(list: Story[]): { outlet: Outlet; count: number }[] {
  const counts = new Map<string, number>();
  for (const s of list) for (const o of storyOutlets(s)) counts.set(o, (counts.get(o) ?? 0) + 1);
  return outlets.filter((o) => counts.has(o.id)).map((o) => ({ outlet: o, count: counts.get(o.id)! }))
    .sort((a, b) => b.count - a.count || a.outlet.name.localeCompare(b.outlet.name));
}

/** Text filter for a list of sources: title, outlet and description. */
export function sourceMatches(src: Source, q: string): boolean {
  const words = normalize(q).split(' ').filter(Boolean);
  if (!words.length) return true;
  const hay = normalize(`${src.title} ${src.outlet} ${src.about}`).split(' ');
  return words.every((w) => hay.some((h) => h.startsWith(w)));
}
