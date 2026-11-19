#!/usr/bin/env python3
"""
Turn a bulk transcript download (JSON from Apify, BulkTranscripts or similar)
into sources/inbox/<prefix>-<videoId>.md files plus a manifest, the same
format the channel fetchers write.

    python3 -I scripts/import_transcripts_json.py <download.json> --prefix kenny

Accepts a JSON array (or JSON Lines) of per-video objects. It looks for the
usual field names: videoId/id/url, title, publishedAt/uploadDate/date, and
either timed segments (start/offset + text) or a plain transcript string.
"""
import argparse, json, re, sys
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("file")
ap.add_argument("--prefix", default="channel")
a = ap.parse_args()
if not re.fullmatch(r"[a-z0-9-]+", a.prefix):
    sys.exit("--prefix: lowercase letters, digits and hyphens only")

raw = Path(a.file).read_text(encoding="utf-8").strip()
items = json.loads(raw) if raw.startswith("[") else [json.loads(l) for l in raw.splitlines() if l.strip()]

def first(d, *keys):
    for k in keys:
        v = d.get(k)
        if v not in (None, "", []):
            return v
    return None

def ts(sec):
    s = int(float(sec)); h, m, s = s // 3600, s % 3600 // 60, s % 60
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"

def paragraphs(segs):
    out, buf, start = [], [], None
    for g in segs:
        t = first(g, "start", "offset", "startTime", "start_seconds")
        t = float(t or 0)
        if t > 10000 and "offset" in g:  # milliseconds
            t /= 1000
        if start is not None and t - start >= 30:
            out.append(f"[{ts(start)}] " + " ".join(buf)); buf, start = [], None
        text = re.sub(r"\s+", " ", str(first(g, "text", "snippet") or "")).strip()
        if not text: continue
        if start is None: start = t
        buf.append(text)
    if buf: out.append(f"[{ts(start or 0)}] " + " ".join(buf))
    return "\n\n".join(out)

inbox = Path("sources/inbox"); inbox.mkdir(parents=True, exist_ok=True)
mpath = inbox / f"{a.prefix}-manifest.json"
manifest = json.loads(mpath.read_text(encoding="utf-8")) if mpath.exists() else {"videos": {}}
saved = skipped = 0
for it in items:
    url = first(it, "url", "videoUrl", "link") or ""
    vid = first(it, "videoId", "video_id", "id")
    if not vid:
        m = re.search(r"(?:v=|youtu\.be/|shorts/)([\w-]{11})", url)
        vid = m and m[1]
    if not vid or not re.fullmatch(r"[\w-]{11}", str(vid)):
        skipped += 1; continue
    url = url or f"https://www.youtube.com/watch?v={vid}"
    title = str(first(it, "title", "videoTitle") or vid).replace("\n", " ")
    date = str(first(it, "publishedAt", "uploadDate", "publishDate", "date", "published") or "")
    m = re.match(r"(\d{4})-?(\d{2})-?(\d{2})", date); date = f"{m[1]}-{m[2]}-{m[3]}" if m else ""
    segs = first(it, "segments", "transcriptSegments", "captions")
    body = paragraphs(segs) if isinstance(segs, list) else str(first(it, "transcript", "text", "content") or "").strip()
    if not body:
        manifest["videos"][vid] = {"url": url, "title": title, "published": date, "status": "no-captions"}
        skipped += 1; continue
    f = inbox / f"{a.prefix}-{vid}.md"
    f.write_text(f"# {title}\nLink: {url}\nPublished: {date}\nImported: from {Path(a.file).name}\n\n{body}\n", encoding="utf-8")
    manifest["videos"][vid] = {"url": url, "title": title, "published": date, "status": "fetched", "file": str(f)}
    saved += 1
mpath.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
print(f"Saved {saved} transcripts, skipped {skipped}. Manifest: {mpath}")
