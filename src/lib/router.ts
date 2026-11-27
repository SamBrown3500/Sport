import { useEffect, useState } from 'react';

/*
 * Hash routes use only letters, digits and hyphens (e.g. #day-1962-03-02) so a
 * link to any page can be copied and shared, including from the hosted preview.
 * When this moves to a server-rendered app these become real paths like /1962/03/02.
 */
export type Route =
  | { page: 'home' }
  | { page: 'search' }
  | { page: 'decade'; decade: number }
  | { page: 'year'; year: number }
  | { page: 'month'; year: number; month: number }
  | { page: 'day'; year: number; month: number; day: number }
  | { page: 'onthisday'; month?: number; day?: number }
  | { page: 'story'; id: string }
  | { page: 'player'; id: string }
  | { page: 'team'; id: string }
  | { page: 'players' }
  | { page: 'teams' }
  | { page: 'sources' }
  | { page: 'source'; id: string }
  | { page: 'seasons' }
  | { page: 'season'; start: number }
  | { page: 'category'; id: string }
  | { page: 'notions'; verdict?: 'busted' | 'held' | 'mixed' | 'open' }
  | { page: 'forum'; tab?: 'debates' | 'suggestions' }
  | { page: 'forumthread'; id: string }
  | { page: 'forumnew'; kind: 'debate' | 'suggestion'; story?: string }
  | { page: 'timeline' };

export function parse(hash: string): Route {
  const h = hash.replace(/^#/, '');
  let m: RegExpMatchArray | null;
  if ((m = h.match(/^decade-(\d{4})$/))) return { page: 'decade', decade: +m[1] };
  if ((m = h.match(/^year-(\d{4})$/))) return { page: 'year', year: +m[1] };
  if ((m = h.match(/^month-(\d{4})-(\d{2})$/))) return { page: 'month', year: +m[1], month: +m[2] };
  if ((m = h.match(/^day-(\d{4})-(\d{2})-(\d{2})$/))) return { page: 'day', year: +m[1], month: +m[2], day: +m[3] };
  if (h === 'on-this-day') return { page: 'onthisday' };
  if ((m = h.match(/^on-this-day-(\d{2})-(\d{2})$/))) return { page: 'onthisday', month: +m[1], day: +m[2] };
  if ((m = h.match(/^story-([a-z0-9-]+)$/))) return { page: 'story', id: m[1] };
  if ((m = h.match(/^player-([a-z0-9-]+)$/))) return { page: 'player', id: m[1] };
  if ((m = h.match(/^team-([a-z0-9-]+)$/))) return { page: 'team', id: m[1] };
  if ((m = h.match(/^source-([a-z0-9-]+)$/))) return { page: 'source', id: m[1] };
  if ((m = h.match(/^nba-season-(\d{4})$/))) return { page: 'season', start: +m[1] };
  if ((m = h.match(/^category-([a-z0-9-]+)$/))) return { page: 'category', id: m[1] };
  if (h === 'nba-seasons') return { page: 'seasons' };
  if (h === 'notions') return { page: 'notions' };
  if ((m = h.match(/^notions-(busted|held|mixed|open)$/))) return { page: 'notions', verdict: m[1] as 'busted' };
  if (h === 'forum') return { page: 'forum' };
  if ((m = h.match(/^forum-(debates|suggestions)$/))) return { page: 'forum', tab: m[1] as 'debates' };
  if ((m = h.match(/^forum-thread-([a-z0-9]+)$/))) return { page: 'forumthread', id: m[1] };
  if (h === 'forum-suggest') return { page: 'forumnew', kind: 'suggestion' };
  if (h === 'forum-debate') return { page: 'forumnew', kind: 'debate' };
  if ((m = h.match(/^forum-debate-([a-z0-9-]+)$/))) return { page: 'forumnew', kind: 'debate', story: m[1] };
  if (h === 'timeline') return { page: 'timeline' };
  if (h === 'sources') return { page: 'sources' };
  if (h === 'search') return { page: 'search' };
  if (h === 'players') return { page: 'players' };
  if (h === 'teams') return { page: 'teams' };
  return { page: 'home' };
}

const p2 = (n: number) => String(n).padStart(2, '0');

export const href = {
  home: '#',
  search: '#search',
  decade: (d: number) => `#decade-${d}`,
  year: (y: number) => `#year-${y}`,
  month: (y: number, m: number) => `#month-${y}-${p2(m)}`,
  day: (y: number, m: number, d: number) => `#day-${y}-${p2(m)}-${p2(d)}`,
  onThisDay: (m?: number, d?: number) => (m && d ? `#on-this-day-${p2(m)}-${p2(d)}` : '#on-this-day'),
  story: (id: string) => `#story-${id}`,
  player: (id: string) => `#player-${id}`,
  team: (id: string) => `#team-${id}`,
  players: '#players',
  teams: '#teams',
  sources: '#sources',
  source: (id: string) => `#source-${id}`,
  seasons: '#nba-seasons',
  season: (start: number) => `#nba-season-${start}`,
  category: (id: string) => `#category-${id}`,
  notions: '#notions',
  notionsBy: (v: 'busted' | 'held' | 'mixed' | 'open') => `#notions-${v}`,
  forum: '#forum',
  forumTab: (t: 'debates' | 'suggestions') => `#forum-${t}`,
  forumThread: (id: string) => `#forum-thread-${id}`,
  forumSuggest: '#forum-suggest',
  forumDebate: (story?: string) => (story ? `#forum-debate-${story}` : '#forum-debate'),
  timeline: '#timeline',
};

/** Link for a partial ISO date at whatever precision it has. */
export function hrefForDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  if (d) return href.day(y, m, d);
  if (m) return href.month(y, m);
  return href.year(y);
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(location.hash));
  useEffect(() => {
    const on = () => {
      setRoute(parse(location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}
