import { useMemo, useState, type ReactNode } from 'react';
import { Crumbs, Empty, PageHead, Section, Timeline } from './components';
import type { Category, Story } from './data/types';
import { DIVISIONS, franchises } from './data/franchises';
import { NOTION_VERDICTS, notions, type NotionVerdict } from './data/notions';
import { allStories, getPlayer, getTeam, nbaStories, storiesForPlayer, storiesForTeam, teams } from './lib/db';
import { headline, notionFor, notionsIn, verdictCounts, type StoryNotion } from './lib/notions';
import { LAST_BBREF_SEASON, franchiseTotals, nameHistory, teamSeasons, type TeamSeason } from './lib/teamSeasons';
import { CATEGORIES, seasonLabel, seasonOf } from './lib/seasons';
import { href } from './lib/router';
import { matchesSource, type SourceFilter } from './lib/filters';
import { normalize } from './lib/search';
import { FilterBox, SourcePicker } from './filterBar';
import { Headshot, TeamBadge, TeamBanner, TeamTheme } from './teamLook';

/*
 * The year-over-year layer (gam, 2026-11-26): team and player pages read as a
 * season-by-season story, and every narrative that states one carries a
 * "preconceived notion": what people expected at the time against what
 * happened. The narratives themselves are shown unchanged underneath.
 */

const VERDICT_ORDER: NotionVerdict[] = ['busted', 'mixed', 'held', 'open'];

export function VerdictTag({ verdict }: { verdict: NotionVerdict }) {
  return <span className={`nv nv-${verdict}`}>{NOTION_VERDICTS[verdict]}</span>;
}

/** The expected-vs-happened box at the top of a story page. */
export function NotionBox({ story }: { story: Story }) {
  const n = notionFor(story);
  if (!n) return null;
  return (
    <aside className="notionbox" aria-label="Preconceived notion">
      <div className="notionbox-head">
        <a href={href.notions}>Preconceived notion</a>
        <VerdictTag verdict={n[2]} />
      </div>
      <dl>
        <div><dt>Expected at the time</dt><dd>{n[0]}</dd></div>
        <div><dt>What happened</dt><dd>{n[1]}</dd></div>
      </dl>
    </aside>
  );
}

/** A one-line tally: "12 busted, 3 partly right, 2 held". */
function Tally({ list }: { list: StoryNotion[] }) {
  const c = verdictCounts(list);
  const parts = VERDICT_ORDER.filter((v) => c[v]).map((v) => `${c[v]} ${NOTION_VERDICTS[v].toLowerCase().replace('consensus ', '')}`);
  return <span className="note">{parts.join(' · ')}</span>;
}

/** Expected vs. what happened, one row per narrative, newest season first unless told otherwise. */
export function NotionsTable({ list, showSeason = true, showStory = true }: { list: StoryNotion[]; showSeason?: boolean; showStory?: boolean }) {
  if (!list.length) return <Empty>No preconceived notions on file here yet.</Empty>;
  return (
    <div className="table-wrap">
      <table className="stats notions">
        <thead>
          <tr>
            {showSeason && <th scope="col">Season</th>}
            {showStory && <th scope="col">Narrative</th>}
            <th scope="col">Expected at the time</th>
            <th scope="col">What happened</th>
            <th scope="col">Verdict</th>
          </tr>
        </thead>
        <tbody>
          {list.map((n) => (
            <tr key={n.story.id}>
              {showSeason && <td><a href={href.season(seasonOf(n.story))}>{seasonLabel(seasonOf(n.story))}</a></td>}
              {showStory && <td className="wrap"><a href={href.story(n.story.id)}>{n.story.title}</a></td>}
              <td className="wrap">{n.expected}</td>
              <td className="wrap">{n.happened}</td>
              <td><VerdictTag verdict={n.verdict} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const newestFirst = (a: StoryNotion, b: StoryNotion) =>
  seasonOf(b.story) - seasonOf(a.story) || b.story.date.localeCompare(a.story.date);

/** Group a list of stories by NBA season, newest first. */
function bySeason(list: Story[]): [number, Story[]][] {
  const m = new Map<number, Story[]>();
  for (const s of list) m.set(seasonOf(s), [...(m.get(seasonOf(s)) ?? []), s]);
  return [...m.entries()].sort((a, b) => b[0] - a[0]);
}

/** Headlines for a season: each story title, marked with how its notion turned out. */
function Headlines({ stories }: { stories: Story[] }) {
  if (!stories.length) return <span className="muted">—</span>;
  return (
    <ul className="headlines">
      {stories.map((s) => {
        const n = notionFor(s);
        return (
          <li key={s.id}>
            <a href={href.story(s.id)}>{headline(s)}</a>
            {n && <span className={`nv-dot nv-${n[2]}`} title={`${NOTION_VERDICTS[n[2]]}: expected ${n[0]}`} />}
          </li>
        );
      })}
    </ul>
  );
}

/** Every narrative, in full, under a heading for its season. */
function NarrativesBySeason({ list }: { list: Story[] }) {
  const groups = bySeason(list);
  if (!groups.length) return <Empty>No narratives on file yet.</Empty>;
  return (
    <div className="byseason">
      {groups.map(([season, stories]) => (
        <div key={season} className="byseason-group">
          <h3><a href={href.season(season)}>{seasonLabel(season)}</a></h3>
          <Timeline stories={stories} />
        </div>
      ))}
    </div>
  );
}

function OnlyToggle({ only, set, label }: { only: boolean; set: (v: boolean) => void; label: ReactNode }) {
  return (
    <div className="tablebar tablebar-flow">
      <div className="toggle" role="group" aria-label="Seasons shown">
        <button type="button" aria-pressed={only} onClick={() => set(true)}>Seasons with narratives</button>
        <button type="button" aria-pressed={!only} onClick={() => set(false)}>Every season</button>
      </div>
      <span className="note">{label}</span>
    </div>
  );
}

/* ── Team page ───────────────────────────────────────────────────────── */

function YearByYear({ rows }: { rows: TeamSeason[] }) {
  const [only, setOnly] = useState(true);
  const shown = only ? rows.filter((r) => r.stories.length) : rows;
  const showName = new Set(rows.map((r) => r.name).filter(Boolean)).size > 1;
  return (
    <>
      <OnlyToggle only={only} set={setOnly}
        label={<>Records and finishes from Basketball Reference. A dot marks a preconceived notion: <span className="nv-dot nv-busted" /> busted, <span className="nv-dot nv-mixed" /> partly right, <span className="nv-dot nv-held" /> held.</>} />
      <div className="table-wrap">
        <table className="stats yby">
          <thead>
            <tr>
              <th scope="col">Season</th>
              {showName && <th scope="col" className="col-name">Team</th>}
              <th scope="col" className="num">W-L</th>
              <th scope="col">Finish</th>
              <th scope="col">The story that season</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.season} className={`${r.stories.length ? '' : 'is-quiet'} ${r.champion ? 'is-key' : ''}`}>
                <th scope="row"><a href={href.season(r.season)}>{seasonLabel(r.season)}</a></th>
                {showName && <td className="col-name">{r.name ?? ''}</td>}
                <td className="num">{r.wins !== undefined ? `${r.wins}-${r.losses}` : '—'}</td>
                <td>{r.finish ?? (r.season > LAST_BBREF_SEASON ? 'Season in progress' : 'Not in the league')}</td>
                <td className="wrap"><Headlines stories={r.stories} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function TeamPage({ id }: { id: string }) {
  const t = getTeam(id);
  const list = useMemo(() => storiesForTeam(id), [id]);
  const rows = useMemo(() => teamSeasons(id, list), [id, list]);
  if (!t) return null;
  const f = franchises[id];
  const totals = franchiseTotals(rows);
  const names = nameHistory(rows);
  const notes = notionsIn(list).sort(newestFirst);
  const lastPlayed = Math.max(...rows.filter((r) => r.wins !== undefined).map((r) => r.season));
  return (
    <TeamTheme id={id}>
      <Crumbs items={[['Teams', href.teams], [t.name]]} />
      <TeamBanner id={id} />
      {names.length > 1 && (
        <header className="pagehead">
          <p className="lede">
            Played as {names.map((n, i) => (
              <span key={n.name + n.from}>{i ? (i === names.length - 1 ? ' and ' : ', ') : ''}the {n.name} ({seasonLabel(n.from)}{n.to !== n.from ? ` to ${n.to === lastPlayed && f?.conference ? 'today' : seasonLabel(n.to)}` : ''})</span>
            ))}.
          </p>
        </header>
      )}
      {totals.seasons > 0 && (
        <dl className="facts">
          <div><dt>Seasons</dt><dd>{totals.seasons} in the BAA/NBA, {totals.wins}-{totals.losses} all time</dd></div>
          <div><dt>Playoffs</dt><dd>{totals.playoffs} trips</dd></div>
          <div><dt>Titles</dt><dd>{totals.titles.length
            ? totals.titles.map((s) => <a key={s} className="chip chip-team" href={href.season(s)}>{s + 1}</a>)
            : 'None'}</dd></div>
          <div><dt>On file</dt><dd>{list.length} narratives across {rows.filter((r) => r.stories.length).length} seasons, {notes.length} with a preconceived notion</dd></div>
        </dl>
      )}
      <Section title="Year by year" count={rows.filter((r) => r.stories.length).length}>
        <YearByYear rows={rows} />
      </Section>
      <Section title="Preconceived notions" count={notes.length} aside={<Tally list={notes} />}>
        <p className="section-lede">What people expected about the {t.name.split(' ').slice(-1)[0]} at the time, against what happened.</p>
        <NotionsTable list={notes} />
      </Section>
      <Section title="Every narrative, season by season" count={list.length}>
        <NarrativesBySeason list={list} />
      </Section>
    </TeamTheme>
  );
}

/* ── Player page ─────────────────────────────────────────────────────── */

export function PlayerPage({ id }: { id: string }) {
  const p = getPlayer(id);
  const list = useMemo(() => storiesForPlayer(id), [id]);
  if (!p) return null;
  const groups = bySeason(list);
  const notes = notionsIn(list).sort(newestFirst);
  const first = groups[groups.length - 1]?.[0];
  const last = groups[0]?.[0];
  return (
    <>
      <Crumbs items={[['Players', href.players], [p.name]]} />
      <div className="playerhead">
      <Headshot id={id} />
      <PageHead eyebrow={`Player · ${p.league}`} title={p.name}>
        {p.aliases?.length ? <p className="lede">Also known as {p.aliases.join(', ')}.</p> : null}
        {first !== undefined && (
          <p className="lede">{list.length} narratives from {seasonLabel(first)}{last !== first ? ` to ${seasonLabel(last)}` : ''}, {notes.length} with a preconceived notion.</p>
        )}
      </PageHead>
      </div>
      <Section title="Year by year" count={groups.length}>
        <p className="section-lede">One line per season: the stories told about {p.name} that year. A dot marks a preconceived notion: <span className="nv-dot nv-busted" /> busted, <span className="nv-dot nv-mixed" /> partly right, <span className="nv-dot nv-held" /> held.</p>
        {groups.length ? (
          <div className="table-wrap">
            <table className="stats yby">
              <thead><tr><th scope="col">Season</th><th scope="col">Teams</th><th scope="col">The story that season</th></tr></thead>
              <tbody>
                {groups.map(([season, stories]) => (
                  <tr key={season}>
                    <th scope="row"><a href={href.season(season)}>{seasonLabel(season)}</a></th>
                    <td className="wrap">{[...new Set(stories.flatMap((s) => s.teams))].slice(0, 3).map((t) => (
                      <a key={t} href={href.team(t)} className="tm">{getTeam(t)?.name.split(' ').slice(-1)[0]}</a>
                    ))}</td>
                    <td className="wrap"><Headlines stories={stories} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>No narratives on file yet.</Empty>}
      </Section>
      <Section title="Preconceived notions" count={notes.length} aside={<Tally list={notes} />}>
        <NotionsTable list={notes} />
      </Section>
      <Section title="Every narrative, season by season" count={list.length}>
        <NarrativesBySeason list={list} />
      </Section>
    </>
  );
}

/* ── Teams directory: by conference and division ─────────────────────── */

function TeamRows({ ids }: { ids: string[] }) {
  return (
    <tbody>
      {ids.map((id) => {
        const t = getTeam(id)!;
        const list = storiesForTeam(id);
        const rows = teamSeasons(id, list);
        const tot = franchiseTotals(rows);
        const notes = notionsIn(list);
        const latest = list[list.length - 1];
        return (
          <tr key={id}>
            <th scope="row"><a href={href.team(id)} className="teamlink"><TeamBadge id={id} size="sm" />{t.name}</a></th>
            <td className="num">{tot.seasons || '—'}</td>
            <td className="num">{tot.titles.length || '—'}</td>
            <td className="num">{list.length}</td>
            <td className="num">{notes.length}</td>
            <td className="wrap">{latest ? <><a href={href.story(latest.id)}>{latest.title}</a> <small className="muted">{seasonLabel(seasonOf(latest))}</small></> : '—'}</td>
          </tr>
        );
      })}
    </tbody>
  );
}

const TEAM_HEAD = (
  <thead>
    <tr>
      <th scope="col">Team</th><th scope="col" className="num">Seasons</th><th scope="col" className="num">Titles</th>
      <th scope="col" className="num">Narratives</th><th scope="col" className="num">Notions</th><th scope="col">Latest story</th>
    </tr>
  </thead>
);

export function TeamsDirectory() {
  const known = new Set(teams.map((t) => t.id));
  const groups = DIVISIONS.map(([conf, div]) => ({
    conf, div,
    ids: Object.entries(franchises).filter(([id, f]) => f.division === div && known.has(id)).map(([id]) => id)
      .sort((a, b) => getTeam(a)!.name.localeCompare(getTeam(b)!.name)),
  }));
  const former = teams.filter((t) => !franchises[t.id]?.conference).map((t) => t.id);
  return (
    <>
      <PageHead eyebrow="Directory" title="Teams">
        <p className="lede">Every franchise by today's conference and division, with the old names folded in: the Seattle SuperSonics are under the Thunder, the Minneapolis Lakers under the Lakers. Each team page runs year by year.</p>
      </PageHead>
      {(['East', 'West'] as const).map((conf) => (
        <Section key={conf} title={`${conf}ern Conference`}>
          <div className="table-wrap">
            <table className="stats teamdir">
              {TEAM_HEAD}
              {groups.filter((g) => g.conf === conf).map((g) => (
                <TeamDivision key={g.div} name={`${g.div} Division`} ids={g.ids} />
              ))}
            </table>
          </div>
        </Section>
      ))}
      {former.length > 0 && (
        <Section title="Former franchises" count={former.length}>
          <div className="table-wrap"><table className="stats teamdir">{TEAM_HEAD}<TeamRows ids={former} /></table></div>
        </Section>
      )}
    </>
  );
}

function TeamDivision({ name, ids }: { name: string; ids: string[] }) {
  return (
    <>
      <tbody><tr className="subhead"><th scope="colgroup" colSpan={6}>{name}</th></tr></tbody>
      <TeamRows ids={ids} />
    </>
  );
}

/* ── Preconceived notions: every one, filterable ─────────────────────── */

export function NotionsPage({ initialVerdict }: { initialVerdict?: NotionVerdict }) {
  const [verdict, setVerdict] = useState<NotionVerdict | 'all'>(initialVerdict ?? 'all');
  const [source, setSource] = useState<SourceFilter>('all');
  const [text, setText] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [decade, setDecade] = useState<number | 'all'>('all');
  const all = useMemo(() => notionsIn(nbaStories).sort(newestFirst), []);
  const decades = [...new Set(all.map((n) => Math.floor(seasonOf(n.story) / 10) * 10))].sort((a, b) => b - a);
  const shown = all.filter((n) =>
    (verdict === 'all' || n.verdict === verdict)
    && (category === 'all' || n.story.categories?.includes(category))
    && (decade === 'all' || Math.floor(seasonOf(n.story) / 10) * 10 === decade)
    && matchesSource(n.story, source)
    && textMatches(text, n));
  const groups = new Map<number, StoryNotion[]>();
  for (const n of shown) groups.set(seasonOf(n.story), [...(groups.get(seasonOf(n.story)) ?? []), n]);
  const c = verdictCounts(all);
  return (
    <>
      <Crumbs items={[['Calendar', href.home], ['Preconceived notions']]} />
      <PageHead eyebrow="NBA" title="Preconceived notions">
        <p className="lede">
          What people expected at the time, against what happened. One line each, drawn from the narrative it links to
          and its sources. Of {all.length} notions on file, the consensus held {c.held} times and was wrong {c.busted} times.
        </p>
      </PageHead>
      <div className="filters">
        <div className="toggle" role="group" aria-label="Verdict">
          <button type="button" aria-pressed={verdict === 'all'} onClick={() => setVerdict('all')}>All</button>
          {VERDICT_ORDER.map((v) => (
            <button key={v} type="button" aria-pressed={verdict === v} onClick={() => setVerdict(v)}>{NOTION_VERDICTS[v]} ({c[v]})</button>
          ))}
        </div>
        <div className="toggle" role="group" aria-label="Section">
          <button type="button" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>Every section</button>
          {CATEGORIES.map((cat) => (
            <button key={cat.id} type="button" aria-pressed={category === cat.id} onClick={() => setCategory(cat.id)}>{cat.name}</button>
          ))}
        </div>
        <div className="toggle decadefilter" role="group" aria-label="Decade">
          <button type="button" aria-pressed={decade === 'all'} onClick={() => setDecade('all')}>All</button>
          {decades.map((d) => <button key={d} type="button" aria-pressed={decade === d} onClick={() => setDecade(d)}>{d}s</button>)}
        </div>
        <div className="filterrow">
          <SourcePicker list={all.map((n) => n.story)} value={source} onChange={setSource} />
          <FilterBox value={text} onChange={setText} label="Filter notions" placeholder="Filter by name or word" />
        </div>
      </div>
      <p className="note">{shown.length} shown, newest season first.</p>
      {[...groups.entries()].map(([season, list]) => (
        <Section key={season} title={`${seasonLabel(season)}`} count={list.length}
          aside={<a className="more" href={href.season(season)}>Season page →</a>}>
          <NotionsTable list={list} showSeason={false} />
        </Section>
      ))}
      {!shown.length && <Empty>No notions match these filters.</Empty>}
    </>
  );
}

/** Every word of the filter starts a word in the notion, its narrative, players or teams. */
function textMatches(q: string, n: StoryNotion): boolean {
  const words = normalize(q).split(' ').filter(Boolean);
  if (!words.length) return true;
  const hay = normalize([
    n.expected, n.happened, n.story.title, ...n.story.tags,
    ...n.story.players.map((p) => getPlayer(p)?.name ?? ''), ...n.story.teams.map((t) => getTeam(t)?.name ?? ''),
  ].join(' ')).split(' ');
  return words.every((w) => hay.some((h) => h.startsWith(w)));
}

/** Season page section: the notions from that season's narratives. */
export function SeasonNotions({ stories }: { stories: Story[] }) {
  const list = notionsIn(stories);
  if (!list.length) return null;
  return (
    <section className="section">
      <details className="dropdown">
        <summary className="section-head">
          <h2>Preconceived notions <span className="count">{list.length}</span></h2>
          <Tally list={list} />
          <span className="dropdown-hint" aria-hidden="true" />
        </summary>
        <p className="section-lede">What everyone expected this season, and what happened instead.</p>
        <NotionsTable list={list} showSeason={false} />
      </details>
    </section>
  );
}

/** Home page teaser: the most recent busted notions. */
export function NotionsTeaser() {
  const list = notionsIn(allStories).filter((n) => n.verdict === 'busted').sort(newestFirst).slice(0, 6);
  return (
    <Section title="Preconceived notions" count={Object.keys(notions).length}
      aside={<a className="more" href={href.notions}>Every notion →</a>}>
      <p className="section-lede">What everyone expected, and what happened instead.</p>
      <NotionsTable list={list} />
    </Section>
  );
}

