import { bbref, type Series } from '../data/bbref';
import { franchises, nameMatches } from '../data/franchises';
import type { Story } from '../data/types';
import { seasonOf } from './seasons';

/*
 * A franchise season by season: its name, record and how the season ended,
 * from the Basketball Reference snapshot in src/data/bbref.ts, lined up with
 * the narratives from that season. Nothing here is typed in by hand.
 */

export interface TeamSeason {
  season: number;
  /** The name the franchise played under that season (absent before it joined). */
  name?: string;
  wins?: number;
  losses?: number;
  playoffs?: boolean;
  /** Plain-language finish, e.g. "Won title", "Lost West Semifinals", "Missed playoffs". */
  finish?: string;
  champion?: boolean;
  stories: Story[];
}

/** The latest season in the Basketball Reference snapshot. */
export const LAST_BBREF_SEASON = Math.max(...Object.keys(bbref).map(Number));

const ROUND_RANK = (round: string) =>
  round === 'Finals' ? 5
    : /Tiebreaker/.test(round) ? 0
      : /Conference Finals|Division Finals/.test(round) ? 4
        : /Semifinals/.test(round) && round !== 'Semifinals' ? 3
          : round === 'Semifinals' ? 4
            : 2;

/** "Western Conference Semifinals" reads as "West Semifinals". */
export const shortRound = (round: string) =>
  round.replace('Eastern Conference', 'East').replace('Western Conference', 'West')
    .replace('Eastern Division', 'East Div.').replace('Western Division', 'West Div.').replace('Central Division', 'Central Div.');

function finishOf(name: string, playoffs: boolean, series: Series[]): { finish: string; champion: boolean } {
  const mine = series.filter((s) => s[1] === name || s[2] === name).sort((a, b) => ROUND_RANK(b[0]) - ROUND_RANK(a[0]));
  const top = mine[0];
  if (!top) return { finish: playoffs ? 'Made playoffs' : 'Missed playoffs', champion: false };
  if (top[0] === 'Finals' && top[1] === name) return { finish: 'Won title', champion: true };
  if (top[1] === name) return { finish: `Won ${shortRound(top[0])}`, champion: false };
  return { finish: `Lost ${shortRound(top[0])}`, champion: false };
}

export function teamSeasons(teamId: string, stories: Story[]): TeamSeason[] {
  const f = franchises[teamId];
  const bySeason = new Map<number, Story[]>();
  for (const s of stories) if (s.league === 'NBA') bySeason.set(seasonOf(s), [...(bySeason.get(seasonOf(s)) ?? []), s]);
  const rows = new Map<number, TeamSeason>();
  if (f) {
    for (const [key, bb] of Object.entries(bbref)) {
      const season = Number(key);
      for (const group of bb.standings ?? []) {
        for (const row of group) {
          if (typeof row === 'string' || !nameMatches(f, row[0], season)) continue;
          const [name, wins, losses, po] = row;
          if (wins + losses === 0) continue; // folded before playing, e.g. the 1954 Bullets
          rows.set(season, { season, name, wins, losses, playoffs: po === 1, ...finishOf(name, po === 1, bb.playoffs ?? []), stories: [] });
        }
      }
    }
  }
  for (const [season, list] of bySeason) {
    const row = rows.get(season) ?? { season, stories: [] };
    row.stories = list;
    rows.set(season, row);
  }
  return [...rows.values()].sort((a, b) => b.season - a.season);
}

/** Seasons played, titles and playoff trips, from the same snapshot. */
export function franchiseTotals(rows: TeamSeason[]) {
  const played = rows.filter((r) => r.wins !== undefined);
  return {
    seasons: played.length,
    titles: played.filter((r) => r.champion).map((r) => r.season),
    playoffs: played.filter((r) => r.playoffs).length,
    wins: played.reduce((n, r) => n + (r.wins ?? 0), 0),
    losses: played.reduce((n, r) => n + (r.losses ?? 0), 0),
  };
}

/** Every name a franchise has played under, with the seasons it used each one. */
export function nameHistory(rows: TeamSeason[]): { name: string; from: number; to: number }[] {
  const out: { name: string; from: number; to: number }[] = [];
  for (const r of [...rows].sort((a, b) => a.season - b.season)) {
    if (!r.name) continue;
    const last = out[out.length - 1];
    if (last && last.name === r.name) last.to = r.season;
    else out.push({ name: r.name, from: r.season, to: r.season });
  }
  return out;
}
