import { describe, expect, it } from 'vitest';
import { bbref } from '../data/bbref';
import { upsets, swings } from './bbref';
import { mvpCases } from './mvp';
import { mvpRace } from '../data/mvpRace';

describe('Basketball Reference season data', () => {
  it('has standings and a Finals for every finished season', () => {
    for (let s = 1946; s <= 2025; s++) {
      expect(bbref[s]?.standings?.length, `standings ${s}`).toBeGreaterThan(0);
      expect(bbref[s]?.playoffs?.some((p) => p[0] === 'Finals'), `Finals ${s}`).toBe(true);
    }
  });
  it('has MVP voting from 1955-56 and a draft every year', () => {
    for (let s = 1955; s <= 2025; s++) expect(bbref[s]?.mvp?.[0]?.[0], `mvp ${s}`).toBe('1');
    for (let s = 1947; s <= 2026; s++) expect(bbref[s]?.draft?.length, `draft ${s}`).toBeGreaterThan(0);
  });
  it('finds known upsets and swings', () => {
    expect(upsets(2010).some((u) => u.winner.team === 'Memphis Grizzlies')).toBe(true);
    expect(swings(2007).up[0].now.team).toBe('Boston Celtics');
  });
});


describe('MVP race cards', () => {
  it('has three candidates with a case for every season from 1955-56', () => {
    for (let s = 1955; s <= 2025; s++) {
      const cases = mvpCases(s);
      expect(cases.length, `season ${s}`).toBe(3);
      expect(cases[0].result.startsWith('Won'), `winner ${s}`).toBe(true);
      for (const c of cases) expect(c.points.length, `${s} ${c.candidate.player}`).toBeGreaterThan(0);
    }
  });
  it('agrees with the voting table on the winner', () => {
    for (const [s, race] of Object.entries(mvpRace)) expect(race.top3[0].player).toBe(bbrefWinner(+s));
  });
});

const bbrefWinner = (s: number) => bbref[s]?.mvp?.[0]?.[1];
