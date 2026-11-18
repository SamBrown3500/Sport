#!/usr/bin/env node
/*
 * Fetch a transcript for a video or podcast URL and save it to
 * sources/transcripts/<id>.md, ready for citing.
 *
 *   node scripts/fetch-transcript.mjs <source-id> <url>
 *
 * Uses the Supadata transcript API (https://supadata.ai). It reads captions
 * where they exist (YouTube, TikTok, Instagram, X, Facebook: 1 credit) and
 * otherwise transcribes the audio with AI (direct MP3/M4A/MP4 links included:
 * 2 credits per minute). The key comes from SUPADATA_API_KEY, or is added by
 * the environment's network secrets when that is how it was set up.
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const [id, url] = process.argv.slice(2);
if (!id || !url || !/^[a-z0-9-]+$/.test(id)) {
  console.error('Usage: node scripts/fetch-transcript.mjs <source-id> <url>   (id: lowercase letters, digits, hyphens)');
  process.exit(1);
}

const API = 'https://api.supadata.ai/v1';
const headers = process.env.SUPADATA_API_KEY ? { 'x-api-key': process.env.SUPADATA_API_KEY } : {};

async function get(path) {
  const res = await fetch(`${API}${path}`, { headers });
  const body = await res.text();
  if (!res.ok && res.status !== 202 && res.status !== 206) {
    throw new Error(`Supadata ${res.status}: ${body.slice(0, 300)}`);
  }
  return { status: res.status, data: body ? JSON.parse(body) : {} };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 754000 ms → "12:34"; 3723000 → "1:02:03". */
function stamp(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const p = (n) => String(n).padStart(2, '0');
  return h ? `${h}:${p(m)}:${p(sec)}` : `${m}:${p(sec)}`;
}

let { status, data } = await get(`/transcript?url=${encodeURIComponent(url)}&mode=auto`);
if (status === 206) {
  console.error('No transcript is available for this URL, and it could not be generated.');
  process.exit(2);
}
// Long or AI-generated transcripts come back as a job to poll.
if (status === 202 && data.jobId) {
  process.stderr.write('Transcribing');
  for (;;) {
    await sleep(5000);
    ({ data } = await get(`/transcript/${data.jobId}`));
    if (data.status === 'completed') break;
    if (data.status === 'failed') throw new Error(`Transcription failed: ${JSON.stringify(data.error ?? data)}`);
    process.stderr.write('.');
  }
  process.stderr.write('\n');
  data = data.result ?? data;
}

// Group caption fragments into paragraphs of about 30 seconds, each with a timestamp.
const chunks = Array.isArray(data.content) ? data.content : null;
let body;
if (chunks) {
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
  body = out.join('\n\n');
} else {
  body = String(data.content ?? '');
}

const file = resolve(process.cwd(), 'sources/transcripts', `${id}.md`);
if (existsSync(file)) console.error(`Overwriting ${file}`);
mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, `# ${id}\nLink: ${url}\nLanguage: ${data.lang ?? 'unknown'}\nFetched: ${new Date().toISOString().slice(0, 10)} via Supadata\n\n${body}\n`);
console.log(`Saved sources/transcripts/${id}.md (${body.length.toLocaleString()} characters)`);
