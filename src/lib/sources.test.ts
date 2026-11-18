import { describe, expect, it } from 'vitest';
import type { Source } from '../data/types';
import { citationUrl, toSeconds, youtubeId } from './sources';

const src = (url: string): Source => ({ id: 'x', kind: 'video', title: 'T', outlet: 'O', url, added: '2026-11-18', about: '' });

describe('source links', () => {
  it('reads timestamps', () => {
    expect(toSeconds('12:34')).toBe(754);
    expect(toSeconds('1:02:03')).toBe(3723);
    expect(toSeconds('soon')).toBeUndefined();
  });
  it('finds YouTube ids in the usual link shapes', () => {
    for (const u of ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://youtu.be/dQw4w9WgXcQ?si=abc', 'https://www.youtube.com/shorts/dQw4w9WgXcQ', 'https://m.youtube.com/watch?feature=share&v=dQw4w9WgXcQ'])
      expect(youtubeId(u), u).toBe('dQw4w9WgXcQ');
    expect(youtubeId('https://example.com/watch?v=1')).toBeUndefined();
  });
  it('jumps to the cited moment', () => {
    expect(citationUrl(src('https://youtu.be/dQw4w9WgXcQ'), { source: 'x', at: '1:05' })).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=65s');
    expect(citationUrl(src('https://open.spotify.com/episode/abc?si=1'), { source: 'x', at: '2:00' })).toBe('https://open.spotify.com/episode/abc?t=120');
    expect(citationUrl(src('https://podcasts.apple.com/us/podcast/x/id1'), { source: 'x', at: '2:00' })).toBe('https://podcasts.apple.com/us/podcast/x/id1');
  });
});
