import { Crumbs, PageHead, Section } from './components';
import { href } from './lib/router';
import { VerdictTag } from './byYear';

/*
 * SAMPLE pages (gam, 2026-11-27), on a separate preview for gam to pick from:
 * award races by month, and trade / free agency reactions. Opinions come from
 * articles written at the time (exact quotes kept here, not shown); facts were
 * checked on basketball-reference.com. Nothing here touches the narratives.
 */

type Verdict = 'held' | 'busted' | 'mixed';
interface Src { title: string; outlet: string; url: string; date: string }
interface Quote { src: number; quote: string }

/* ── Award races by month ─────────────────────────────────────────────── */

interface RaceMonth {
  when: string;
  order: [player: string, team: string][];
  said: string;
  backing: Quote[];
  /** How many players were tied for first. */
  tie?: number;
}
interface Race {
  id: string;
  season: string;
  seasonStart: number;
  award: string;
  title: string;
  lede: string;
  months: RaceMonth[];
  result: { order: [player: string, team: string, firsts: number, share: number][]; said: string };
  notions: [expected: string, happened: string, verdict: Verdict][];
  sources: Src[];
}

const RACES: Race[] = [
  {
    id: 'mvp-2016-17',
    season: '2016-17',
    seasonStart: 2016,
    award: 'MVP',
    title: 'Triple-doubles vs. wins: Westbrook and Harden',
    lede: 'With Durant gone to Golden State, Westbrook opened the season putting up numbers nobody had seen since Oscar Robertson, and the question all year was whether that beat Harden leading a far better Houston team.',
    months: [
      { when: 'Nov 2016', order: [['Russell Westbrook', 'OKC'], ['James Harden', 'HOU'], ['LeBron James', 'CLE']],
        said: 'Westbrook stood out from the first week. The doubt was whether he could keep up that pace for a whole season.',
        backing: [{ src: 0, quote: 'Westbrook’s production will do all the talking for him anyway.' }, { src: 0, quote: 'The question is: can he keep up this wicked pace all season?' }] },
      { when: 'Dec 2016', order: [['James Harden', 'HOU'], ['Russell Westbrook', 'OKC'], ['Kawhi Leonard', 'SAS']], tie: 3,
        said: 'A dead heat. Some refused to hold the Thunder’s record against him and put him first no matter how they finished; others said he would probably have to carry OKC to 50 wins. Harden was called worthy whether he won or not, and Kawhi Leonard had crept into the top three.',
        backing: [{ src: 1, quote: 'So for me, Westbrook right now, no matter how they finish, is No. 1.' }, { src: 2, quote: "For him to win it, he's going to have to probably carry the Thunder to 50 wins." }, { src: 2, quote: 'Harden is undeniably worthy of the MVP, whether he wins it or not.' }] },
      { when: 'Mar 2017', order: [['Russell Westbrook', 'OKC'], ['James Harden', 'HOU'], ['LeBron James', 'CLE']], tie: 2,
        said: 'Tied at the top. Harden felt his case was stronger this time around, but the race had become about storylines as much as stats, and Westbrook’s season looked hard for voters to overlook.',
        backing: [{ src: 3, quote: 'Harden believes he has a stronger case this time around' }, { src: 3, quote: 'It’ll be difficult for the voters to overlook what Westbrook’s doing' }] },
      { when: 'Apr 2017', order: [['Russell Westbrook', 'OKC'], ['James Harden', 'HOU'], ['LeBron James', 'CLE']],
        said: 'A photo finish. Westbrook broke Robertson’s record for triple-doubles in a season and edged Harden by a razor-thin margin. LeBron’s spotty finish with Cleveland cost him ground.',
        backing: [{ src: 4, quote: 'Westbrook won me over with a relentlessness that saw him break Oscar Robertson’s record for triple-doubles in a season.' }, { src: 4, quote: 'It came down to the wire and the final margin was razor thin.' }] },
    ],
    result: {
      order: [['Russell Westbrook', 'OKC', 69, 0.879], ['James Harden', 'HOU', 22, 0.746], ['Kawhi Leonard', 'SAS', 9, 0.495], ['LeBron James', 'CLE', 1, 0.33]],
      said: 'Westbrook won, but not by a hair: 69 first-place votes to Harden’s 22. He averaged 31.6 points, 10.7 rebounds and 10.4 assists while the Thunder went 47-35, short of the 50 wins people said he needed. Harden’s Rockets went 55-27 and beat Westbrook’s Thunder 4-1 in the first round.',
    },
    notions: [
      ['Westbrook can’t keep this pace all season', 'He averaged a triple-double and broke the record', 'busted'],
      ['He needs 50 wins to win MVP', 'OKC won 47 and he won anyway', 'busted'],
      ['It will come down to the wire', 'Close all year, but the vote was not close (69 to 22 first-place votes)', 'mixed'],
    ],
    sources: [
      { title: 'Russell Westbrook stands out most as new MVP chase begins', outlet: 'NBA.com', url: 'https://www.nba.com/news/mvp-ladder-week-1-2016-17-russell-westbrook-leads-way-begin', date: '2016-11-11' },
      { title: 'Kia Race to the MVP Ladder: Russell Westbrook going strong one month into season', outlet: 'NBA.com', url: 'https://www.nba.com/news/mvp-ladder-week-4-russell-westbrook-dominating-field', date: '2016-12' },
      { title: 'NBA MVP rankings: Russell Westbrook, James Harden lead tightest race to date', outlet: 'CBS Sports', url: 'https://www.cbssports.com/nba/news/nba-mvp-rankings-russell-westbrook-james-harden-lead-tightest-race-to-date/', date: '2016-12-15' },
      { title: 'Kia Race to the MVP Ladder: In this MVP chase, storylines may be as important as stats', outlet: 'NBA.com', url: 'https://www.nba.com/news/mvp-ladder-week-18-narratives-james-harden-russell-westbrook-mvp-race', date: '2017-03' },
      { title: 'Kia Race to the MVP Ladder: Fantastic, frantic chase for trophy ends with photo finish', outlet: 'NBA.com', url: 'https://www.nba.com/news/mvp-ladder-final-edition-russell-westbrook-beats-james-harden-our-vote', date: '2017-04' },
    ],
  },
  {
    id: 'roy-2017-18',
    season: '2017-18',
    seasonStart: 2017,
    award: 'Rookie of the Year',
    title: 'Lonzo’s summer, Simmons’s year, Mitchell’s charge',
    lede: 'The summer belonged to Lonzo Ball. By November it was Ben Simmons, who had sat out the year before with a broken foot, and by January the 13th pick, Donovan Mitchell, had made it a two-man race and a fight over what counts as a rookie.',
    months: [
      { when: 'Jul 2017', order: [['Lonzo Ball', 'LAL'], ['Jayson Tatum', 'BOS'], ['Kyle Kuzma', 'LAL']],
        said: 'Ball came out of summer league with unmatched hype and was the most common early pick; some thought he could win it running away. A couple of voices already had Simmons first.',
        backing: [{ src: 0, quote: 'impacting the event more than any rookie' }, { src: 1, quote: 'Lonzo Ball enters the year with unmatched hype' }, { src: 1, quote: 'he could win the ROY running away' }] },
      { when: 'Nov 2017', order: [['Ben Simmons', 'PHI']],
        said: 'Two weeks in, Simmons looked like the real deal and Ball’s start was called strange, with his fans told to quiet down.',
        backing: [{ src: 2, quote: "Simmons the real deal; Lonzo's strange start continues" }, { src: 2, quote: 'So quiet down, die-hard Lonzo Ball enthusiasts' }] },
      { when: 'Jan 2018', order: [['Donovan Mitchell', 'UTA']],
        said: 'Mitchell held the top spot. He and Simmons shared Rookie of the Month for January, Mitchell leading all rookies in scoring and Simmons in assists.',
        backing: [{ src: 3, quote: 'Lauri Markkanen rises, while Donovan Mitchell retains lofty perch' }, { src: 4, quote: 'led all rookies in scoring (22.2 ppg) and steals (1.54 spg)' }, { src: 4, quote: 'led all first-year NBA players in assists (6.7 apg)' }] },
      { when: 'Mar 2018', order: [['Ben Simmons', 'PHI']],
        said: 'Simmons was back in front and Ball re-entered the mix. The argument now was whether Simmons, a year removed from being drafted, was a true rookie. Mitchell wore a hoodie with the dictionary definition of “rookie”; Simmons said he’d pick himself “100 percent.”',
        backing: [{ src: 5, quote: 'Lonzo Ball re-enters mix; Ben Simmons maintains his lead' }, { src: 6, quote: 'Some within NBA circles subscribe to the notion that Simmons is not a true rookie' }, { src: 6, quote: 'Who would I pick? Me, 100 percent.' }] },
    ],
    result: {
      order: [['Ben Simmons', 'PHI', 90, 0.952], ['Donovan Mitchell', 'UTA', 11, 0.64], ['Jayson Tatum', 'BOS', 0, 0.2], ['Kyle Kuzma', 'LAL', 0, 0.006]],
      said: 'Simmons won easily, 90 first-place votes to Mitchell’s 11, after averaging 15.8 points, 8.1 rebounds and 8.2 assists for a 52-win Philadelphia team. Mitchell (20.5 points) finished second. Ball, the summer favorite, didn’t finish in the top five.',
    },
    notions: [
      ['Lonzo Ball is the Rookie of the Year favorite', 'Not in the top five of the voting', 'busted'],
      ['Simmons is the real deal', 'Won with 90 of 101 first-place votes', 'held'],
      ['The “not a true rookie” argument hurts Simmons', 'Voters didn’t buy it', 'busted'],
    ],
    sources: [
      { title: 'Kia Rookie Ladder: Ball, Kuzma represent Lakers at top of the list', outlet: 'NBA.com', url: 'https://www.nba.com/news/kia-rookie-ladder-ball-kuzma-represent-lakers-top-list', date: '2017-07-18' },
      { title: 'Blogtable: Who are the early top three candidates for Kia Rookie of the Year?', outlet: 'NBA.com', url: 'https://www.nba.com/article/2017/07/19/blogtable-top-three-rookie-year-candidates', date: '2017-07-19' },
      { title: "NBA Rookie Power Rankings: Simmons the real deal; Lonzo's strange start continues", outlet: 'CBS Sports', url: 'https://www.cbssports.com/nba/news/nba-rookie-power-rankings-simmons-the-real-deal-lonzos-strange-start-continues', date: '2017-11-03' },
      { title: 'Kia Rookie Ladder: Lauri Markkanen rises, while Donovan Mitchell retains lofty perch', outlet: 'NBA.com', url: 'https://www.nba.com/news/2017-18-kia-rookie-ladder-week-14', date: '2018-01-18' },
      { title: "Ben Simmons, Donovan Mitchell named Kia Rookies of Month", outlet: 'NBA.com', url: 'https://www.nba.com/article/2018/02/01/philadelphia-76ers-ben-simmons-utah-jazz-donovan-mitchell-rookies-month-january', date: '2018-02-01' },
      { title: 'Kia Rookie Ladder: Lonzo Ball re-enters mix; Ben Simmons maintains his lead', outlet: 'NBA.com', url: 'https://www.nba.com/news/2017-18-kia-rookie-ladder-week-20', date: '2018-03-08' },
      { title: 'Ben Simmons says he’s “100 percent” Rookie of the Year', outlet: 'NBA.com', url: 'https://www.nba.com/news/philadelphia-76ers-ben-simmons-says-he-100-percent-rookie-year', date: '2018' },
    ],
  },
];

/* ── Trade and free agency reactions ─────────────────────────────────── */

interface Move {
  id: string;
  when: string;
  title: string;
  deal: string;
  lede: string;
  reaction: { team: string; grades: string; said: string }[];
  backing: Quote[];
  after: [season: string, what: string][];
  verdicts: [team: string, expected: string, happened: string, verdict: Verdict][];
  sources: Src[];
}

const MOVES: Move[] = [
  {
    id: 'nets-celtics-2013',
    when: 'June 2013',
    title: 'Brooklyn goes all in on Pierce and Garnett',
    deal: 'Celtics send Paul Pierce and Kevin Garnett to the Nets for three first-round picks and players.',
    lede: 'Boston’s title window had closed, and Brooklyn, already carrying a ridiculous payroll, bought two aging stars with its future.',
    reaction: [
      { team: 'Brooklyn Nets', grades: 'B+, A',
        said: 'Seen as instant contenders, “a bona fide title contender” to one grader, though a title was still a long shot. The risks named were health and money: a major gamble on two old stars staying healthy and a luxury-tax bill to match. The picks? Their cost could be “anywhere from incredible to inconsequential,” and one or more would likely land in the 20s.' },
      { team: 'Boston Celtics', grades: 'B, B',
        said: 'A bold play for pure assets and a good time to be bad. But the picks probably wouldn’t carry a ton of value, and there was no guarantee any of them would become a star.' },
    ],
    backing: [
      { src: 1, quote: 'Brooklyn is suddenly a bona fide title contender next season and maybe in the season after.' },
      { src: 2, quote: 'the championship pipe dream is more plausible, if still incredibly unlikely.' },
      { src: 0, quote: 'This approach is a major gamble on good health for Pierce and Garnett.' },
      { src: 0, quote: 'The cost of three first-round picks could prove to be anywhere from incredible to inconsequential' },
      { src: 2, quote: 'a few first-round picks (with one or more likely to land in the 20s)' },
      { src: 0, quote: 'Danny Ainge made a bold play for pure assets in the form of the three first-round picks.' },
      { src: 0, quote: 'this is a good time to be bad.' },
      { src: 1, quote: "The draft picks likely won't carry a ton of value, but they will still be very useful." },
    ],
    after: [
      ['2013-14', 'Nets go 44-38, beat Toronto 4-3, then lose 4-1 to Miami in the second round. Celtics go 25-57.'],
      ['2014-15', 'Pierce leaves for Washington; Garnett is traded back to Minnesota midseason. Nets 38-44.'],
      ['2015-16', 'Nets 21-61. Celtics 48-34. Boston picks third and takes Jaylen Brown.'],
      ['2016-17', 'Nets 20-62, worst in the league. Celtics 53-29, first in the East. Boston picks third again and takes Jayson Tatum.'],
    ],
    verdicts: [
      ['Brooklyn Nets', 'Title contender', 'One playoff series win, then the worst record in the league', 'busted'],
      ['Boston Celtics', 'The picks won’t be worth much', 'High lottery picks that became Brown and Tatum', 'busted'],
    ],
    sources: [
      { title: 'Grading Celtics-Nets deal for Kevin Garnett and Paul Pierce', outlet: 'SI.com', url: 'https://www.si.com/nba/2013/06/28/boston-celtics-brooklyn-nets-trade-kevin-garnett-paul-pierce-grades', date: '2013-06-28' },
      { title: 'Celtics-Nets Blockbuster Trade: Grading Kevin Garnett, Paul Pierce to Brooklyn', outlet: 'Bleacher Report', url: 'https://bleacherreport.com/articles/1687344-celtics-nets-blockbuster-trade-grading-kevin-garnett-paul-pierce-to-brooklyn', date: '2013-06' },
      { title: 'Nets make significant short-term gains in blockbuster deal with Celtics', outlet: 'SI.com', url: 'https://www.si.com/nba/2013/06/28/brooklyn-nets-boston-celtics-nba-trade-kevin-garnett-paul-pierce', date: '2013-06-28' },
    ],
  },
  {
    id: 'kawhi-raptors-2018',
    when: 'July 2018',
    title: 'Toronto gambles on a year of Kawhi Leonard',
    deal: 'Spurs send Kawhi Leonard and Danny Green to the Raptors for DeMar DeRozan, a protected 2019 first-round pick and a player.',
    lede: 'Leonard had played nine games the year before, fallen out with the Spurs and made it known he wanted to play in Los Angeles when he became a free agent in 2019. Toronto traded DeMar DeRozan for him anyway.',
    reaction: [
      { team: 'Toronto Raptors', grades: 'A',
        said: 'A worthy gamble, the kind of risk you take for a talent like Leonard, even if he was essentially a one-year player with his eyes on LA. The Raptors could be Finals-bound, but a healthy Celtics team would still be the favorite in the East.' },
      { team: 'San Antonio Spurs', grades: 'D',
        said: 'Retooling a contender around DeRozan didn’t look like a viable long-term plan, and losing Green hurt too. To some it felt like a punishment from the Spurs, and a trade where everyone lost.' },
    ],
    backing: [
      { src: 0, quote: 'this is a worthy gamble for the Raptors.' },
      { src: 0, quote: 'There’s risk involved here for the Raptors, but it’s the kind you have to take for a talent like Leonard.' },
      { src: 0, quote: 'has reportedly expressed a strong desire to play in Los Angeles when he becomes a free agent in 2019.' },
      { src: 1, quote: 'The Raptors could be Finals-bound with Leonard, but a healthy Celtics squad will still be the favorite in the East' },
      { src: 0, quote: 'retooling a championship contender around DDR hasn’t shown to be a viable long-term strategy' },
      { src: 1, quote: 'It’s hard to see this trade as anything other than a punishment from the Spurs.' },
      { src: 1, quote: 'Everyone loses in the Spurs-Raptors trade, and the question of who controls the league is murkier than ever' },
    ],
    after: [
      ['2018-19', 'Leonard plays 60 games and averages 26.6 points. Raptors go 58-24, beat Milwaukee 4-2 in the East finals and Golden State 4-2 in the Finals. Leonard is Finals MVP. Boston loses 4-1 to Milwaukee in the second round.'],
      ['2018-19', 'Spurs go 48-34 and lose 4-3 to Denver in the first round.'],
      ['2019-20', 'Leonard leaves for the Los Angeles Clippers.'],
    ],
    verdicts: [
      ['Toronto Raptors', 'A gamble worth taking', 'Won the title in his one season', 'held'],
      ['Boston Celtics', 'Still the favorite in the East', 'Lost 4-1 to Milwaukee in the second round', 'busted'],
      ['Toronto Raptors', 'He wants LA and will leave', 'Left for the Clippers', 'held'],
      ['San Antonio Spurs', 'Can’t contend around DeRozan', 'Stayed a playoff team, lost in the first round', 'mixed'],
    ],
    sources: [
      { title: 'Trade Grades: Kawhi Leonard Dealt to Raptors for DeMar DeRozan in Summer Blockbuster', outlet: 'SI.com', url: 'https://www.si.com/nba/2018/07/18/kawhi-leonard-demar-derozan-trade-spurs-raptors-grades', date: '2018-07-18' },
      { title: 'Kawhi Leonard for DeMar DeRozan: There’s No Fun Here', outlet: 'The Ringer', url: 'https://www.theringer.com/2018/07/18/nba/kawhi-leonard-demar-derozan-trade-sucks-no-fun', date: '2018-07-18' },
    ],
  },
];

// Quotes stay in the data for checking; the page only lists each source once.
export const SAMPLE_QUOTES = { RACES, MOVES };

/* ── Shared bits ─────────────────────────────────────────────────────── */

export function SampleBar() {
  return (
    <div className="samplebar" role="note">
      <strong>Sample preview</strong> Try <a href={href.awardRaces}>Award races by month</a> and{' '}
      <a href={href.tradeReactions}>Trade and free agency reactions</a>. Not on the live site yet.
    </div>
  );
}

function Sources({ list }: { list: Src[] }) {
  return (
    <section className="citations" aria-label="Sources">
      <h2>Sources</h2>
      <ol>
        {list.map((s) => (
          <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a><span className="cite-meta"> · {s.outlet} · {s.date}</span></li>
        ))}
      </ol>
    </section>
  );
}

function NotionTable({ rows, first }: { rows: [string, string, string, Verdict][]; first?: string }) {
  return (
    <div className="table-wrap">
      <table className="stats notions">
        <thead><tr>{first && <th scope="col">{first}</th>}<th scope="col">What people expected</th><th scope="col">What happened</th><th scope="col">Verdict</th></tr></thead>
        <tbody>{rows.map((r, i) => (
          <tr key={i}>{first && <td>{r[0]}</td>}<td className="wrap">{r[1]}</td><td className="wrap">{r[2]}</td><td><VerdictTag verdict={r[3]} /></td></tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function Pick({ n, name, team }: { n: number; name: string; team: string }) {
  return <div className={n === 1 ? 'race-first' : 'race-other'}><span className="race-n">{n}</span> {name} <small className="muted">{team}</small></div>;
}

/* ── Award races page ────────────────────────────────────────────────── */

function RaceBlock({ r }: { r: Race }) {
  const winner = r.result.order[0][0];
  return (
    <Section title={`${r.season} ${r.award}: ${r.title}`}>
      <p className="lede">{r.lede}</p>
      <div className="table-wrap">
        <table className="stats race">
          <thead><tr><th scope="col">Month</th><th scope="col">Favorites at the time</th><th scope="col">What people were saying</th></tr></thead>
          <tbody>
            {r.months.map((m) => (
              <tr key={m.when}>
                <th scope="row">{m.when}</th>
                <td className="race-picks">{m.order.map(([p, t], i) => <Pick key={p} n={i < (m.tie ?? 1) ? 1 : i + 1} name={p} team={t} />)}{m.tie && <small className="muted">Tied at the top</small>}</td>
                <td className="wrap">{m.said}{m.order.slice(0, m.tie ?? 1).some(([p]) => p === winner) ? null : <span className="race-flag"> Leader didn’t win.</span>}</td>
              </tr>
            ))}
            <tr className="race-final">
              <th scope="row">Final vote</th>
              <td className="race-picks">{r.result.order.map(([p, t, f, s], i) => (
                <div key={p} className={i === 0 ? 'race-first' : 'race-other'}><span className="race-n">{i + 1}</span> {p} <small className="muted">{t} · {f} first · {(s * 100).toFixed(1)}%</small></div>
              ))}</td>
              <td className="wrap">{r.result.said}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 className="race-sub">Preconceived notions</h3>
      <NotionTable rows={r.notions.map(([e, h, v]) => ['', e, h, v])} />
      <p className="muted small">More on <a href={href.season(r.seasonStart)}>the {r.season} season page</a>.</p>
      <Sources list={r.sources} />
    </Section>
  );
}

export function AwardRacesPage() {
  return (
    <>
      <SampleBar />
      <Crumbs items={[['NBA seasons', href.seasons], ['Award races by month']]} />
      <PageHead eyebrow="Sample" title="Award races by month">
        <p className="lede">Who was the favorite each month, what people were saying, and how the vote actually came out. Each season page would get one of these under MVP Race and Draft Drama.</p>
      </PageHead>
      {RACES.map((r) => <RaceBlock key={r.id} r={r} />)}
    </>
  );
}

/* ── Trade reactions page ────────────────────────────────────────────── */

function MoveBlock({ m }: { m: Move }) {
  return (
    <Section title={`${m.when}: ${m.title}`}>
      <p className="move-deal"><strong>The deal.</strong> {m.deal}</p>
      <p className="lede">{m.lede}</p>
      <h3 className="race-sub">The reaction at the time</h3>
      <div className="table-wrap">
        <table className="stats">
          <thead><tr><th scope="col">Team</th><th scope="col" className="num">Grades</th><th scope="col">What people said</th></tr></thead>
          <tbody>{m.reaction.map((x) => (
            <tr key={x.team}><th scope="row">{x.team}</th><td className="num"><strong>{x.grades}</strong></td><td className="wrap">{x.said}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <h3 className="race-sub">How it turned out</h3>
      <div className="table-wrap">
        <table className="stats">
          <thead><tr><th scope="col">Season</th><th scope="col">What happened</th></tr></thead>
          <tbody>{m.after.map(([s, w], i) => <tr key={i}><th scope="row">{s}</th><td className="wrap">{w}</td></tr>)}</tbody>
        </table>
      </div>
      <h3 className="race-sub">Who won the trade</h3>
      <NotionTable first="Team" rows={m.verdicts} />
      <Sources list={m.sources} />
    </Section>
  );
}

export function TradeReactionsPage() {
  return (
    <>
      <SampleBar />
      <Crumbs items={[['NBA seasons', href.seasons], ['Trade and free agency reactions']]} />
      <PageHead eyebrow="Sample" title="Trade and free agency reactions">
        <p className="lede">What people said about a big move the day it happened, the grades it got, and how it actually played out. Each would also show on both teams’ pages and the players’ pages.</p>
      </PageHead>
      {MOVES.map((m) => <MoveBlock key={m.id} m={m} />)}
    </>
  );
}

