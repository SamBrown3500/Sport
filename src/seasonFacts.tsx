import type { ReactNode } from 'react';
import type { Category } from './data/types';
import type { StandingRow, Vote } from './data/bbref';
import { bbLinks, bbSeason, swings, upsets, type Swing } from './lib/bbref';
import { seasonLabel } from './lib/seasons';

/*
 * Box-score tables from Basketball Reference under each season-page section:
 * MVP voting, the draft's top picks and Rookie of the Year voting, standings and
 * playoff series, and upsets and swings for Surprises.
 */

const rec = (w: number, l: number) => `${w}-${l}`;
const pct = (w: number, l: number) => (w / (w + l || 1)).toFixed(3).replace(/^0/, '');
const share = (s: number | null) => (s === null ? '—' : s.toFixed(3).replace(/^0/, ''));

function Facts({ title, source, children }: { title: string; source: string; children: ReactNode }) {
  return (
    <div className="bbfacts">
      <div className="bbhead">
        <h3>{title}</h3>
        <a href={source} target="_blank" rel="noreferrer">Basketball Reference</a>
      </div>
      <div className="table-wrap">{children}</div>
    </div>
  );
}

function VoteTable({ rows }: { rows: Vote[] }) {
  return (
    <table className="stats">
      <thead>
        <tr><th scope="col" className="num">Rk</th><th scope="col">Player</th><th scope="col">Tm</th><th scope="col" className="num">1st</th><th scope="col" className="num">Share</th></tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td className="num">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td>
            <td className="num">{r[3] ?? '—'}</td><td className="num">{share(r[4])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Standings({ groups }: { groups: StandingRow[][] }) {
  return (
    <div className="bbgrid">
      {groups.map((g, gi) => (
        <div key={gi}><table className="stats">
          <thead><tr><th scope="col">Team</th><th scope="col" className="num">W-L</th><th scope="col" className="num">Pct</th></tr></thead>
          <tbody>
            {g.map((r, i) => (typeof r === 'string'
              ? <tr key={i} className="subhead"><th scope="colgroup" colSpan={3}>{r}</th></tr>
              : (
                <tr key={i}>
                  <td>{r[0]}{r[3] ? <span className="po" title="Made the playoffs">*</span> : null}</td>
                  <td className="num">{rec(r[1], r[2])}</td><td className="num">{pct(r[1], r[2])}</td>
                </tr>
              )))}
          </tbody>
        </table></div>
      ))}
    </div>
  );
}

function SwingTable({ rows, start }: { rows: Swing[]; start: number }) {
  return (
    <table className="stats">
      <thead>
        <tr><th scope="col">Team</th><th scope="col" className="num">{seasonLabel(start - 1)}</th><th scope="col" className="num">{seasonLabel(start)}</th><th scope="col" className="num">Change</th></tr>
      </thead>
      <tbody>
        {rows.map((s) => (
          <tr key={s.now.team}>
            <td>{s.now.team}</td>
            <td className="num">{rec(s.before.wins, s.before.losses)}</td>
            <td className="num">{rec(s.now.wins, s.now.losses)}</td>
            <td className="num"><strong>{s.change > 0 ? `+${s.change}` : s.change}</strong></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SeasonFacts({ season, category }: { season: number; category: Category }) {
  const bb = bbSeason(season);
  if (!bb) return null;
  const links = bbLinks(season);
  const done = !!bb.standings?.length;

  if (category === 'mvp-race') {
    if (!bb.mvp?.length) return done ? <p className="note bbnote">No MVP award until 1955-56.</p> : null;
    return <Facts title="MVP voting" source={links.awards}><VoteTable rows={bb.mvp} /></Facts>;
  }

  if (category === 'draft-drama') {
    return (
      <>
        {bb.draft?.length ? (
          <Facts title={`${season} draft, top picks`} source={links.draft}>
            <table className="stats">
              <thead><tr><th scope="col" className="num">Pk</th><th scope="col">Tm</th><th scope="col">Player</th><th scope="col">College</th></tr></thead>
              <tbody>
                {[...bb.draft].sort((a, b) => (a[0] ?? 99) - (b[0] ?? 99)).map((p, i) => (
                  <tr key={i}><td className="num">{p[0] ?? '—'}</td><td>{p[1]}</td><td>{p[2]}</td><td>{p[3] || '—'}</td></tr>
                ))}
              </tbody>
            </table>
          </Facts>
        ) : null}
        {bb.roy?.length ? <Facts title="Rookie of the Year voting" source={links.awards}><VoteTable rows={bb.roy} /></Facts> : null}
      </>
    );
  }

  if (!done) return null;

  if (category === 'contenders') {
    return (
      <>
        <Facts title="Standings" source={links.league}><Standings groups={bb.standings!} /></Facts>
        {bb.playoffs?.length ? (
          <Facts title="Playoff series" source={links.league}>
            <table className="stats">
              <thead><tr><th scope="col">Round</th><th scope="col">Winner</th><th scope="col">Loser</th><th scope="col" className="num">Series</th></tr></thead>
              <tbody>
                {bb.playoffs.map((s, i) => (
                  <tr key={i} className={s[0] === 'Finals' ? 'is-key' : ''}>
                    <td>{s[0]}</td><td>{s[1]}</td><td>{s[2]}</td><td className="num">{s[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Facts>
        ) : null}
      </>
    );
  }

  // surprises
  const ups = upsets(season);
  const sw = swings(season);
  return (
    <>
      <Facts title="Playoff upsets (worse record won)" source={links.league}>
        {ups.length ? (
          <table className="stats">
            <thead><tr><th scope="col">Round</th><th scope="col">Winner</th><th scope="col" className="num">W-L</th><th scope="col">Beat</th><th scope="col" className="num">W-L</th><th scope="col" className="num">Series</th></tr></thead>
            <tbody>
              {ups.map((u, i) => (
                <tr key={i}>
                  <td>{u.series[0]}</td><td>{u.winner.team}</td><td className="num">{rec(u.winner.wins, u.winner.losses)}</td>
                  <td>{u.loser.team}</td><td className="num">{rec(u.loser.wins, u.loser.losses)}</td><td className="num">{u.series[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="note bbnote">Every series went to the team with the better record.</p>}
      </Facts>
      {sw.up.length > 0 && <Facts title="Biggest jumps from last season" source={links.league}><SwingTable rows={sw.up} start={season} /></Facts>}
      {sw.down.length > 0 && <Facts title="Biggest drops from last season" source={links.league}><SwingTable rows={sw.down} start={season} /></Facts>}
    </>
  );
}
