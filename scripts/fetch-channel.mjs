#!/usr/bin/env node
/*
 * Fetch transcripts for many videos from one YouTube channel, newest first.
 *
 *   node scripts/fetch-channel.mjs <channel-url-or-handle> [--max 50] [--prefix kenny]
 *
 * Lists the channel's regular videos (no Shorts or lives) with Supadata
 * (1 credit), then saves each video's existing captions (1 credit each) to
 * sources/inbox/<prefix>-<videoId>.md. It only reads captions that already
 * exist (mode=native), so it never spends the 2-credits-a-minute AI
 * transcription. Videos already saved are skipped, so it is safe to re-run
 * in batches. A summary of what was fetched is written to
 * sources/inbox/<prefix>-manifest.json.
 *
 * Transcripts land in sources/inbox/ until Claude has read them; the ones
 * that produce narratives are moved to sources/transcripts/.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const channel = args.find((a) => !a.startsWith('--'));
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const max = Number(opt('max', 50));
const prefix = opt('prefix', 'channel');
if (!channel || !Number.isFinite(max) || max < 1 || !/^[a-z0-9-]+$/.test(prefix)) {
  console.error('Usage: node scripts/fetch-channel.mjs <channel-url-or-handle> [--max 50] [--prefix kenny]');
  process.exit(1);
}

const API = 'https://api.supadata.ai/v1';
const headers = process.env.SUPADATA_API_KEY ? { 'x-api-key': process.env.SUPADATA_API_KEY } : {};
async function get(path) {
  const res = await fetch(`${API}${path}`, { headers });
  const text = await res.text();
  if (!res.ok && res.status !== 206) throw new Error(`Supadata ${res.status}: ${text.slice(0, 300)}`);
  return { status: res.status, data: text ? JSON.parse(text) : {} };
}

function stamp(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const p = (n) => String(n).padStart(2, '0');
  return h ? `${h}:${p(m)}:${p(sec)}` : `${m}:${p(sec)}`;
}
function paragraphs(chunks) {
  const out = [];
  let start = null, buf = [];
  for (const c of chunks) {
    if (start === null) start = c.offset ?? 0;
    buf.push(String(c.text).replace(/\s+/g, ' ').trim());
    if ((c.offset ?? 0) + (c.duration ?? 0) - start >= 30000) {
      out.push(`[${stamp(start)}] ${buf.join(' ')}`);
      start = null; buf = [];
    }
  }
  if (buf.length) out.push(`[${stamp(start ?? 0)}] ${buf.join(' ')}`);
  return out.join('\n\n');
}

const dir = resolve(process.cwd(), 'sources/inbox');
mkdirSync(dir, { recursive: true });
const manifestPath = resolve(dir, `${prefix}-manifest.json`);
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : { channel, videos: {} };

// Ask for enough ids to find `max` new ones past what is already saved.
const known = Object.keys(manifest.videos).length;
const { data: list } = await get(`/youtube/channel/videos?id=${encodeURIComponent(channel)}&type=video&limit=${Math.min(5000, known + max)}`);
const ids = list.videoIds ?? [];
console.log(`Channel has at least ${ids.length} regular videos listed (asked for ${Math.min(5000, known + max)}).`);

let fetched = 0, credits = 1;
for (const id of ids) {
  if (fetched >= max) break;
  if (manifest.videos[id]) continue;
  const url = `https://www.youtube.com/watch?v=${id}`;
  const { status, data } = await get(`/transcript?url=${encodeURIComponent(url)}&mode=native`);
  credits += 1;
  fetched += 1;
  if (status === 206 || !Array.isArray(data.content)) {
    manifest.videos[id] = { url, status: 'no-captions' };
    console.log(`  ${id}: no captions`);
    continue;
  }
  const file = `${prefix}-${id}.md`;
  writeFileSync(resolve(dir, file), `# ${id}\nLink: ${url}\nLanguage: ${data.lang ?? 'unknown'}\nFetched: ${new Date().toISOString().slice(0, 10)} via Supadata (captions)\n\n${paragraphs(data.content)}\n`);
  manifest.videos[id] = { url, status: 'fetched', file: `sources/inbox/${file}` };
  console.log(`  ${id}: saved`);
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Done: ${fetched} videos checked, about ${credits} credits used.`);
