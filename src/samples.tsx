import { useMemo, useState, type ReactNode } from 'react';
import { Crumbs, Empty, PageHead, Section } from './components';
import type { Story } from './data/types';
import { getPlayer, getTeam, players, storiesForPlayer, storiesForTeam, teams } from './lib/db';
import { notionsIn, type StoryNotion } from './lib/notions';
import { VOICES, byCategory, callsBy, consensusCalls, pct, score, type Score } from './lib/hotTakes';
import { CATEGORIES, seasonLabel, seasonOf } from './lib/seasons';
import { teamSeasons, franchiseTotals, type TeamSeason } from './lib/teamSeasons';
import { href } from './lib/router';
import { VerdictTag } from './byYear';
import { Headshot, TeamBadge } from './teamLook';

/*
 * SAMPLE pages (gam, 2026-11-27), shown on a separate preview for gam to pick
 * from: the hot takes tracker and the player / team comparison pages. Nothing
 * here changes a narrative; every score and line comes from src/data/notions.ts,
 * the narratives' sources and the Basketball Reference snapshot.
 */

export function SampleBar() {
  return (
    <div className="samplebar" role="note">
      <strong>Sample preview</strong> Try the <a href={href.hotTakes}>Hot takes tracker</a>,{' '}
      <a href={href.compare('players', 'lebron-james', 'kevin-durant')}>Compare players</a> and{' '}
      <a href={href.compare('teams', 'celtics', 'lakers')}>Compare teams</a>. Not on the live site yet.
    </div>
  );
}

/* ── Hot takes tracker ───────────────────────────────────────────────── */

function RateBar({ s }: { s: Score }) {
  const total = s.held + s.mixed + s.busted;
  if (!total) return <span className="muted">—</span>;
  const w = (n: number) => `${(n / total) * 100}%`;
  return (
    <span className="ratebar" aria-hidden="true">
      <span className="rb-held" style={{ width: w(s.held) }} />
      <span className="rb-mixed" style={{ width: w(s.mixed) }} />
      <span className="rb-busted" style={{ width: w(s.busted) }} />
    </span>
  );
}

function ScoreRow({ name, sub, s, link }: { name: ReactNode; sub?: string; s: Score; link?: string }) {
  return (
    <tr>
      <th scope="row" className="wrap">{link ? <a href={link}>{name}</a> : name}{sub && <small className="muted block">{sub}</small>}</th>
      <td className="num">{s.calls.length}</td>
      <td className="num nv-held">{s.held}</td>
      <td className="num nv-mixed">{s.mixed}</td>
      <td className="num nv-busted">{s.busted}</td>
      <td className="num"><strong>{pct(s.rate)}</strong></td>
      <td className="col-bar"><RateBar s={s} /></td>
    </tr>
  );
}

const SCORE_HEAD = (first: string) => (
  <thead>
    <tr>
      <th scope="col">{first}</th><th scope="col" className="num">Calls</th>
      <th scope="col" className="num">Right</th><th scope="col" className="num">Partly</th><th scope="col" className="num">Wrong</th>
      <th scope="col" className="num">Hit rate</th><th scope="col" className="col-bar"><span className="visually-hidden">Chart</span></th>
    </tr>
  </thead>
);

function CallsTable({ list }: { list: StoryNotion[] }) {
  if (!list.length) return <Empty>No calls here yet.</Empty>;
  return (
    <div className="table-wrap">
      <table className="stats notions">
        <thead><tr><th scope="col">Season</th><th scope="col">The call</th><th scope="col">What happened</th><th scope="col">Verdict</th></tr></thead>
        <tbody>
          {list.map((n) => (
            <tr key={n.story.id}>
              <td><a href={href.season(seasonOf(n.story))}>{seasonLabel(seasonOf(n.story))}</a></td>
              <td className="wrap"><a href={href.story(n.story.id)}>{n.expected}</a></td>
              <td className="wrap">{n.happened}</td>
              <td><VerdictTag verdict={n.verdict} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function HotTakesPage({ voice }: { voice?: string }) {
  const rows = useMemo(() => VOICES.map((v) => ({ v, s: score(callsBy(v)) })).filter((r) => r.s.calls.length), []);
  const consensus = useMemo(() => score(consensusCalls), []);
  const ranked = [...rows].sort((a, b) => (b.s.rate ?? -1) - (a.s.rate ?? -1));
  const [show, setShow] = useState<'busted' | 'held' | 'all'>('all');
  const picked = rows.find((r) => r.v.id === voice);
  if (picked) {
    const { v, s } = picked;
    const list = s.calls.filter((n) => show === 'all' || n.verdict === show || (show === 'held' && n.verdict === 'mixed'));
    return (
      <>
        <SampleBar />
        <Crumbs items={[['Hot takes tracker', href.hotTakes], [v.name]]} />
        <PageHead eyebrow="Hot takes tracker" title={v.name}>
          <p className="lede">{v.about} Right {s.held}, partly right {s.mixed}, wrong {s.busted}: a <strong>{pct(s.rate)}</strong> hit rate.</p>
        </PageHead>
        <Section title="By section">
          <div className="table-wrap"><table className="stats scoreboard-t">{SCORE_HEAD('Section')}
            <tbody>{CATEGORIES.map((c) => ({ c, s: score(byCategory(s.calls, c.id)) })).filter((x) => x.s.calls.length)
              .map(({ c, s: cs }) => <ScoreRow key={c.id} name={c.name} s={cs} />)}</tbody>
          </table></div>
        </Section>
        <Section title="Every call" count={list.length} aside={
          <div className="toggle" role="group" aria-label="Show">
            <button type="button" aria-pressed={show === 'all'} onClick={() => setShow('all')}>All</button>
            <button type="button" aria-pressed={show === 'held'} onClick={() => setShow('held')}>Aged well</button>
            <button type="button" aria-pressed={show === 'busted'} onClick={() => setShow('busted')}>Aged badly</button>
          </div>}>
          <CallsTable list={list} />
        </Section>
      </>
    );
  }
  return (
    <>
      <SampleBar />
      <Crumbs items={[['Calendar', href.home], ['Hot takes tracker']]} />
      <PageHead eyebrow="NBA" title="Hot takes tracker">
        <p className="lede">
          How often the calls made at the time came true. A call only counts for a voice when it was made before anyone
          knew the answer: a preseason pick, a draft-night grade, a midseason video. Right counts one, partly right counts half.
        </p>
      </PageHead>
      <Section title="Scoreboard" count={rows.length}>
        <div className="table-wrap"><table className="stats scoreboard-t">{SCORE_HEAD('Who made the call')}
          <tbody>
            {ranked.map(({ v, s }) => <ScoreRow key={v.id} name={v.name} sub={v.about} s={s} link={href.hotTake(v.id)} />)}
            <tr className="subhead"><th scope="colgroup" colSpan={7}>For comparison</th></tr>
            <ScoreRow name="The consensus, every era" sub="Every preconceived notion on file, 1946 to today." s={consensus} link={href.notions} />
          </tbody>
        </table></div>
        <p className="note">Narratives get written about the calls people remember, and the misses are more memorable, so every hit rate here runs low.</p>
      </Section>
      <Section title="Who calls what best">
        <div className="table-wrap">
          <table className="stats">
            <thead><tr><th scope="col">Voice</th>{CATEGORIES.map((c) => <th key={c.id} scope="col" className="num">{c.name}</th>)}</tr></thead>
            <tbody>
              {ranked.map(({ v, s }) => (
                <tr key={v.id}>
                  <th scope="row"><a href={href.hotTake(v.id)}>{v.name}</a></th>
                  {CATEGORIES.map((c) => { const cs = score(byCategory(s.calls, c.id)); return (
                    <td key={c.id} className="num">{cs.calls.length ? <>{pct(cs.rate)} <small className="muted">of {cs.calls.length}</small></> : '—'}</td>
                  ); })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="Aged well" aside={<span className="note">Calls that came true, newest first</span>}>
        <CallsTable list={rows.flatMap((r) => r.s.calls).filter((n) => n.verdict === 'held').filter(uniq()).sort((a, b) => b.story.date.localeCompare(a.story.date)).slice(0, 8)} />
      </Section>
      <Section title="Aged badly" aside={<span className="note">Calls that went the other way, newest first</span>}>
        <CallsTable list={rows.flatMap((r) => r.s.calls).filter((n) => n.verdict === 'busted').filter(uniq()).sort((a, b) => b.story.date.localeCompare(a.story.date)).slice(0, 8)} />
      </Section>
    </>
  );
}

function uniq() {
  const seen = new Set<string>();
  return (n: StoryNotion) => (seen.has(n.story.id) ? false : (seen.add(n.story.id), true));
}

/* ── Compare: two players or two teams, expected vs. actual ──────────── */

type Kind = 'players' | 'teams';

function Picker({ kind, a, b }: { kind: Kind; a: string; b: string }) {
  const options = useMemo(() => {
    const list = kind === 'players' ? players : teams;
    return list.map((x) => ({ id: x.id, name: x.name, n: notionsIn(kind === 'players' ? storiesForPlayer(x.id) : storiesForTeam(x.id)).length }))
      .filter((x) => x.n > 0).sort((x, y) => x.name.localeCompare(y.name));
  }, [kind]);
  const go = (na: string, nb: string) => { location.hash = href.compare(kind, na, nb).slice(1); };
  const sel = (value: string, on: (v: string) => void, label: string) => (
    <label className="teampick">{label}
      <select value={value} onChange={(e) => on(e.target.value)}>
        {options.map((o) => <option key={o.id} value={o.id}>{o.name} ({o.n})</option>)}
      </select>
    </label>
  );
  return (
    <div className="comparepick">
      <div className="toggle" role="group" aria-label="Compare">
        <button type="button" aria-pressed={kind === 'players'} onClick={() => { location.hash = href.compare('players', 'lebron-james', 'kevin-durant').slice(1); }}>Players</button>
        <button type="button" aria-pressed={kind === 'teams'} onClick={() => { location.hash = href.compare('teams', 'celtics', 'lakers').slice(1); }}>Teams</button>
      </div>
      {sel(a, (v) => go(v, b), 'Left')}
      <button type="button" className="swap" onClick={() => go(b, a)} aria-label="Swap sides">⇄</button>
      {sel(b, (v) => go(a, v), 'Right')}
    </div>
  );
}

function NotionCell({ list }: { list: StoryNotion[] }) {
  if (!list.length) return <span className="muted">—</span>;
  return (
    <ul className="cmp-notions">
      {list.map((n) => (
        <li key={n.story.id}>
          <a href={href.story(n.story.id)} className="cmp-exp">{n.expected}</a>
          <span className="cmp-hap">{n.happened}</span>
          <VerdictTag verdict={n.verdict} />
        </li>
      ))}
    </ul>
  );
}

function SideHead({ kind, id }: { kind: Kind; id: string }) {
  const name = kind === 'players' ? getPlayer(id)?.name : getTeam(id)?.name;
  return (
    <div className="cmp-side">
      {kind === 'players' ? <Headshot id={id} /> : <TeamBadge id={id} size="lg" />}
      <a href={kind === 'players' ? href.player(id) : href.team(id)} className="cmp-name">{name}</a>
    </div>
  );
}

function bySeason(list: StoryNotion[]) {
  const m = new Map<number, StoryNotion[]>();
  for (const n of list) m.set(seasonOf(n.story), [...(m.get(seasonOf(n.story)) ?? []), n]);
  return m;
}

const record = (r?: TeamSeason) => (r?.wins !== undefined ? `${r.wins}-${r.losses}` : '');

export function ComparePage({ kind, a, b }: { kind: Kind; a: string; b: string }) {
  const storiesOf = (id: string): Story[] => (kind === 'players' ? storiesForPlayer(id) : storiesForTeam(id));
  const data = useMemo(() => [a, b].map((id) => {
    const stories = storiesOf(id);
    const notes = notionsIn(stories);
    return { id, stories, notes, s: score(notes), seasons: bySeason(notes), rows: kind === 'teams' ? new Map(teamSeasons(id, stories).map((r) => [r.season, r])) : undefined };
  }), [kind, a, b]);
  const [L, R] = data;
  const valid = kind === 'players' ? getPlayer(a) && getPlayer(b) : getTeam(a) && getTeam(b);
  const shared = L.notes.filter((n) => R.notes.some((m) => m.story.id === n.story.id));
  const seasons = [...new Set([...L.seasons.keys(), ...R.seasons.keys()])].sort((x, y) => y - x);
  const label = kind === 'players' ? 'players' : 'teams';
  const totals = kind === 'teams' ? data.map((d) => franchiseTotals([...d.rows!.values()])) : undefined;
  const nameOf = (id: string) => (kind === 'players' ? getPlayer(id)?.name : getTeam(id)?.name) ?? id;
  return (
    <>
      <SampleBar />
      <Crumbs items={[['Compare', href.compare(kind, a, b)], [`${nameOf(a)} vs. ${nameOf(b)}`]]} />
      <PageHead eyebrow={`Compare ${label}`} title={`${nameOf(a)} vs. ${nameOf(b)}`}>
        <p className="lede">What people expected of each, against what happened, season by season and side by side.</p>
      </PageHead>
      <Picker kind={kind} a={a} b={b} />
      {!valid ? <Empty>Pick two {label} to compare.</Empty> : (
        <>
          <div className="table-wrap">
            <table className="stats cmp-summary">
              <thead><tr><th scope="col" /><th scope="col"><SideHead kind={kind} id={a} /></th><th scope="col"><SideHead kind={kind} id={b} /></th></tr></thead>
              <tbody>
                {totals && <>
                  <tr><th scope="row">Seasons</th><td>{totals[0].seasons} ({totals[0].wins}-{totals[0].losses})</td><td>{totals[1].seasons} ({totals[1].wins}-{totals[1].losses})</td></tr>
                  <tr><th scope="row">Titles</th><td>{totals[0].titles.length}</td><td>{totals[1].titles.length}</td></tr>
                </>}
                <tr><th scope="row">Narratives</th><td>{L.stories.length}</td><td>{R.stories.length}</td></tr>
                <tr><th scope="row">Expectations on file</th><td>{L.notes.length}</td><td>{R.notes.length}</td></tr>
                <tr><th scope="row">Expectations held</th>
                  {data.map((d) => <td key={d.id}><span className="nv-held">{d.s.held} held</span> · <span className="nv-mixed">{d.s.mixed} partly</span> · <span className="nv-busted">{d.s.busted} busted</span></td>)}</tr>
                <tr><th scope="row">How predictable</th>
                  {data.map((d) => <td key={d.id}><strong>{pct(d.s.rate)}</strong> <RateBar s={d.s} /></td>)}</tr>
                <tr><th scope="row">Shared narratives</th><td colSpan={2}>{shared.length ? `${shared.length}, where both were in the same story` : 'None'}</td></tr>
              </tbody>
            </table>
          </div>
          <p className="note">"How predictable" is how often the expectation about them came true: right counts one, partly right half.</p>
          <Section title="Season by season" count={seasons.length}>
            <div className="table-wrap">
              <table className="stats cmp">
                <thead><tr><th scope="col">Season</th><th scope="col">{nameOf(a)}</th><th scope="col">{nameOf(b)}</th></tr></thead>
                <tbody>
                  {seasons.map((season) => (
                    <tr key={season}>
                      <th scope="row"><a href={href.season(season)}>{seasonLabel(season)}</a></th>
                      {data.map((d) => {
                        const r = d.rows?.get(season);
                        return (
                          <td key={d.id} className="wrap">
                            {r && <div className="cmp-rec"><strong>{record(r)}</strong> {r.finish}</div>}
                            <NotionCell list={d.seasons.get(season) ?? []} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </>
      )}
    </>
  );
}


