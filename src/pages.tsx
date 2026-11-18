import { useMemo } from 'react';
import {
  Crumbs, Empty, LeagueTag, PageHead, PrevNext, Section, Timeline, useFiltered,
} from './components';
import type { Story } from './data/types';
import {
  allStories, getPlayer, getStory, getTeam, momentsOn, onThisDay, players, related,
  storiesBetween, storiesForPlayer, storiesForTeam, storylinesDuring, teams,
} from './lib/db';
import { FIRST_YEAR, MONTHS, daysInMonth, formatDate, formatSpan, iso, span } from './lib/dates';
import { href, hrefForDate } from './lib/router';
import { search } from './lib/search';

const THIS_YEAR = new Date().getFullYear();
const LAST_DECADE = Math.floor(THIS_YEAR / 10) * 10;
const DECADES = Array.from({ length: (LAST_DECADE - FIRST_YEAR) / 10 + 1 }, (_, i) => FIRST_YEAR + i * 10);

/* ── Decade strip: the whole calendar at a glance ───────────────────── */

function DecadeStrip({ current }: { current?: number }) {
  const counts = useMemo(
    () =>
      DECADES.map((d) => {
        const list = storiesBetween(`${d}-01-01`, `${d + 9}-12-31`);
        return {
          d,
          football: list.filter((s) => s.sport === 'football').length,
          basketball: list.filter((s) => s.sport === 'basketball').length,
        };
      }),
    [],
  );
  const max = Math.max(...counts.map((c) => c.football + c.basketball), 1);
  return (
    <nav className="decades" aria-label="Decades">
      {counts.map(({ d, football, basketball }) => (
        <a key={d} href={href.decade(d)} className={d === current ? 'is-current' : ''}
          aria-label={`${d}s: ${football} football and ${basketball} basketball narratives`}>
          <span className="bars" aria-hidden="true">
            <span className="bar bar-football" style={{ height: `${(football / max) * 100}%` }} />
            <span className="bar bar-basketball" style={{ height: `${(basketball / max) * 100}%` }} />
          </span>
          <span className="decade-label">{String(d).slice(2)}s</span>
        </a>
      ))}
    </nav>
  );
}

function Legend() {
  return (
    <p className="legend">
      <span><i className="sw sw-football" /> Football</span>
      <span><i className="sw sw-basketball" /> Basketball</span>
    </p>
  );
}

/* ── Home ───────────────────────────────────────────────────────────── */

export function Home() {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const today = onThisDay(m, d);
  const storylines = allStories.filter((s) => s.kind === 'storyline');
  return (
    <>
      <section className="hero">
        <p className="eyebrow">NFL and NBA history, {FIRST_YEAR} to today</p>
        <h1>What was happening in the game?</h1>
        <p className="lede">
          Pick a decade, a year or a single day and read the stories that defined it. Or search any date, player,
          team or story and every narrative comes up in order.
        </p>
      </section>

      <Section title="Browse by decade" aside={<Legend />}>
        <DecadeStrip />
      </Section>

      <Section title={`On this day: ${MONTHS[m - 1]} ${d}`} count={today.length}
        aside={<a className="more" href={href.onThisDay(m, d)}>Every year →</a>}>
        <Timeline stories={today} empty={<>Nothing on file for today yet. <a href={href.onThisDay(3, 2)}>Try March 2</a>.</>} />
      </Section>

      <Section title="Long-running storylines" count={storylines.length}>
        <Timeline stories={storylines} />
      </Section>
    </>
  );
}

/* ── Decade ─────────────────────────────────────────────────────────── */

export function Decade({ decade }: { decade: number }) {
  const list = storiesBetween(`${decade}-01-01`, `${decade + 9}-12-31`);
  const shown = useFiltered(list);
  const years = Array.from({ length: 10 }, (_, i) => decade + i);
  return (
    <>
      <Crumbs items={[['Calendar', href.home], [`${decade}s`]]} />
      <PageHead eyebrow="Decade" title={`The ${decade}s`}>
        <p className="lede">{shown.length} narratives across both leagues.</p>
      </PageHead>
      <DecadeStrip current={decade} />
      <div className="yeargrid">
        {years.map((y) => {
          const n = shown.filter((s) => {
            const [a, b] = span(s);
            return a <= `${y}-12-31` && b >= `${y}-01-01`;
          }).length;
          return (
            <a key={y} href={href.year(y)} className={n ? '' : 'is-quiet'}>
              <strong>{y}</strong>
              <span>{n ? `${n} ${n === 1 ? 'story' : 'stories'}` : '—'}</span>
            </a>
          );
        })}
      </div>
      <Section title="Timeline">
        <Timeline stories={list} />
      </Section>
      <PrevNext
        prev={decade > FIRST_YEAR ? [`${decade - 10}s`, href.decade(decade - 10)] : undefined}
        next={decade < LAST_DECADE ? [`${decade + 10}s`, href.decade(decade + 10)] : undefined}
      />
    </>
  );
}

/* ── Year ───────────────────────────────────────────────────────────── */

export function Year({ year }: { year: number }) {
  const decade = Math.floor(year / 10) * 10;
  const list = storiesBetween(`${year}-01-01`, `${year}-12-31`);
  const shown = useFiltered(list);
  const ongoing = list.filter((s) => s.kind === 'storyline');
  const events = list.filter((s) => s.kind === 'moment');
  return (
    <>
      <Crumbs items={[['Calendar', href.home], [`${decade}s`, href.decade(decade)], [String(year)]]} />
      <PageHead eyebrow="Year" title={String(year)} />
      <div className="monthgrid">
        {MONTHS.map((name, i) => {
          const from = `${iso(year, i + 1)}-01`;
          const to = `${iso(year, i + 1)}-${daysInMonth(year, i + 1)}`;
          const n = shown.filter((s) => s.kind === 'moment' && span(s)[0] >= from && span(s)[0] <= to).length;
          return (
            <a key={name} href={href.month(year, i + 1)} className={n ? '' : 'is-quiet'}>
              <strong>{name.slice(0, 3)}</strong>
              <span>{n || '—'}</span>
            </a>
          );
        })}
      </div>
      <Section title="Moments" count={useFiltered(events).length}>
        <Timeline stories={events} showYear={false} empty="No dated moments on file for this year yet." />
      </Section>
      <Section title="Storylines running this year" count={useFiltered(ongoing).length}>
        <Timeline stories={ongoing} empty="No long-running storylines cover this year yet." />
      </Section>
      <PrevNext
        prev={year > FIRST_YEAR ? [String(year - 1), href.year(year - 1)] : undefined}
        next={year < THIS_YEAR ? [String(year + 1), href.year(year + 1)] : undefined}
      />
    </>
  );
}

/* ── Month: a real calendar grid ────────────────────────────────────── */

export function Month({ year, month }: { year: number; month: number }) {
  const decade = Math.floor(year / 10) * 10;
  const first = `${iso(year, month)}-01`;
  const last = `${iso(year, month)}-${daysInMonth(year, month)}`;
  const list = storiesBetween(first, last);
  const shown = useFiltered(list);
  const offset = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const days = daysInMonth(year, month);
  const onDay = (d: number) => shown.filter((s) => s.precision === 'day' && s.kind === 'moment' && s.date === iso(year, month, d));
  const prev = month === 1 ? [year - 1, 12] : [year, month - 1];
  const next = month === 12 ? [year + 1, 1] : [year, month + 1];
  return (
    <>
      <Crumbs items={[['Calendar', href.home], [`${decade}s`, href.decade(decade)], [String(year), href.year(year)], [MONTHS[month - 1]]]} />
      <PageHead eyebrow="Month" title={`${MONTHS[month - 1]} ${year}`} />
      <div className="calendar-wrap">
        <div className="calendar" role="grid" aria-label={`${MONTHS[month - 1]} ${year}`}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="dow" role="columnheader">{d}</div>
          ))}
          {Array.from({ length: offset }, (_, i) => <div key={`x${i}`} className="cell is-blank" />)}
          {Array.from({ length: days }, (_, i) => {
            const d = i + 1;
            const here = onDay(d);
            return (
              <a key={d} href={href.day(year, month, d)} role="gridcell" className={`cell ${here.length ? 'has' : ''}`}
                aria-label={`${MONTHS[month - 1]} ${d}${here.length ? `: ${here.map((s) => s.title).join('; ')}` : ''}`}>
                <span className="num">{d}</span>
                {here.map((s) => (
                  <span key={s.id} className={`dot dot-${s.sport}`}>{s.title}</span>
                ))}
              </a>
            );
          })}
        </div>
      </div>
      <Section title="This month" count={shown.length}>
        <Timeline stories={list} empty="Nothing on file for this month yet." />
      </Section>
      <PrevNext
        prev={prev[0] >= FIRST_YEAR ? [`${MONTHS[prev[1] - 1]} ${prev[0]}`, href.month(prev[0], prev[1])] : undefined}
        next={next[0] <= THIS_YEAR ? [`${MONTHS[next[1] - 1]} ${next[0]}`, href.month(next[0], next[1])] : undefined}
      />
    </>
  );
}

/* ── Day ────────────────────────────────────────────────────────────── */

function shiftDay(y: number, m: number, d: number, by: number): [number, number, number] {
  const t = new Date(Date.UTC(y, m - 1, d + by));
  return [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()];
}

export function Day({ year, month, day }: { year: number; month: number; day: number }) {
  const decade = Math.floor(year / 10) * 10;
  const date = iso(year, month, day);
  const moments = momentsOn(date);
  const ongoing = storylinesDuring(date);
  const otherYears = onThisDay(month, day).filter((s) => s.date !== date);
  const p = shiftDay(year, month, day, -1);
  const n = shiftDay(year, month, day, 1);
  return (
    <>
      <Crumbs items={[['Calendar', href.home], [`${decade}s`, href.decade(decade)], [String(year), href.year(year)],
        [MONTHS[month - 1], href.month(year, month)], [String(day)]]} />
      <PageHead eyebrow="Day" title={formatDate(date)} />
      <Section title="What happened" count={useFiltered(moments).length}>
        <Timeline stories={moments} empty="No moments on file for this day yet." />
      </Section>
      <Section title="Storylines in progress" count={useFiltered(ongoing).length}>
        <Timeline stories={ongoing} empty="No long-running storylines were underway on this date." />
      </Section>
      <Section title={`${MONTHS[month - 1]} ${day} in other years`} count={useFiltered(otherYears).length}
        aside={<a className="more" href={href.onThisDay(month, day)}>On this day →</a>}>
        <Timeline stories={otherYears} empty="Nothing else on file for this date." />
      </Section>
      <PrevNext prev={[formatDate(iso(...p)), href.day(...p)]} next={[formatDate(iso(...n)), href.day(...n)]} />
    </>
  );
}

/* ── On this day ────────────────────────────────────────────────────── */

export function OnThisDay({ month, day }: { month?: number; day?: number }) {
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  const d = day ?? now.getDate();
  const list = onThisDay(m, d);
  const p = shiftDay(2000, m, d, -1);
  const n = shiftDay(2000, m, d, 1);
  return (
    <>
      <Crumbs items={[['Calendar', href.home], ['On this day']]} />
      <PageHead eyebrow="On this day" title={`${MONTHS[m - 1]} ${d}`}>
        <p className="lede">Every year since {FIRST_YEAR}, oldest first.</p>
      </PageHead>
      <Timeline stories={list} empty="Nothing on file for this date yet." />
      <PrevNext prev={[`${MONTHS[p[1] - 1]} ${p[2]}`, href.onThisDay(p[1], p[2])]}
        next={[`${MONTHS[n[1] - 1]} ${n[2]}`, href.onThisDay(n[1], n[2])]} />
    </>
  );
}

/* ── Story ──────────────────────────────────────────────────────────── */

export function StoryPage({ id }: { id: string }) {
  const story = getStory(id);
  if (!story) return <NotFound what="story" />;
  const [y, m, d] = story.date.split('-').map(Number);
  const decade = Math.floor(y / 10) * 10;
  const rel = related(story);
  return (
    <article className="story">
      <Crumbs items={[['Calendar', href.home], [`${decade}s`, href.decade(decade)], [String(y), href.year(y)], ...(m ? [[MONTHS[m - 1], href.month(y, m)] as [string, string]] : []), ...(d ? [[String(d), href.day(y, m, d)] as [string, string]] : [])]} />
      <PageHead eyebrow={story.kind === 'storyline' ? 'Storyline' : 'Moment'} title={story.title}>
        <p className="story-date">
          <a href={hrefForDate(story.date)}>{formatSpan(story)}</a> <LeagueTag story={story} />
        </p>
      </PageHead>
      <p className="story-body">{story.summary}</p>
      <p className="draft-note">Draft narrative. Sources still need to be added and checked before launch.</p>
      <dl className="facts">
        {story.players.length > 0 && (
          <div><dt>Players</dt><dd>{story.players.map((p) => <a key={p} className="chip" href={href.player(p)}>{getPlayer(p)?.name}</a>)}</dd></div>
        )}
        {story.teams.length > 0 && (
          <div><dt>Teams</dt><dd>{story.teams.map((t) => <a key={t} className="chip chip-team" href={href.team(t)}>{getTeam(t)?.name}</a>)}</dd></div>
        )}
        <div><dt>Themes</dt><dd>{story.tags.map((t) => <span key={t} className="chip chip-plain">{t}</span>)}</dd></div>
        {story.aliases && <div><dt>Also called</dt><dd>{story.aliases.join(', ')}</dd></div>}
      </dl>
      {rel.length > 0 && (
        <Section title="Related narratives">
          <Timeline stories={rel} />
        </Section>
      )}
    </article>
  );
}

/* ── Player and team timelines ──────────────────────────────────────── */

function EntityTimeline({ eyebrow, name, aliases, list }: { eyebrow: string; name: string; aliases?: string[]; list: Story[] }) {
  const first = list[0];
  const last = list[list.length - 1];
  return (
    <>
      <PageHead eyebrow={eyebrow} title={name}>
        {aliases?.length ? <p className="lede">Also known as {aliases.join(', ')}.</p> : null}
        {first && <p className="lede">{list.length} narratives, {first.date.slice(0, 4)} to {(last.end ?? last.date).slice(0, 4)}.</p>}
      </PageHead>
      <p className="note">Season-by-season stats will sit beside this timeline in the next milestone.</p>
      <Timeline stories={list} />
    </>
  );
}

export function PlayerPage({ id }: { id: string }) {
  const p = getPlayer(id);
  if (!p) return <NotFound what="player" />;
  return (
    <>
      <Crumbs items={[['Players', href.players], [p.name]]} />
      <EntityTimeline eyebrow={`Player · ${p.league}`} name={p.name} aliases={p.aliases} list={storiesForPlayer(id)} />
    </>
  );
}

export function TeamPage({ id }: { id: string }) {
  const t = getTeam(id);
  if (!t) return <NotFound what="team" />;
  return (
    <>
      <Crumbs items={[['Teams', href.teams], [t.name]]} />
      <EntityTimeline eyebrow={`Team · ${t.league}`} name={t.name} aliases={t.aliases} list={storiesForTeam(id)} />
    </>
  );
}

export function Directory({ kind }: { kind: 'players' | 'teams' }) {
  const items = (kind === 'players' ? players : teams)
    .map((x) => ({ ...x, n: (kind === 'players' ? storiesForPlayer : storiesForTeam)(x.id).length }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <>
      <PageHead eyebrow="Directory" title={kind === 'players' ? 'Players' : 'Teams'} />
      <ul className="directory">
        {items.map((x) => (
          <li key={x.id}>
            <a href={kind === 'players' ? href.player(x.id) : href.team(x.id)}>{x.name}</a>
            <span>{x.league} · {x.n}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ── Search ─────────────────────────────────────────────────────────── */

export function SearchPage({ query }: { query: string }) {
  const r = useMemo(() => search(query), [query]);
  const shown = useFiltered(r.stories);
  if (!query.trim()) {
    return (
      <PageHead eyebrow="Search" title="Search the calendar">
        <p className="lede">Try a date like “March 2, 1962”, a decade like “1960s”, a player, a team, or a story like “Ice Bowl”.</p>
      </PageHead>
    );
  }
  const dateLink = r.date && (() => {
    const q = r.date;
    switch (q.kind) {
      case 'decade': return [`Open the ${q.decade}s`, href.decade(q.decade)];
      case 'year': return [`Open ${q.year}`, href.year(q.year)];
      case 'month': return [`Open ${MONTHS[q.month - 1]} ${q.year}`, href.month(q.year, q.month)];
      case 'day': return [`Open ${MONTHS[q.month - 1]} ${q.day}, ${q.year}`, href.day(q.year, q.month, q.day)];
      case 'monthday': return [`Open ${MONTHS[q.month - 1]} ${q.day} in every year`, href.onThisDay(q.month, q.day)];
    }
  })();
  return (
    <>
      <PageHead eyebrow="Search" title={`“${query.trim()}”`}>
        <p className="lede">{shown.length} {shown.length === 1 ? 'narrative' : 'narratives'}, oldest first.</p>
      </PageHead>
      {(dateLink || r.players.length > 0 || r.teams.length > 0) && (
        <div className="matches">
          {dateLink && <a className="match match-date" href={dateLink[1]}>{dateLink[0]} on the calendar →</a>}
          {r.players.map((p) => <a key={p.id} className="match" href={href.player(p.id)}><small>Player</small>{p.name}</a>)}
          {r.teams.map((t) => <a key={t.id} className="match" href={href.team(t.id)}><small>Team</small>{t.name}</a>)}
        </div>
      )}
      <Timeline stories={r.stories} empty="No narratives match yet. Try a year, a last name or a team nickname." />
    </>
  );
}

export function NotFound({ what = 'page' }: { what?: string }) {
  return (
    <>
      <PageHead title={`That ${what} isn't here`} />
      <Empty>It may not have been written yet. <a href={href.home}>Back to the calendar</a>.</Empty>
    </>
  );
}
