import type { Player, Story, Team } from '../data/types';
import { allStories, getPlayer, getTeam, onThisDay, players, storiesBetween, teams } from './db';
import { byDate, parseDateQuery, queryRange, type DateQuery } from './dates';

export interface SearchResult {
  date: DateQuery | null;
  players: Player[];
  teams: Team[];
  /** Every matching narrative, oldest first. */
  stories: Story[];
}

export const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

const words = (s: string) => normalize(s).split(' ').filter(Boolean);

/** True when every word of the query starts some word in the text ("russ" finds "Bill Russell"). */
function matches(query: string[], text: string): boolean {
  const hay = words(text);
  return query.every((q) => hay.some((w) => w.startsWith(q)));
}

const nameMatches = (q: string[], name: string, aliases: string[] = []) =>
  [name, ...aliases].some((n) => matches(q, n));

export function search(raw: string): SearchResult {
  const empty: SearchResult = { date: null, players: [], teams: [], stories: [] };
  if (!raw.trim()) return empty;

  const date = parseDateQuery(raw);
  if (date) {
    const range = queryRange(date);
    const found = range
      ? storiesBetween(range[0], range[1])
      : date.kind === 'monthday' ? onThisDay(date.month, date.day) : [];
    return { ...empty, date, stories: found };
  }

  const q = words(raw);
  if (!q.length) return empty;

  const foundPlayers = players.filter((p) => nameMatches(q, p.name, p.aliases));
  const foundTeams = teams.filter((t) => nameMatches(q, t.name, t.aliases));
  const pIds = new Set(foundPlayers.map((p) => p.id));
  const tIds = new Set(foundTeams.map((t) => t.id));

  const found = allStories.filter((s) => {
    if (s.players.some((p) => pIds.has(p)) || s.teams.some((t) => tIds.has(t))) return true;
    const text = [
      s.title, s.summary, s.league, s.sport, ...s.tags, ...(s.aliases ?? []),
      ...s.players.map((p) => getPlayer(p)?.name ?? ''),
      ...s.teams.map((t) => getTeam(t)?.name ?? ''),
    ].join(' ');
    return matches(q, text);
  });

  return { date: null, players: foundPlayers, teams: foundTeams, stories: found.sort(byDate) };
}
