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
];
