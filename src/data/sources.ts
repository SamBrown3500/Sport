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
];
