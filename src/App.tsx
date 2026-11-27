import { useEffect, useRef, useState } from 'react';
import {
  CategoryPage, Day, NotionsPage, Decade, Directory, Month, NotFound, OnThisDay, PlayerPage, SearchPage, SeasonPage, SeasonsPage, SourcePage, SourcesPage, StoryPage, TeamPage, Year,
} from './pages';
import { href, useRoute, type Route } from './lib/router';
import { site } from './site';
import { ForumNewPage, ForumPage, ForumThreadPage } from './forum';
import { Home, TimelinePage } from './visual';
import { ComparePage, HotTakesPage } from './samples';

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
    case 'search': return <SearchPage key={query} query={query} />;
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
    case 'sources': return <SourcesPage />;
    case 'source': return <SourcePage id={route.id} />;
    case 'seasons': return <SeasonsPage />;
    case 'season': return <SeasonPage start={route.start} />;
    case 'category': return <CategoryPage id={route.id} />;
    case 'notions': return <NotionsPage key={route.verdict ?? 'all'} initialVerdict={route.verdict} />;
    case 'forum': return <ForumPage tab={route.tab} />;
    case 'forumthread': return <ForumThreadPage id={route.id} />;
    case 'forumnew': return <ForumNewPage key={`${route.kind}-${route.story ?? ''}`} kind={route.kind} story={route.story} />;
    case 'timeline': return <TimelinePage />;
    case 'hottakes': return <HotTakesPage key={route.voice ?? ''} voice={route.voice} />;
    case 'compare': return <ComparePage kind={route.kind} a={route.a} b={route.b} />;
    default: return <NotFound />;
  }
}

export default function App() {
  const route = useRoute();
  const [query, setQuery] = useState(() => store.get('q'));
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
    <>
      <header className="masthead">
        <div className="masthead-inner">
          <a className="brand" href={href.home}>
            {site.brand[0]}<span>{site.brand[1]}</span>
          </a>
          <form className="searchbar" role="search" onSubmit={(e) => { e.preventDefault(); location.hash = 'search'; }}>
            <label htmlFor="q" className="visually-hidden">Search dates, players, teams and stories</label>
            <input id="q" ref={input} type="search" autoComplete="off" value={query}
              placeholder="Search a date, player, team or story"
              onChange={(e) => onType(e.target.value)} />
          </form>
          <nav className="mainnav" aria-label="Main">
            <a href={href.seasons}>NBA seasons</a>
            <a href={href.timeline}>Timeline</a>
            <a href={href.notions}>Notions</a>
            <a href={href.hotTakes}>Hot takes</a>
            <a href={href.compare('players', 'lebron-james', 'kevin-durant')}>Compare</a>
            <a href={href.players}>Players</a>
            <a href={href.teams}>Teams</a>
            <a href={href.sources}>Sources</a>
            <a href={href.forum}>Forum</a>
          </nav>
        </div>
      </header>
      <main className="main">
        <Page route={route} query={query} />
      </main>
      <footer className="footer">
        <p>{site.domain} · early preview. Narratives marked draft are awaiting sources.</p>
      </footer>
    </>
  );
}
