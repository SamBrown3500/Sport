import type { ReactNode } from 'react';
import type { Story } from './data/types';
import { getPlayer, getTeam } from './lib/db';
import { formatSpan } from './lib/dates';
import { href, hrefForDate } from './lib/router';
import { headline, takeFor } from './lib/notions';
import { categoryInfo } from './lib/seasons';

/* ── Small pieces ───────────────────────────────────────────────────── */

export function LeagueTag({ story }: { story: Story }) {
  return <span className="league">{story.league}</span>;
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
    <li className={`row ${story.kind === 'storyline' ? 'is-storyline' : ''}`}>
      <div className="row-date">
        <a href={hrefForDate(story.date)}>{showYear ? date : date.replace(/, \d{4}$/, '')}</a>
        {story.kind === 'storyline' && <span className="kind">Storyline</span>}
      </div>
      <details className="row-body">
        <summary>
          <h3>{headline(story)}</h3>
        </summary>
        <div className="row-detail">
          {takeFor(story) && <p className="row-title">{story.title}</p>}
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

export function Timeline({ stories, showYear = true, empty }: { stories: Story[]; showYear?: boolean; empty?: ReactNode }) {
  if (!stories.length) return <Empty>{empty ?? 'No narratives here yet.'}</Empty>;
  return (
    <ol className="timeline">
      {stories.map((s) => <StoryRow key={s.id} story={s} showYear={showYear} />)}
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
