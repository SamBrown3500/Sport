import { bbref, type BBSeason, type Series } from '../data/bbref';

/*
 * Season facts from Basketball Reference (src/data/bbref.ts) and the few
 * things worked out from them for the Surprises section: playoff upsets by
 * regular-season record, and the biggest jumps and drops from the season before.
 */

export const bbSeason = (start: number): BBSeason | undefined => bbref[start];

const BR = 'https://www.basketball-reference.com';
const lg = (endYear: number) => (endYear <= 1949 ? 'BAA' : 'NBA');
export const bbLinks = (start: number) => ({
  league: `${BR}/leagues/${lg(start + 1)}_${start + 1}.html`,
  awards: `${BR}/awards/awards_${start + 1}.html`,
  draft: `${BR}/draft/${start <= 1949 ? 'BAA' : 'NBA'}_${start}.html`,
});

export interface TeamRecord { team: string; wins: number; losses: number; pct: number; playoffs: boolean }

/** Every team's regular-season record, by name. */
export function records(start: number): Map<string, TeamRecord> {
  const m = new Map<string, TeamRecord>();
  for (const group of bbref[start]?.standings ?? []) {
    for (const row of group) {
      if (typeof row === 'string') continue;
      const [team, wins, losses, playoffs] = row;
      m.set(team, { team, wins, losses, pct: wins / (wins + losses || 1), playoffs: playoffs === 1 });
    }
  }
  return m;
}

export interface Upset { series: Series; winner: TeamRecord; loser: TeamRecord }

/** Series won by the team with the worse regular-season record (tiebreaker games left out). */
export function upsets(start: number): Upset[] {
  const rec = records(start);
  const out: Upset[] = [];
  for (const s of bbref[start]?.playoffs ?? []) {
    if (/tiebreaker/i.test(s[0])) continue;
    const w = rec.get(s[1]);
    const l = rec.get(s[2]);
    if (w && l && w.pct < l.pct) out.push({ series: s, winner: w, loser: l });
  }
  return out;
}

export interface Swing { now: TeamRecord; before: TeamRecord; change: number }

/**
 * Change in wins from the season before, scaled to this season's schedule so
 * short seasons compare fairly. Teams that moved or were renamed are left out,
 * because the records are matched by name.
 */
export function swings(start: number): { up: Swing[]; down: Swing[] } {
  const now = records(start);
  const before = records(start - 1);
  const all: Swing[] = [];
  for (const r of now.values()) {
    const b = before.get(r.team);
    if (!b) continue;
    all.push({ now: r, before: b, change: Math.round((r.pct - b.pct) * (r.wins + r.losses)) });
  }
  all.sort((a, b) => b.change - a.change);
  return {
    up: all.filter((s) => s.change > 0).slice(0, 3),
    down: all.filter((s) => s.change < 0).reverse().slice(0, 3),
  };
}
