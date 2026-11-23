import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { sources } from './sources';
import { players, teams } from './people';
import { stories } from './stories';
import { span } from '../lib/dates';

describe('starter data', () => {
  const pIds = new Set(players.map((p) => p.id));
  const tIds = new Set(teams.map((t) => t.id));

  it('has unique story ids', () => expect(new Set(stories.map((s) => s.id)).size).toBe(stories.length));
  it('has unique player and team ids', () => {
    expect(pIds.size).toBe(players.length);
    expect(tIds.size).toBe(teams.length);
  });
  it('links only to known players and teams', () => {
    for (const s of stories) {
      for (const p of s.players) expect(pIds, `${s.id} -> ${p}`).toContain(p);
      for (const t of s.teams) expect(tIds, `${s.id} -> ${t}`).toContain(t);
    }
  });
  it('has dates that match their precision and end after they start', () => {
    const shape = { day: /^\d{4}-\d{2}-\d{2}$/, month: /^\d{4}-\d{2}$/, year: /^\d{4}$/ };
    for (const s of stories) {
      expect(s.date, s.id).toMatch(shape[s.precision]);
      const [a, b] = span(s);
      expect(a <= b, s.id).toBe(true);
      expect(Number(s.date.slice(0, 4)), s.id).toBeGreaterThanOrEqual(1940);
    }
  });
});

describe('sources', () => {
  const srcIds = new Set(sources.map((s) => s.id));
  it('has unique source ids', () => expect(srcIds.size).toBe(sources.length));
  it('has sources with valid dates and links', () => {
    for (const s of sources) {
      expect(s.added, s.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (s.published) expect(s.published, s.id).toMatch(/^\d{4}(-\d{2}){0,2}$/);
      if (s.url) expect(() => new URL(s.url!), s.id).not.toThrow();
      if (s.transcript) expect(existsSync(resolve(process.cwd(), s.transcript)), `${s.id} transcript`).toBe(true);
    }
  });
  it('cites only known sources, with well-formed timestamps', () => {
    for (const st of stories) {
      for (const c of st.sources ?? []) {
        expect(srcIds, `${st.id} -> ${c.source}`).toContain(c.source);
        if (c.at) expect(c.at, st.id).toMatch(/^\d{1,2}(:\d{2}){1,2}$/);
      }
    }
  });
});

describe('season categories', () => {
  it('uses only known categories, once each, on NBA stories', async () => {
    const { isCategory } = await import('../lib/seasons');
    for (const s of stories) {
      for (const c of s.categories ?? []) expect(isCategory(c), `${s.id} -> ${c}`).toBe(true);
      if (s.categories) {
        expect(new Set(s.categories).size, s.id).toBe(s.categories.length);
        expect(s.league, s.id).toBe('NBA');
      }
    }
  });
  it('puts stories in the right season', async () => {
    const { seasonOf } = await import('../lib/seasons');
    const byId = (id: string) => stories.find((s) => s.id === id)!;
    expect(seasonOf(byId('durant-mvp-2014'))).toBe(2013); // May 2014 MVP: 2013-14
    expect(seasonOf(byId('lebron-drafted'))).toBe(2003); // June 2003 draft: 2003-04 rookie year
    expect(seasonOf(byId('spurs-win-duncan-lottery'))).toBe(1997); // May 1997 lottery: Duncan's 1997-98
    expect(seasonOf(byId('heat-win-2006-title'))).toBe(2005); // June Finals close the season
    expect(seasonOf(byId('the-decision'))).toBe(2010); // July opens the next one
  });
});

describe('season overviews', () => {
  it('has one overview for every season section with narratives, and none for empty ones', async () => {
    const { seasonOf } = await import('../lib/seasons');
    const { seasonOverviews } = await import('./seasonOverviews');
    const filled = new Set<string>();
    for (const s of stories) for (const c of s.categories ?? []) filled.add(`${seasonOf(s)}:${c}`);
    for (const k of filled) expect(seasonOverviews, `missing overview ${k}`).toHaveProperty([k]);
    for (const k of Object.keys(seasonOverviews)) expect(filled.has(k), `overview ${k} has no narratives`).toBe(true);
  });
});
