import type { Source } from './types';

/*
 * Videos, podcasts, articles and books that narratives are drawn from.
 *
 * To add one: give it an id here, keep its transcript or notes in
 * sources/transcripts/<id>.md, then cite it from stories in stories.ts with
 * `sources: [{ source: '<id>', at: '12:34', quote: '...' }]`.
 * See docs/ADDING_SOURCES.md for the full steps.
 */
export const sources: Source[] = [
  {
    id: 'kenny-jaylen-brown-sixers',
    kind: 'video',
    title: 'The Celtics Traded Jaylen Brown To THE SIXERS?',
    outlet: 'Kenny For Real (Kenny Beecham)',
    url: 'https://www.youtube.com/watch?v=l5Kh3e_k71U',
    published: '2026-07-01',
    added: '2026-11-18',
    about: 'Kenny Beecham reacts live, minutes after Boston traded Jaylen Brown to Philadelphia: the package, the rivalry, the Giannis talks that fell through and what it means for both teams.',
    transcript: 'sources/transcripts/kenny-jaylen-brown-sixers.md',
  },
  {
    id: 'kenny-chris-paul-suns',
    kind: 'video',
    title: 'Chris Paul Traded to The Phoenix Suns',
    outlet: 'Kenny For Real (Kenny Beecham)',
    added: '2026-11-19',
    about: 'Kenny Beecham, a self-described huge Chris Paul fan, reacts minutes after Oklahoma City trades Paul to Phoenix: the package, how Paul rebuilt his value, and the Booker-Paul backcourt.',
    transcript: 'sources/transcripts/kenny-chris-paul-suns.md',
  },
  {
    id: 'ap-chris-paul-suns',
    kind: 'article',
    title: 'AP source: Chris Paul acquired by Phoenix from Oklahoma City',
    outlet: 'Associated Press',
    url: 'https://www.kgun9.com/sports/local-sports/ap-source-chris-paul-acquired-by-phoenix-from-oklahoma-city',
    published: '2020-11-16',
    added: '2026-11-19',
    about: 'The wire report of the trade, with the players and pick going to Oklahoma City. Used to date the trade.',
  },
  {
    id: 'dom2k-spurs-generation-of-winning',
    kind: 'video',
    title: 'A Generation of Winning: Why The Spurs Have DOMINATED Most of Your Life',
    outlet: 'Dom2K',
    published: '2024',
    added: '2026-11-19',
    about: 'An hour-long history of the Spurs from the 1997 Duncan lottery to Victor Wembanyama, built around how much of it was luck and how much was savvy: near-misses, rivalries, heartbreaks and the moments the torch passed.',
    transcript: 'sources/transcripts/dom2k-spurs-generation-of-winning.md',
  },
  {
    id: 'dom2k-mavericks-life-without-luka',
    kind: 'video',
    title: 'How The Dallas Mavericks Destroyed It ALL: Life Without Luka',
    outlet: 'Dom2K',
    published: '2025',
    added: '2026-11-19',
    about: 'An 85-minute history of the Mavericks from the Three J\'s to the Luka Doncic trade: Nash leaving, the 2006 collapse, the We Believe upset, the 2011 title, and the trade nobody saw coming. Recorded about two weeks after Doncic was dealt.',
    transcript: 'sources/transcripts/dom2k-mavericks-life-without-luka.md',
  },
  {
    id: 'dom2k-heat-35-year-tale',
    kind: 'video',
    title: "Miami's 35 Year Tale: The Art of Winning",
    outlet: 'Dom2K',
    published: '2024',
    added: '2026-11-19',
    about: 'A 77-minute history of the Heat built around Pat Riley: the Mourning and Hardaway teams and the Knicks wars, drafting Wade, the Shaq trade and 2006 title, the Big Three years, Bosh\'s blood clots, Wade\'s exit and return, and the Jimmy Butler era. Recorded during the 2023-24 season.',
    transcript: 'sources/transcripts/dom2k-heat-35-year-tale.md',
  },
  {
    id: 'thunder-beat-their-curse',
    kind: 'video',
    title: 'How The Thunder Finally Beat Their Curse After Decades',
    outlet: 'YouTube (channel not named)',
    published: '2025',
    added: '2026-11-19',
    about: 'A 75-minute history from the 1996 Sonics to the Thunder\'s 2025 title: Kemp and Payton, the move to Oklahoma City, the Durant-Westbrook-Harden core, the Harden trade, Durant leaving, the Paul George trade haul and the Shai Gilgeous-Alexander rebuild. Recorded after the 2025 Finals.',
    transcript: 'sources/transcripts/thunder-beat-their-curse.md',
  },
];
