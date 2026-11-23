import { mvpRace, type MvpCandidate } from '../data/mvpRace';
import { records } from './bbref';

/*
 * The case for each of a season's top three MVP vote-getters, written from
 * Basketball Reference facts only: the team's record and where it ranked,
 * league-leading numbers, standout stat lines, games missed, earlier MVPs, and
 * how the player stacked up against the winner. Opinions from the time belong
 * in the season overview, which is written from sources.
 */

const ORD = ['', '', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const last = (name: string) => name.split(' ').slice(1).join(' ') || name;
const f1 = (n: number) => n.toFixed(1);
const WORD = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const word = (n: number) => WORD[n] ?? String(n);

function mvpCountBefore(player: string, start: number): number {
  let n = 0;
  for (const [s, race] of Object.entries(mvpRace)) {
    if (+s < start && race.top3[0] && norm(race.top3[0].player) === norm(player)) n++;
  }
  return n;
}

function wonLastYear(player: string, start: number): boolean {
  const prev = mvpRace[start - 1]?.top3[0];
  return !!prev && norm(prev.player) === norm(player);
}

/** The team's record and its place in the league, as a sentence. */
function teamLine(c: MvpCandidate, start: number): string | undefined {
  const rec = records(start);
  const r = rec.get(c.team);
  if (!r) return undefined;
  const better = [...rec.values()].filter((t) => t.pct > r.pct).length;
  const tied = [...rec.values()].filter((t) => t.pct === r.pct).length > 1;
  const place = better === 0
    ? (tied ? 'tied for the best record in the league' : 'the best record in the league')
    : better < 10 ? `the ${ORD[better + 1]}-best record in the league${tied ? ' (tied)' : ''}` : undefined;
  return `The ${c.team} went ${r.wins}-${r.losses}${place ? `, ${place}` : ''}${r.playoffs ? '' : ', and missed the playoffs'}.`;
}

export interface MvpCase { candidate: MvpCandidate; points: string[]; result: string }

export function mvpCases(start: number): MvpCase[] {
  const race = mvpRace[start];
  if (!race?.top3.length) return [];
  const winner = race.top3[0];
  const rec = records(start);
  const winnerTeam = rec.get(winner.team);
  const lead = race.leaders;
  const leads = (k: 'PPG' | 'RPG' | 'APG' | 'WS', c: MvpCandidate) => lead[k] && norm(lead[k]![0]) === norm(c.player);

  return race.top3.map((c) => {
    const pts: string[] = [];
    const team = teamLine(c, start);
    if (team) pts.push(team);

    const led: string[] = [];
    if (leads('PPG', c)) led.push(`scoring (${f1(lead.PPG![1])})`);
    if (leads('RPG', c)) led.push(`rebounding (${f1(lead.RPG![1])})`);
    if (leads('APG', c)) led.push(`assists (${f1(lead.APG![1])})`);
    if (leads('WS', c)) led.push(`win shares (${f1(lead.WS![1])})`);
    if (led.length) pts.push(`Led the league in ${led.length > 1 ? `${led.slice(0, -1).join(', ')} and ${led[led.length - 1]}` : led[0]}.`);

    if ((c.pts ?? 0) >= 10 && (c.trb ?? 0) >= 10 && (c.ast ?? 0) >= 10) pts.push('Averaged a triple-double.');
    else if ((c.pts ?? 0) >= 30 && !leads('PPG', c)) pts.push(`Scored ${f1(c.pts!)} a game.`);

    const own = rec.get(c.team);
    const games = own ? own.wins + own.losses : undefined;
    if (games && c.g && games - c.g >= 10) pts.push(`Played ${c.g} of ${games} games.`);

    const before = mvpCountBefore(c.player, start);
    if (wonLastYear(c.player, start)) pts.push(before >= 1 ? `The reigning MVP, going for a ${ORD[before + 1]} award.` : 'The reigning MVP.');
    else if (before > 1) pts.push(`Already a ${word(before)}-time MVP.`);
    else if (before === 1) pts.push('Had won MVP once before.');

    if (c !== winner) {
      const ct = rec.get(c.team);
      if (ct && winnerTeam && ct.team !== winnerTeam.team && ct.wins !== winnerTeam.wins) {
        const diff = ct.wins - winnerTeam.wins;
        pts.push(diff > 0
          ? `Their team won ${diff} more ${diff === 1 ? 'game' : 'games'} than ${last(winner.player)}'s.`
          : `Their team won ${-diff} fewer ${diff === -1 ? 'game' : 'games'} than ${last(winner.player)}'s.`);
      }
      if (c.pts !== undefined && winner.pts !== undefined && c.pts - winner.pts >= 2) {
        pts.push(`Outscored ${last(winner.player)} by ${f1(c.pts - winner.pts)} points a game.`);
      }
    }

    const votes = c.first !== undefined ? `${c.first} first-place ${c.first === 1 ? 'vote' : 'votes'}` : '';
    const share = c.share !== undefined ? `${Math.round(c.share * 100)}% of the vote points` : '';
    const detail = [votes, share].filter(Boolean).join(', ');
    const placeWord = c === winner ? 'Won' : `Finished ${ORD[+c.rank.replace(/\D/g, '')] || c.rank}`;
    return { candidate: c, points: pts, result: `${placeWord}${detail ? ` with ${detail}` : ''}.` };
  });
}
