import type { Story } from '../data/types';

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const FIRST_YEAR = 1900;

const pad = (n: number) => String(n).padStart(2, '0');

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Expands a partial date (YYYY, YYYY-MM, YYYY-MM-DD) to its first or last day. */
export function expand(date: string, edge: 'start' | 'end'): string {
  const [y, m, d] = date.split('-').map(Number);
  if (d) return `${y}-${pad(m)}-${pad(d)}`;
  if (m) return edge === 'start' ? `${y}-${pad(m)}-01` : `${y}-${pad(m)}-${pad(daysInMonth(y, m))}`;
  return edge === 'start' ? `${y}-01-01` : `${y}-12-31`;
}

/** The full span of days a story covers, as ISO strings (they sort correctly). */
export function span(story: Story): [string, string] {
  return [expand(story.date, 'start'), expand(story.end ?? story.date, 'end')];
}

export function overlaps(story: Story, from: string, to: string): boolean {
  const [a, b] = span(story);
  return a <= to && b >= from;
}

export function yearOf(story: Story): number {
  return Number(story.date.slice(0, 4));
}

export function byDate(a: Story, b: Story): number {
  return span(a)[0].localeCompare(span(b)[0]) || a.title.localeCompare(b.title);
}

/** Human-readable date, honest about how precise it is. */
export function formatDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  if (d) return `${MONTHS[m - 1]} ${d}, ${y}`;
  if (m) return `${MONTHS[m - 1]} ${y}`;
  return String(y);
}

export function formatSpan(story: Story): string {
  if (!story.end) return formatDate(story.date);
  return `${formatDate(story.date)} – ${formatDate(story.end)}`;
}

/** Parses things people type: 1962, 1960s, March 1962, March 2 1962, 3/2/1962, 1962-03-02. */
export type DateQuery =
  | { kind: 'decade'; decade: number }
  | { kind: 'year'; year: number }
  | { kind: 'month'; year: number; month: number }
  | { kind: 'day'; year: number; month: number; day: number }
  | { kind: 'monthday'; month: number; day: number };

export function parseDateQuery(raw: string): DateQuery | null {
  const q = raw.trim().toLowerCase().replace(/,/g, ' ').replace(/\s+/g, ' ');
  let m: RegExpMatchArray | null;
  const valid = (y: number) => y >= FIRST_YEAR && y <= 2100;
  const monthIdx = (name: string) => {
    const i = MONTHS.findIndex((n) => n.toLowerCase().startsWith(name.slice(0, 3)));
    return name.length >= 3 && i >= 0 ? i + 1 : 0;
  };
  const dayOk = (y: number, mo: number, d: number) => mo >= 1 && mo <= 12 && d >= 1 && d <= daysInMonth(y, mo);

  if ((m = q.match(/^(\d{3})0'?s$/))) return { kind: 'decade', decade: Number(m[1]) * 10 };
  if ((m = q.match(/^(\d{4})$/)) && valid(+m[1])) return { kind: 'year', year: +m[1] };
  if ((m = q.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)) && valid(+m[1]) && dayOk(+m[1], +m[2], +m[3]))
    return { kind: 'day', year: +m[1], month: +m[2], day: +m[3] };
  if ((m = q.match(/^(\d{4})-(\d{1,2})$/)) && valid(+m[1]) && +m[2] >= 1 && +m[2] <= 12)
    return { kind: 'month', year: +m[1], month: +m[2] };
  if ((m = q.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)) && valid(+m[3]) && dayOk(+m[3], +m[1], +m[2]))
    return { kind: 'day', year: +m[3], month: +m[1], day: +m[2] };
  if ((m = q.match(/^([a-z]+)\.? (\d{1,2})(?:st|nd|rd|th)? (\d{4})$/))) {
    const mo = monthIdx(m[1]);
    if (mo && valid(+m[3]) && dayOk(+m[3], mo, +m[2])) return { kind: 'day', year: +m[3], month: mo, day: +m[2] };
  }
  if ((m = q.match(/^(\d{1,2}) ([a-z]+)\.? (\d{4})$/))) {
    const mo = monthIdx(m[2]);
    if (mo && valid(+m[3]) && dayOk(+m[3], mo, +m[1])) return { kind: 'day', year: +m[3], month: mo, day: +m[1] };
  }
  if ((m = q.match(/^([a-z]+)\.? (\d{4})$/))) {
    const mo = monthIdx(m[1]);
    if (mo && valid(+m[2])) return { kind: 'month', year: +m[2], month: mo };
  }
  if ((m = q.match(/^([a-z]+)\.? (\d{1,2})(?:st|nd|rd|th)?$/))) {
    const mo = monthIdx(m[1]);
    if (mo && dayOk(2000, mo, +m[2])) return { kind: 'monthday', month: mo, day: +m[2] };
  }
  return null;
}

/** The first and last day a date query covers (null for "every March 2"). */
export function queryRange(q: DateQuery): [string, string] | null {
  switch (q.kind) {
    case 'decade': return [`${q.decade}-01-01`, `${q.decade + 9}-12-31`];
    case 'year': return [`${q.year}-01-01`, `${q.year}-12-31`];
    case 'month': return [expand(`${q.year}-${pad(q.month)}`, 'start'), expand(`${q.year}-${pad(q.month)}`, 'end')];
    case 'day': { const d = `${q.year}-${pad(q.month)}-${pad(q.day)}`; return [d, d]; }
    default: return null;
  }
}

export const iso = (y: number, m: number, d?: number) => (d ? `${y}-${pad(m)}-${pad(d)}` : `${y}-${pad(m)}`);
