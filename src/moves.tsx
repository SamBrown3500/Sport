import { useMemo, useState } from 'react';
import { Crumbs, Empty, PageHead, PrevNext, Section, Timeline } from './components';
import type { Grade, Move } from './data/moves';
import { getPlayer, getSource, getTeam } from './lib/db';
import {
  allMoves, getMove, gradePoints, isMiss, matchesFilter, moveSeason, MOVE_KINDS, MOVE_TAGS, movesInOffseason,
  offseasonOf, offseasonOverview, offseasons, relatedStories, swing, type MoveFilter,
} from './lib/moves';
import { formatDate } from './lib/dates';
import { href } from './lib/router';
import { seasonLabel } from './lib/seasons';

/*
 * Trades and free agency: what people said about a move the week it happened,
 * the grades it got, and how it turned out. Data in src/data/moves.ts.
 */

const teamShort = (id: string) => getTeam(id)?.name.split(' ').slice(-1)[0] ?? id;

function GradeTag({ g }: { g: Grade }) {
  const p = gradePoints(g);
  const tone = p >= 9 ? 'g-good' : p >= 5 ? 'g-mid' : 'g-bad';
  return <span className={`grade ${tone}`}>{g}</span>;
}

function Then({ grades }: { grades?: Grade[] }) {
  if (!grades?.length) return <span className="muted">Not graded</span>;
  return <span className="grades">{grades.map((g, i) => <GradeTag key={i} g={g} />)}</span>;
}

function Swing({ side }: { side: Move['sides'][number] }) {
  const s = swing(side);
  if (s === undefined || Math.abs(s) < 1) return null;
  return <small className={s > 0 ? 'swing up' : 'swing down'}>{s > 0 ? '▲' : '▼'} {s > 0 ? 'aged better' : 'aged worse'}</small>;
}

/** Each team's grade then against hindsight, in one cell per team. */
function SidesCell({ m }: { m: Move }) {
  return (
    <div className="sides">
      {m.sides.map((s) => (
        <div key={s.team} className="side">
          <a href={href.team(s.team)} className="tm">{teamShort(s.team)}</a>
          <Then grades={s.graded} />
          <span className="arrow" aria-label="hindsight">→</span>
          <GradeTag g={s.hindsight} />
        </div>
      ))}
    </div>
  );
}

/** The moves table used on the Moves page, team, player and season pages. */
export function MovesTable({ list, showSeason = true }: { list: Move[]; showSeason?: boolean }) {
  if (!list.length) return <Empty>No moves on file here yet.</Empty>;
  return (
    <div className="table-wrap">
      <table className="stats moves">
        <thead>
          <tr>
            {showSeason && <th scope="col">Season</th>}
            <th scope="col" className="col-date">Date</th>
            <th scope="col">The move</th>
            <th scope="col" className="col-sides">Graded then → hindsight</th>
          </tr>
        </thead>
        <tbody>
          {list.map((m) => (
            <tr key={m.id}>
              {showSeason && <td><a href={href.season(moveSeason(m))}>{seasonLabel(moveSeason(m))}</a></td>}
              <td className="nowrap col-date">{formatDate(m.date)}</td>
              <td className="wrap">
                <a href={href.move(m.id)}><strong>{m.title}</strong></a>
                <small className="muted block">{MOVE_KINDS[m.kind]}{m.tags.map((t) => ` · ${MOVE_TAGS[t]}`).join('')}{isMiss(m) ? ' · Big miss' : ''}</small>
                <div className="sides-inline"><SidesCell m={m} /></div>
              </td>
              <td className="col-sides"><SidesCell m={m} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** "Moves" section for team, player and season pages. */
export function MovesSection({ list, who, showSeason = true }: { list: Move[]; who?: string; showSeason?: boolean }) {
  if (!list.length) return null;
  return (
    <Section title="Moves" count={list.length} aside={<a className="more" href={href.moves}>Every move →</a>}>
      <p className="section-lede">Trades and signings{who ? ` involving ${who}` : ''}: the grades they got at the time against how they aged.</p>
      <MovesTable list={list} showSeason={showSeason} />
    </Section>
  );
}

const FILTERS: [MoveFilter, string][] = [
  ['all', 'All'], ['trade', 'Trades'], ['signing', 'Free agency'], ['draft-deal', 'Draft night'],
  ['deadline', 'Deadline deals'], ['blockbuster', 'Blockbusters'], ['misses', 'Biggest misses'],
];

export function MovesPage({ initial = 'all' }: { initial?: MoveFilter }) {
  const [f, setF] = useState<MoveFilter>(initial);
  const list = useMemo(() => allMoves.filter((m) => matchesFilter(m, f)), [f]);
  return (
    <>
      <Crumbs items={[['NBA seasons', href.seasons], ['Trades and free agency']]} />
      <PageHead eyebrow="Moves" title="Trades and free agency">
        <p className="lede">What people said about the biggest moves the week they happened, the grades they got, and how they actually turned out. Each team gets two grades: the one it got at the time and a hindsight grade from what happened next.</p>
      </PageHead>
      <Section title="Free agency summers" count={offseasons.length}>
        <p className="seasonlinks">{offseasons.map((y) => <a key={y} href={href.offseason(y)}>{y}</a>)}</p>
      </Section>
      <Section title="Every move" count={list.length} aside={
        <div className="toggle wrap-toggle" role="group" aria-label="Show">
          {FILTERS.map(([id, label]) => (
            <button key={id} type="button" aria-pressed={f === id} onClick={() => setF(id)}>{label}</button>
          ))}
        </div>}>
        {f === 'misses' && <p className="section-lede">Moves where a team's hindsight grade ended up more than a full letter away from how it was graded at the time.</p>}
        <MovesTable list={list} />
      </Section>
    </>
  );
}

export function MovePage({ id }: { id: string }) {
  const m = getMove(id);
  if (!m) return <Empty>No move with that name.</Empty>;
  const season = moveSeason(m);
  const summer = offseasonOf(m);
  const related = relatedStories(m);
  const sourceIds = [...new Set(m.sources.map((c) => c.source))];
  const idx = allMoves.indexOf(m);
  const newer = allMoves[idx - 1];
  const older = allMoves[idx + 1];
  return (
    <article className="story move">
      <Crumbs items={[['Trades and free agency', href.moves], [seasonLabel(season), href.season(season)], [m.title]]} />
      <PageHead eyebrow={`${MOVE_KINDS[m.kind]} · ${formatDate(m.date)}`} title={m.title}>
        <p className="move-deal"><strong>The deal.</strong> {m.deal}</p>
      </PageHead>
      <dl className="facts">
        {m.players.length > 0 && <div><dt>Players</dt><dd>{m.players.map((p) => <a key={p} className="chip" href={href.player(p)}>{getPlayer(p)?.name ?? p}</a>)}</dd></div>}
        <div><dt>Teams</dt><dd>{m.sides.map((s) => <a key={s.team} className="chip chip-team" href={href.team(s.team)}>{getTeam(s.team)?.name}</a>)}</dd></div>
        <div><dt>Season</dt><dd>
          <a className="chip chip-team" href={href.season(season)}>{seasonLabel(season)} NBA season</a>
          {summer !== undefined && <a className="chip chip-cat" href={href.offseason(summer)}>Summer of {summer}</a>}
          {m.tags.map((t) => <span key={t} className="chip chip-plain">{MOVE_TAGS[t]}</span>)}
        </dd></div>
      </dl>
      <Section title="What people said at the time">
        <p className="story-body">{m.then}</p>
      </Section>
      <Section title="What happened">
        <p className="story-body">{m.happened}</p>
      </Section>
      <Section title="Report card">
        <div className="table-wrap">
          <table className="stats reportcard">
            <thead><tr><th scope="col">Team</th><th scope="col">Got</th><th scope="col">Graded then</th><th scope="col">Hindsight</th><th scope="col">Why</th></tr></thead>
            <tbody>
              {m.sides.map((s) => (
                <tr key={s.team}>
                  <th scope="row"><a href={href.team(s.team)}>{getTeam(s.team)?.name}</a></th>
                  <td className="wrap">{s.got}</td>
                  <td><Then grades={s.graded} /></td>
                  <td><GradeTag g={s.hindsight} /> <Swing side={s} /></td>
                  <td className="wrap">{s.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted small">Graded then: grades from analysts the week of the move{m.sides.every((s) => !s.graded?.length) ? ' (this one was not graded)' : ''}. Hindsight: our grade from what happened next.</p>
      </Section>
      <Section title="Ripple effects" count={m.ripples.length}>
        <div className="table-wrap">
          <table className="stats">
            <thead><tr><th scope="col">Season</th><th scope="col">What came of it</th></tr></thead>
            <tbody>{m.ripples.map(([s, w], i) => <tr key={i}><th scope="row" className="nowrap">{s}</th><td className="wrap">{w}</td></tr>)}</tbody>
          </table>
        </div>
      </Section>
      {related.length > 0 && (
        <Section title="Related narratives" count={related.length}>
          <Timeline stories={related} />
        </Section>
      )}
      <section className="citations" aria-label="Sources">
        <h2>Sources</h2>
        <ol>
          {sourceIds.map((sid) => {
            const src = getSource(sid);
            if (!src) return null;
            return (
              <li key={sid}>
                <a href={href.source(src.id)}>{src.title}</a>
                <span className="cite-meta"> · {src.outlet}{src.published ? ` · ${src.published}` : ''}</span>
              </li>
            );
          })}
        </ol>
      </section>
      <PrevNext
        prev={older ? [older.title, href.move(older.id)] : undefined}
        next={newer ? [newer.title, href.move(newer.id)] : undefined}
      />
    </article>
  );
}

export function OffseasonPage({ year }: { year: number }) {
  const list = movesInOffseason(year);
  const i = offseasons.indexOf(year);
  const later = i > 0 ? offseasons[i - 1] : undefined;
  const earlier = i >= 0 && i < offseasons.length - 1 ? offseasons[i + 1] : undefined;
  const overview = offseasonOverview(year);
  return (
    <>
      <Crumbs items={[['Trades and free agency', href.moves], [`${year} free agency summer`]]} />
      <PageHead eyebrow="Free agency summer" title={`The summer of ${year}`}>
        <p className="lede">Who was expected to go where before the {seasonLabel(year)} season, where they went, and which deals were called overpays or steals at the time.</p>
        <p className="seasonlinks"><span>Season:</span><a href={href.season(year)}>{seasonLabel(year)}</a></p>
      </PageHead>
      {overview && (
        <Section title="The summer in brief">
          <p className="story-body">{overview}</p>
        </Section>
      )}
      <Section title="Moves" count={list.length}>
        <MovesTable list={list} showSeason={false} />
      </Section>
      <PrevNext
        prev={earlier !== undefined ? [`Summer of ${earlier}`, href.offseason(earlier)] : undefined}
        next={later !== undefined ? [`Summer of ${later}`, href.offseason(later)] : undefined}
      />
    </>
  );
}
