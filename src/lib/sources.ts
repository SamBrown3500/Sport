import type { Citation, Source } from '../data/types';

/** "1:02:03" or "12:34" → seconds. Returns undefined for anything else. */
export function toSeconds(at: string): number | undefined {
  if (!/^\d{1,2}(:\d{2}){1,2}$/.test(at)) return undefined;
  return at.split(':').map(Number).reduce((acc, n) => acc * 60 + n, 0);
}

/** The YouTube video id, if this is a YouTube link. */
export function youtubeId(url?: string): string | undefined {
  if (!url) return undefined;
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return m?.[1];
}

/** Link that opens the source at the cited moment, where the host supports it. */
export function citationUrl(src: Source, c?: Citation): string | undefined {
  if (!src.url) return undefined;
  const secs = c?.at ? toSeconds(c.at) : undefined;
  if (secs === undefined) return src.url;
  const yt = youtubeId(src.url);
  if (yt) return `https://www.youtube.com/watch?v=${yt}&t=${secs}s`;
  if (/vimeo\.com\//.test(src.url)) return `${src.url.split('#')[0]}#t=${secs}s`;
  if (/open\.spotify\.com\/episode\//.test(src.url)) return `${src.url.split('?')[0]}?t=${secs}`;
  return src.url;
}

export const SOURCE_KIND: Record<Source['kind'], string> = {
  video: 'Video',
  podcast: 'Podcast',
  article: 'Article',
  book: 'Book',
};
