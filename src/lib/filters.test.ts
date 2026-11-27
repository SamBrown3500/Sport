import { describe, expect, it } from 'vitest';
import { allStories } from './db';
import { matchesSource, matchesVerdict, outletOf, outlets, verdictOf } from './filters';
import { clean, newId, safeLink, stanceTally } from './forum';

describe('prediction filters', () => {
  it('splits stories into busted, held, mixed, open and no prediction without losing any', () => {
    const parts = (['busted', 'held', 'mixed', 'open', 'none'] as const).map((v) => allStories.filter((s) => matchesVerdict(s, v)).length);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(allStories.length);
    expect(parts[0]).toBeGreaterThan(0);
    expect(parts[1]).toBeGreaterThan(0);
  });
  it('busted means the notion on file says busted', () => {
    for (const s of allStories.filter((x) => matchesVerdict(x, 'busted'))) expect(verdictOf(s)).toBe('busted');
  });
});

describe('source filters', () => {
  it('groups outlets without their bracketed detail', () => {
    expect(outletOf({ outlet: 'NBA.com (John Schuhmann)' } as never)).toBe('NBA.com');
    expect(new Set(outlets.map((o) => o.id)).size).toBe(outlets.length);
  });
  it('an outlet filter keeps exactly the stories that cite one of its sources', () => {
    const o = outlets[0];
    const ids = new Set(o.sources.map((s) => s.id));
    for (const s of allStories) {
      expect(matchesSource(s, `outlet:${o.id}`)).toBe(!!s.sources?.some((c) => ids.has(c.source)));
    }
  });
});

describe('forum helpers', () => {
  it('ids fit in site links', () => expect(newId()).toMatch(/^[a-z0-9]+$/));
  it('only https links are kept', () => {
    expect(safeLink('https://example.com/a')).toBe('https://example.com/a');
    expect(safeLink('javascript:alert(1)')).toBeUndefined();
    expect(safeLink('http://example.com')).toBeUndefined();
  });
  it('trims and caps text', () => expect(clean('  hi\r\nthere  ', 5)).toBe('hi\nth'));
  it('counts stances', () => expect(stanceTally([{ stance: 'agree' }, { stance: 'disagree' }, { stance: 'agree' }, {}] as never)).toEqual({ agree: 2, disagree: 1 }));
});
