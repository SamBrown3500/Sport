import { describe, expect, it } from 'vitest';
import { players, teams } from './people';
import { stories } from './stories';
import { span } from '../lib/dates';

describe('starter data', () => {
  const pIds = new Set(players.map((p) => p.id));
  const tIds = new Set(teams.map((t) => t.id));

  it('has unique story ids', () => expect(new Set(stories.map((s) => s.id)).size).toBe(stories.length));
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
