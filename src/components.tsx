import { createContext, useContext, type ReactNode } from 'react';
import type { Sport, Story } from './data/types';
import { getPlayer, getTeam } from './lib/db';
import { formatSpan } from './lib/dates';
import { href, hrefForDate } from './lib/router';
import { categoryInfo } from './lib/seasons';

/* ── Sport filter, shared by every page ─────────────────────────────── */

export type SportFilter = 'all' | Sport;
export const FilterContext = createContext<{ filter: SportFilter; setFilter: (f: SportFilter) => void }>({
  filter: 'all',
  setFilter: () => {},
});
export const useFilter = () => useContext(FilterContext);
export function useFiltered(stories: Story[]): Story[] {
  const { filter } = useFilter();
  return filter === 'all' ? stories : stories.filter((s) => s.sport === filter);
}

export function SportToggle() {
  const { filter, setFilter } = useFilter();
  const opts: [SportFilter, string][] = [['all', 'Both'], ['football', 'Football'], ['basketball', 'Basketball']];
  return (
    <div className="toggle" role="group" aria-label="Show sport">
      {opts.map(([v, label]) => (
        <button key={v} type="button" id={`sport-${v}`} aria-pressed={filter === v} onClick={() => setFilter(v)}>
          {label}
        </button>
      ))}
    </div>
  );
}

/* ── Small pieces ───────────────────────────────────────────────────── */

export function LeagueTag({ story }: { story: Story }) {
  return <span className={`league league-${story.sport}`}>{story.league}</span>;
}

export function Crumbs({ items }: { items: [string, string?][] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {items.map(([label, link], i) => (
        <span key={i}>
          {link ? <a href={link}>{label}</a> : <span aria-current="page">{label}</span>}
          {i < items.length - 1 && <span className="sep" aria-hidden="true">/</span>}
        </span>
      ))}
    </nav>
  );
}

export function PageHead({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header className="pagehead">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {children}
    </header>
  );
}

export function PrevNext({ prev, next }: { prev?: [string, string]; next?: [string, string] }) {
  return (
    <div className="prevnext">
      {prev ? <a href={prev[1]}>← {prev[0]}</a> : <span />}
      {next ? <a href={next[1]}>{next[0]} →</a> : <span />}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="empty">{children}</p>;
}

/* ── Story rows: the timeline building block ────────────────────────── */

export function StoryRow({ story, showYear = true }: { story: Story; showYear?: boolean }) {
  const date = formatSpan(story);
  return (
    <li className={`row row-${story.sport} ${story.kind === 'storyline' ? 'is-storyline' : ''}`}>
      <div className="row-date">
        <a href={hrefForDate(story.date)}>{showYear ? date : date.replace(/, \d{4}$/, '')}</a>
        {story.kind === 'storyline' && <span className="kind">Storyline</span>}
      </div>
      <details className="row-body">
        <summary>
          <h3>{story.title}</h3>
        </summary>
        <div className="row-detail">
          <p>{story.summary}</p>
          <div className="row-meta">
            <LeagueTag story={story} />
            {story.sources?.length ? <span className="sourced" title="Backed by a cited source">Sourced</span> : null}
            {story.categories?.map((c) => (
              <a key={c} className="chip chip-cat" href={href.category(c)}>{categoryInfo(c)?.name}</a>
            ))}
            {story.players.slice(0, 3).map((id) => (
              <a key={id} className="chip" href={href.player(id)}>{getPlayer(id)?.name}</a>
            ))}
            {story.teams.slice(0, 2).map((id) => (
              <a key={id} className="chip chip-team" href={href.team(id)}>{getTeam(id)?.name}</a>
            ))}
          </div>
          <a className="row-more" href={href.story(story.id)}>
            {story.sources?.length ? 'Full narrative and sources →' : 'Full narrative →'}
          </a>
        </div>
      </details>
    </li>
  );
}

export function Timeline({ stories, showYear = true, empty, unfiltered = false }: { stories: Story[]; showYear?: boolean; empty?: ReactNode; unfiltered?: boolean }) {
  const filtered = useFiltered(stories);
  const shown = unfiltered ? stories : filtered;
  if (!shown.length) return <Empty>{empty ?? 'No narratives here yet.'}</Empty>;
  return (
    <ol className="timeline">
      {shown.map((s) => <StoryRow key={s.id} story={s} showYear={showYear} />)}
    </ol>
  );
}

export function Section({ title, count, children, aside }: { title: string; count?: number; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="section">
      <div className="section-head">
        <h2>
          {title}
          {count !== undefined && <span className="count">{count}</span>}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}
