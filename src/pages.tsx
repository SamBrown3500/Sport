import { useMemo, useState } from 'react';
import {
  Crumbs, Empty, LeagueTag, PageHead, PrevNext, Section, Timeline,
} from './components';
import type { Category, Citation, Source, Story } from './data/types';
import {
  allSources, allStories, getPlayer, getSource, getStory, getTeam, isSourced, momentsOn, onThisDay, players, related,
  storiesBetween, storiesForPlayer, storiesInCategory, storiesInSeason, storiesForTeam, storiesFromSource, storylinesDuring, teams,
} from './lib/db';
import { SOURCE_KIND, youtubeId } from './lib/sources';
import { FIRST_YEAR, MONTHS, daysInMonth, formatDate, formatSpan, iso, span } from './lib/dates';
import { href, hrefForDate } from './lib/router';
import { search } from './lib/search';
import { SeasonFacts } from './seasonFacts';
import { Scoreboard } from './scoreboard';
import { decadePhotos } from './data/decadePhotos';
import { seasonOverview } from './lib/db';
import { CATEGORIES, FIRST_SEASON, categoryInfo, currentSeason, isCategory, seasonLabel, seasonOf, seasonsInYear } from './lib/seasons';

const THIS_YEAR = new Date().getFullYear();
const LAST_DECADE = Math.floor(THIS_YEAR / 10) * 10;
const DECADES = Array.from({ length: (LAST_DECADE - FIRST_YEAR) / 10 + 1 }, (_, i) => FIRST_YEAR + i * 10);

/* ── Decade strip: the whole calendar at a glance ───────────────────── */

function DecadeStrip({ current }: { current?: number }) {
  const counts = useMemo(
    () => DECADES.map((d) => ({ d, n: storiesBetween(`${d}-01-01`, `${d + 9}-12-31`).length })),
    [],
  );
  return (
    <nav className="decades" aria-label="Decades">
      {counts.map(({ d, n }) => {
        const photo = decadePhotos[d];
        return (
          <a key={d} href={href.decade(d)} className={d === current ? 'is-current' : ''}
            aria-label={`${d}s: ${n} narratives`}>
            {photo
              ? <img className="decade-photo" src={photo.src} alt={photo.player} title={`${photo.player} · ${photo.author}, ${photo.license}`} loading="lazy" />
              : <span className="decade-photo is-empty" aria-hidden="true" />}
            <span className="decade-label">{String(d).slice(2)}s</span>
          </a>
        );
      })}
    </nav>
  );
}

function PhotoCredits() {
  return (
    <details className="photo-credits">
      <summary>Photo credits</summary>
      <ul>
        {DECADES.filter((d) => decadePhotos[d]).map((d) => {
          const p = decadePhotos[d];
          return (
            <li key={d}>
              {d}s: {p.player}, by {p.author} (<a href={p.page} target="_blank" rel="noreferrer">{p.license}</a>), via Wikimedia Commons, cropped.
            </li>
          );
        })}
      </ul>
    </details>
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
        <p className="eyebrow">NBA history, {FIRST_YEAR} to today</p>
        <h1>What was happening in the game?</h1>
        <p className="lede">
          Pick a decade, a year or a single day and read the stories that defined it. Or search any date, player,
          team or story and every narrative comes up in order.
        </p>
      </section>

      <Section title="Browse by decade">
        <DecadeStrip />
        <PhotoCredits />
      </Section>

      <Scoreboard />

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
  const shown = list;
  const years = Array.from({ length: 10 }, (_, i) => decade + i);
  return (
    <>
      <Crumbs items={[['Calendar', href.home], [`${decade}s`]]} />
      <PageHead eyebrow="Decade" title={`The ${decade}s`}>
        <p className="lede">{shown.length} narratives.</p>
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
  const shown = list;
  const ongoing = list.filter((s) => s.kind === 'storyline');
  const events = list.filter((s) => s.kind === 'moment');
  return (
    <>
      <Crumbs items={[['Calendar', href.home], [`${decade}s`, href.decade(decade)], [String(year)]]} />
      <PageHead eyebrow="Year" title={String(year)}>
        <SeasonLinks seasons={seasonsInYear(year).filter((s) => s <= currentSeason())} />
      </PageHead>
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
      <Section title="Moments" count={events.length}>
        <Timeline stories={events} showYear={false} empty="No dated moments on file for this year yet." />
      </Section>
      <Section title="Storylines running this year" count={ongoing.length}>
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
  const shown = list;
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
                  <span key={s.id} className="dot">{s.title}</span>
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
      <Section title="What happened" count={moments.length}>
        <Timeline stories={moments} empty="No moments on file for this day yet." />
      </Section>
      <Section title="Storylines in progress" count={ongoing.length}>
        <Timeline stories={ongoing} empty="No long-running storylines were underway on this date." />
      </Section>
      <Section title={`${MONTHS[month - 1]} ${day} in other years`} count={otherYears.length}
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
      <dl className="facts">
        {story.players.length > 0 && (
          <div><dt>Players</dt><dd>{story.players.map((p) => <a key={p} className="chip" href={href.player(p)}>{getPlayer(p)?.name}</a>)}</dd></div>
        )}
        {story.teams.length > 0 && (
          <div><dt>Teams</dt><dd>{story.teams.map((t) => <a key={t} className="chip chip-team" href={href.team(t)}>{getTeam(t)?.name}</a>)}</dd></div>
        )}
        {story.categories?.length ? (
          <div><dt>Season page</dt><dd>
            {story.league === 'NBA' && <a className="chip chip-team" href={href.season(seasonOf(story))}>{seasonLabel(seasonOf(story))} NBA season</a>}
            {story.categories.map((c) => <a key={c} className="chip chip-cat" href={href.category(c)}>{categoryInfo(c)?.name}</a>)}
          </dd></div>
        ) : null}
        <div><dt>Themes</dt><dd>{story.tags.map((t) => <span key={t} className="chip chip-plain">{t}</span>)}</dd></div>
        {story.aliases && <div><dt>Also called</dt><dd>{story.aliases.join(', ')}</dd></div>}
      </dl>
      {rel.length > 0 && (
        <Section title="Related narratives">
          <Timeline stories={rel} />
        </Section>
      )}
      {isSourced(story)
        ? <Citations list={story.sources!} />
        : <p className="draft-note">Draft narrative. Sources still need to be added and checked before launch.</p>}
    </article>
  );
}

function Citations({ list }: { list: Citation[] }) {
  // gam's rule: cite each source once at the bottom of the page, with no timestamps or quotes shown.
  const ids = [...new Set(list.map((c) => c.source))];
  return (
    <section className="citations" aria-label="Sources">
      <h2>Sources</h2>
      <ol>
        {ids.map((id) => {
          const src = getSource(id);
          if (!src) return null;
          return (
            <li key={id}>
              <a href={href.source(src.id)}>{src.title}</a>
              <span className="cite-meta"> · {src.outlet} · {SOURCE_KIND[src.kind]}</span>
            </li>
          );
        })}
      </ol>
    </section>
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

/* ── Sources: the videos, podcasts and articles narratives come from ── */

function SourceRow({ src }: { src: Source }) {
  const n = storiesFromSource(src.id).length;
  return (
    <li>
      <a href={href.source(src.id)}>{src.title}</a>
      <span>{SOURCE_KIND[src.kind]} · {src.outlet} · {n} {n === 1 ? 'narrative' : 'narratives'}</span>
    </li>
  );
}

export function SourcesPage() {
  const sourced = allStories.filter(isSourced).length;
  return (
    <>
      <PageHead eyebrow="Library" title="Sources">
        <p className="lede">The videos, podcasts, articles and books behind the narratives. {sourced} of {allStories.length} narratives cite one so far.</p>
      </PageHead>
      {allSources.length
        ? <ul className="directory directory-wide">{allSources.map((src) => <SourceRow key={src.id} src={src} />)}</ul>
        : <Empty>No sources yet. Send a video or podcast link in the project chat and it will show up here with the narratives drawn from it.</Empty>}
    </>
  );
}

export function SourcePage({ id }: { id: string }) {
  const src = getSource(id);
  if (!src) return <NotFound what="source" />;
  const yt = youtubeId(src.url);
  const list = storiesFromSource(id);
  return (
    <>
      <Crumbs items={[['Sources', href.sources], [src.title]]} />
      <PageHead eyebrow={`${SOURCE_KIND[src.kind]} · ${src.outlet}`} title={src.title}>
        <p className="lede">{src.about}</p>
      </PageHead>
      {yt && (
        <div className="embed">
          <iframe src={`https://www.youtube-nocookie.com/embed/${yt}`} title={src.title} loading="lazy"
            allow="encrypted-media; picture-in-picture" allowFullScreen />
        </div>
      )}
      <dl className="facts">
        {src.published && <div><dt>Published</dt><dd>{formatDate(src.published)}</dd></div>}
        <div><dt>Added</dt><dd>{formatDate(src.added)}</dd></div>
        {src.url && <div><dt>Link</dt><dd><a href={src.url} target="_blank" rel="noopener noreferrer">{src.kind === 'podcast' ? 'Listen' : src.kind === 'video' ? 'Watch' : 'Read'} on {new URL(src.url).hostname.replace(/^www\./, '')}</a></dd></div>}
      </dl>
      <Section title="Narratives from this source" count={list.length}>
        <Timeline stories={list} empty="Nothing drawn from this source yet." />
      </Section>
    </>
  );
}

/* ── Search ─────────────────────────────────────────────────────────── */

export function SearchPage({ query }: { query: string }) {
  const r = useMemo(() => search(query), [query]);
  const shown = r.stories;
  if (!query.trim()) {
    return (
      <PageHead eyebrow="Search" title="Search the calendar">
        <p className="lede">Try a date like “March 2, 1962”, a decade like “1960s”, a player, a team, or a story like “The Decision”.</p>
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
      {(dateLink || r.players.length > 0 || r.teams.length > 0 || r.sources.length > 0) && (
        <div className="matches">
          {dateLink && <a className="match match-date" href={dateLink[1]}>{dateLink[0]} on the calendar →</a>}
          {r.players.map((p) => <a key={p.id} className="match" href={href.player(p.id)}><small>Player</small>{p.name}</a>)}
          {r.teams.map((t) => <a key={t.id} className="match" href={href.team(t.id)}><small>Team</small>{t.name}</a>)}
          {r.sources.map((src) => <a key={src.id} className="match" href={href.source(src.id)}><small>{SOURCE_KIND[src.kind]}</small>{src.title}</a>)}
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

/* ── NBA seasons and categories ─────────────────────────────────────── */

function SeasonLinks({ seasons }: { seasons: number[] }) {
  if (!seasons.length) return null;
  return (
    <p className="seasonlinks">
      <span>NBA season pages:</span>
      {seasons.map((s) => <a key={s} href={href.season(s)}>{seasonLabel(s)}</a>)}
    </p>
  );
}

function CategoryTabs({ current }: { current?: string }) {
  return (
    <nav className="cattabs" aria-label="Categories">
      {CATEGORIES.map((c) => (
        <a key={c.id} href={href.category(c.id)} aria-current={c.id === current ? 'page' : undefined}>{c.name}</a>
      ))}
    </nav>
  );
}

/**
 * A season section as one overview of the whole race or storyline, with the
 * individual narratives it draws on listed underneath as links. Team, player
 * and story pages keep showing the individual narratives in full.
 */
function SeasonOverview({ season, category, stories }: { season: number; category: Category; stories: Story[] }) {
  const text = seasonOverview(season, category);
  return (
    <div className="overview">
      {text
        ? <p className="overview-text">{text}</p>
        : <p className="empty">No season overview written yet. The stories are below.</p>}
      <div className="overview-sources">
        <span>{stories.length === 1 ? 'The story behind it' : `The ${stories.length} stories behind it`}</span>
        <ul>
          {stories.map((st) => (
            <li key={st.id}>
              <a href={href.story(st.id)}>{st.title}</a>
              <small>{formatSpan(st)}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const inCategory = (list: Story[], c: Category) => list.filter((s) => s.categories?.includes(c));

export function SeasonsPage() {
  const [onlyFilled, setOnlyFilled] = useState(false);
  const last = currentSeason();
  const rows = useMemo(
    () => Array.from({ length: last - FIRST_SEASON + 1 }, (_, i) => {
      const start = last - i;
      const list = storiesInSeason(start);
      return { start, total: list.length, counts: CATEGORIES.map((c) => inCategory(list, c.id).length) };
    }),
    [last],
  );
  const shown = onlyFilled ? rows.filter((r) => r.total > 0) : rows;
  const totals = CATEGORIES.map((_, i) => rows.reduce((n, r) => n + r.counts[i], 0));
  return (
    <>
      <Crumbs items={[['Calendar', href.home], ['NBA seasons']]} />
      <PageHead eyebrow="NBA" title="Seasons">
        <p className="lede">Every season from {seasonLabel(FIRST_SEASON)} on, split into the same four sections: the MVP race, the draft, the contenders and the surprises. Each one starts with what people expected at the time.</p>
      </PageHead>
      <CategoryTabs />
      <div className="tablebar">
        <label className="check">
          <input type="checkbox" checked={onlyFilled} onChange={(e) => setOnlyFilled(e.target.checked)} />
          Only seasons with narratives
        </label>
        <span className="note">{rows.filter((r) => r.total > 0).length} of {rows.length} seasons have narratives so far</span>
      </div>
      <div className="table-wrap">
        <table className="stats">
          <thead>
            <tr>
              <th scope="col">Season</th>
              {CATEGORIES.map((c) => <th key={c.id} scope="col" className="num"><a href={href.category(c.id)}>{c.name}</a></th>)}
              <th scope="col" className="num">All</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.start} className={r.total ? '' : 'is-quiet'}>
                <th scope="row"><a href={href.season(r.start)}>{seasonLabel(r.start)}</a></th>
                {r.counts.map((n, i) => <td key={i} className="num">{n || '—'}</td>)}
                <td className="num"><strong>{r.total || '—'}</strong></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total</th>
              {totals.map((n, i) => <td key={i} className="num">{n}</td>)}
              <td className="num"><strong>{rows.reduce((n, r) => n + r.total, 0)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}

export function SeasonPage({ start }: { start: number }) {
  const last = currentSeason();
  if (start < FIRST_SEASON || start > last) return <NotFound what="season" />;
  const label = seasonLabel(start);
  const list = storiesInSeason(start);
  const other = list.filter((s) => !s.categories?.length);
  return (
    <>
      <Crumbs items={[['Calendar', href.home], ['NBA seasons', href.seasons], [label]]} />
      <PageHead eyebrow="NBA season" title={`${label} NBA season`}>
        <p className="lede">
          July {start} to June {start + 1}, from free agency to the Finals, plus the {start} draft.{' '}
          {list.length ? `${list.length} ${list.length === 1 ? 'narrative' : 'narratives'} on file.` : 'No narratives on file yet.'}
        </p>
        <p className="seasonlinks">
          <span>Calendar:</span>
          <a href={href.year(start)}>{start}</a>
          {start + 1 <= new Date().getFullYear() && <a href={href.year(start + 1)}>{start + 1}</a>}
        </p>
      </PageHead>
      {CATEGORIES.map((c) => {
        const rows = inCategory(list, c.id);
        return (
          <Section key={c.id} title={c.name} count={rows.length}
            aside={<a className="more" href={href.category(c.id)}>Every season →</a>}>
            {rows.length
              ? <SeasonOverview season={start} category={c.id} stories={rows} />
              : <Empty>No {c.name} narratives for {label} yet.</Empty>}
            <SeasonFacts season={start} category={c.id} />
          </Section>
        );
      })}
      {other.length > 0 && (
        <Section title="Also this season" count={other.length}>
          <div className="overview-sources overview-plain">
            <ul>
              {other.map((st) => (
                <li key={st.id}><a href={href.story(st.id)}>{st.title}</a><small>{formatSpan(st)}</small></li>
              ))}
            </ul>
          </div>
        </Section>
      )}
      <PrevNext
        prev={start > FIRST_SEASON ? [seasonLabel(start - 1), href.season(start - 1)] : undefined}
        next={start < last ? [seasonLabel(start + 1), href.season(start + 1)] : undefined}
      />
    </>
  );
}

export function CategoryPage({ id }: { id: string }) {
  const [decade, setDecade] = useState<number | 'all'>('all');
  const info = categoryInfo(id);
  if (!info || !isCategory(id)) return <NotFound what="category" />;
  const list = storiesInCategory(id).filter((s) => s.league === 'NBA');
  const decades = [...new Set(list.map((s) => Math.floor(seasonOf(s) / 10) * 10))].sort();
  const shown = decade === 'all' ? list : list.filter((s) => Math.floor(seasonOf(s) / 10) * 10 === decade);
  const bySeason = new Map<number, Story[]>();
  for (const s of shown) bySeason.set(seasonOf(s), [...(bySeason.get(seasonOf(s)) ?? []), s]);
  const seasons = [...bySeason.keys()].sort((a, b) => b - a);
  return (
    <>
      <Crumbs items={[['Calendar', href.home], ['NBA seasons', href.seasons], [info.name]]} />
      <PageHead eyebrow="NBA category" title={info.name}>
        <p className="lede">{info.blurb} {list.length} narratives across {new Set(list.map(seasonOf)).size} seasons, newest season first.</p>
      </PageHead>
      <CategoryTabs current={id} />
      {decades.length > 1 && (
        <div className="toggle decadefilter" role="group" aria-label="Show decade">
          <button type="button" aria-pressed={decade === 'all'} onClick={() => setDecade('all')}>All</button>
          {decades.map((d) => (
            <button key={d} type="button" aria-pressed={decade === d} onClick={() => setDecade(d)}>{d}s</button>
          ))}
        </div>
      )}
      {seasons.length ? seasons.map((s) => (
        <Section key={s} title={seasonLabel(s)} count={bySeason.get(s)!.length}
          aside={<a className="more" href={href.season(s)}>Full season →</a>}>
          <SeasonOverview season={s} category={id} stories={bySeason.get(s)!} />
        </Section>
      )) : <Empty>No {info.name} narratives yet.</Empty>}
    </>
  );
}
