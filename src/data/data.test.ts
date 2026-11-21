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
      expect(Number(s.date.slice(0, 4)), s.id).toBeGreaterThanOrEqual(1900);
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
