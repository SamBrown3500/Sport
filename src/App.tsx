import { useEffect, useRef, useState } from 'react';
import { FilterContext, SportToggle, type SportFilter } from './components';
import {
  Day, Decade, Directory, Home, Month, NotFound, OnThisDay, PlayerPage, SearchPage, StoryPage, TeamPage, Year,
} from './pages';
import { href, useRoute, type Route } from './lib/router';

const store = {
  get(key: string) {
    try { return sessionStorage.getItem(key) ?? ''; } catch { return ''; }
  },
  set(key: string, value: string) {
    try { sessionStorage.setItem(key, value); } catch { /* storage blocked: fine */ }
  },
};

function Page({ route, query }: { route: Route; query: string }) {
  switch (route.page) {
    case 'home': return <Home />;
    case 'search': return <SearchPage query={query} />;
    case 'decade': return <Decade decade={route.decade} />;
    case 'year': return <Year year={route.year} />;
    case 'month': return <Month year={route.year} month={route.month} />;
    case 'day': return <Day year={route.year} month={route.month} day={route.day} />;
    case 'onthisday': return <OnThisDay month={route.month} day={route.day} />;
    case 'story': return <StoryPage id={route.id} />;
    case 'player': return <PlayerPage id={route.id} />;
    case 'team': return <TeamPage id={route.id} />;
    case 'players': return <Directory kind="players" />;
    case 'teams': return <Directory kind="teams" />;
    default: return <NotFound />;
  }
}

export default function App() {
  const route = useRoute();
  const [query, setQuery] = useState(() => store.get('q'));
  const [filter, setFilter] = useState<SportFilter>('all');
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => store.set('q', query), [query]);

  // "/" focuses search, like most reference sites.
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (e.key === '/' && !typing) { e.preventDefault(); input.current?.focus(); }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);

  const onType = (value: string) => {
    setQuery(value);
    if (route.page !== 'search' && value.trim()) location.hash = 'search';
  };

  return (
    <FilterContext.Provider value={{ filter, setFilter }}>
      <header className="masthead">
        <div className="masthead-inner">
          <a className="brand" href={href.home}>
            Sports<span>Narratives</span>
          </a>
          <form className="searchbar" role="search" onSubmit={(e) => { e.preventDefault(); location.hash = 'search'; }}>
            <label htmlFor="q" className="visually-hidden">Search dates, players, teams and stories</label>
            <input id="q" ref={input} type="search" autoComplete="off" value={query}
              placeholder="Search a date, player, team or story"
              onChange={(e) => onType(e.target.value)} />
          </form>
          <nav className="mainnav" aria-label="Main">
            <a href={href.onThisDay()}>On this day</a>
            <a href={href.players}>Players</a>
            <a href={href.teams}>Teams</a>
          </nav>
        </div>
      </header>
      <div className="subbar">
        <div className="subbar-inner">
          <SportToggle />
        </div>
      </div>
      <main className="main">
        <Page route={route} query={query} />
      </main>
      <footer className="footer">
        <p>sportsnarratives.com · early preview. Narratives are drafts awaiting sources.</p>
      </footer>
    </FilterContext.Provider>
  );
}
