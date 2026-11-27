import { describe, expect, it } from 'vitest';
import { moves, offseasonOverviews } from './moves';
import { players, teams } from './people';
import { sources } from './sources';
import { stories } from './stories';
import { offseasons } from '../lib/moves';

describe('moves (trades and free agency)', () => {
  const pIds = new Set(players.map((p) => p.id));
  const tIds = new Set(teams.map((t) => t.id));
  const sIds = new Set(sources.map((s) => s.id));
  const storyIds = new Set(stories.map((s) => s.id));

  it('has unique ids and well-formed dates', () => {
    expect(new Set(moves.map((m) => m.id)).size).toBe(moves.length);
    const shape = { day: /^\d{4}-\d{2}-\d{2}$/, month: /^\d{4}-\d{2}$/, year: /^\d{4}$/ };
    for (const m of moves) expect(m.date, m.id).toMatch(shape[m.precision]);
  });
  it('links only to known players, teams and narratives', () => {
    for (const m of moves) {
      for (const p of m.players) expect(pIds, `${m.id} -> ${p}`).toContain(p);
      for (const s of m.sides) expect(tIds, `${m.id} -> ${s.team}`).toContain(s.team);
      for (const s of m.stories ?? []) expect(storyIds, `${m.id} -> ${s}`).toContain(s);
    }
  });
  it('backs every move with quotes from at least two articles, without timestamps', () => {
    for (const m of moves) {
      expect(new Set(m.sources.map((c) => c.source)).size, m.id).toBeGreaterThanOrEqual(2);
      for (const c of m.sources) {
        expect(sIds, `${m.id} -> ${c.source}`).toContain(c.source);
        expect(c.quote, `${m.id} quote`).toBeTruthy();
        expect(c.at, m.id).toBeUndefined();
      }
    }
  });
  it('gives every side a hindsight grade and every move ripple effects', () => {
    for (const m of moves) {
      expect(m.sides.length, m.id).toBeGreaterThanOrEqual(1);
      expect(m.ripples.length, m.id).toBeGreaterThanOrEqual(1);
      for (const s of m.sides) expect(s.why, `${m.id} ${s.team}`).toBeTruthy();
    }
  });
  it('never names an outlet in the narrative text', () => {
    const outlets = /\b(Sports Illustrated|SI\.com|ESPN|Bleacher|The Ringer|CBS|Yahoo|Associated Press|UPI|Salon|NBA\.com)\b/;
    for (const m of moves) {
      const text = [m.title, m.deal, m.then, m.happened, ...m.ripples.map((r) => r[1]), ...m.sides.map((s) => s.why)].join(' ');
      expect(text, m.id).not.toMatch(outlets);
    }
    for (const t of Object.values(offseasonOverviews)) expect(t).not.toMatch(outlets);
  });
  it('has an overview for every free agency summer', () => {
    for (const y of offseasons) expect(offseasonOverviews[y], String(y)).toBeTruthy();
  });
});
