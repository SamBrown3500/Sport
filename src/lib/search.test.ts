import { describe, expect, it } from 'vitest';
import { parseDateQuery } from './dates';
import { search } from './search';

describe('date queries', () => {
  it('understands the ways people write dates', () => {
    expect(parseDateQuery('1962')).toEqual({ kind: 'year', year: 1962 });
    expect(parseDateQuery('1960s')).toEqual({ kind: 'decade', decade: 1960 });
    expect(parseDateQuery("60's")).toBeNull();
    expect(parseDateQuery('March 1962')).toEqual({ kind: 'month', year: 1962, month: 3 });
    expect(parseDateQuery('March 2, 1962')).toEqual({ kind: 'day', year: 1962, month: 3, day: 2 });
    expect(parseDateQuery('mar 2nd 1962')).toEqual({ kind: 'day', year: 1962, month: 3, day: 2 });
    expect(parseDateQuery('2 March 1962')).toEqual({ kind: 'day', year: 1962, month: 3, day: 2 });
    expect(parseDateQuery('3/2/1962')).toEqual({ kind: 'day', year: 1962, month: 3, day: 2 });
    expect(parseDateQuery('1962-03-02')).toEqual({ kind: 'day', year: 1962, month: 3, day: 2 });
    expect(parseDateQuery('March 2')).toEqual({ kind: 'monthday', month: 3, day: 2 });
    expect(parseDateQuery('February 30, 1962')).toBeNull();
    expect(parseDateQuery('Celtics')).toBeNull();
  });
});

describe('search', () => {
  const ids = (q: string) => search(q).stories.map((s) => s.id);

  it('finds a day', () => expect(ids('March 2, 1962')).toContain('wilt-100'));
  it('finds storylines running through a year', () => {
    const r = ids('1962');
    expect(r).toContain('wilt-100');
    expect(r).toContain('celtics-eight');
  });
  it('finds everything for a player, oldest first', () => {
    const r = search('Michael Jordan');
    expect(r.players.map((p) => p.id)).toEqual(['michael-jordan']);
    expect(r.stories[0].id).toBe('jordan-drafted');
    expect(r.stories.map((s) => s.id)).toContain('last-shot');
  });
  it('finds a team by an old name', () => expect(search('Seattle SuperSonics').teams.map((t) => t.id)).toEqual(['thunder']));
  it('finds a story by its nickname', () => expect(ids('the decision')).toContain('the-decision'));
  it('matches partial words', () => expect(search('russ').players.map((p) => p.id)).toContain('bill-russell'));
  it('finds themes', () => expect(ids('free agency').length).toBeGreaterThanOrEqual(2));
  it('finds every March 2', () => expect(ids('March 2')).toContain('wilt-100'));
});
