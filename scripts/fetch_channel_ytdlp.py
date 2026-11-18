#!/usr/bin/env python3
"""
Free alternative to fetch-channel.mjs: save a YouTube channel's captions with
yt-dlp, run on a computer where YouTube isn't blocked (not a cloud server).

    pip install yt-dlp
    python3 scripts/fetch_channel_ytdlp.py https://www.youtube.com/@KennyFR/videos --max 100 --prefix kenny

Writes sources/inbox/<prefix>-<videoId>.md (title, date, link, timestamped
paragraphs) and sources/inbox/<prefix>-manifest.json, newest first, skipping
videos already saved. Waits a few seconds between videos so YouTube doesn't
rate-limit; re-run to continue where it stopped.
"""
import argparse, json, re, subprocess, sys, tempfile, time
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("channel")
ap.add_argument("--max", type=int, default=100)
ap.add_argument("--prefix", default="channel")
ap.add_argument("--sleep", type=float, default=4.0)
a = ap.parse_args()
if not re.fullmatch(r"[a-z0-9-]+", a.prefix):
    sys.exit("--prefix: lowercase letters, digits and hyphens only")

inbox = Path("sources/inbox"); inbox.mkdir(parents=True, exist_ok=True)
mpath = inbox / f"{a.prefix}-manifest.json"
manifest = json.loads(mpath.read_text()) if mpath.exists() else {"channel": a.channel, "videos": {}}

def ytdlp(*args):
    return subprocess.run([sys.executable, "-m", "yt_dlp", *args], capture_output=True, text=True)

# 1. List the channel's videos, newest first (no downloads).
r = ytdlp("--flat-playlist", "--print", "%(id)s", a.channel)
if r.returncode:
    sys.exit(r.stderr[-800:])
ids = [i for i in r.stdout.split() if i]
print(f"Channel lists {len(ids)} videos.")

def ts(sec):
    s = int(sec); h, m, s = s // 3600, s % 3600 // 60, s % 60
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"

def vtt_paragraphs(text):
    """Auto-captions repeat lines as they scroll; keep each new line once, grouped into ~30s paragraphs."""
    out, buf, start, seen = [], [], None, set()
    for block in text.split("\n\n"):
        m = re.search(r"(\d+):(\d\d):(\d\d)\.\d+ -->", block)
        if not m: continue
        t = int(m[1]) * 3600 + int(m[2]) * 60 + int(m[3])
        if start is not None and t - start >= 30:
            out.append(f"[{ts(start)}] " + " ".join(buf)); buf, start = [], None
        for line in block.splitlines()[1:]:
            line = re.sub(r"<[^>]+>", "", line).strip()
            if not line or "-->" in line or line in seen: continue
            seen.add(line)
            if start is None: start = t
            buf.append(line)
    if buf: out.append(f"[{ts(start or 0)}] " + " ".join(buf))
    return "\n\n".join(out)

done = 0
for vid in ids:
    if done >= a.max: break
    if vid in manifest["videos"]: continue
    url = f"https://www.youtube.com/watch?v={vid}"
    with tempfile.TemporaryDirectory() as tmp:
        r = ytdlp("--skip-download", "--write-subs", "--write-auto-subs", "--sub-langs", "en.*,en",
                  "--sub-format", "vtt", "--print", "%(title)s\t%(upload_date)s\t%(duration)s",
                  "--no-simulate", "-o", f"{tmp}/%(id)s.%(ext)s", url)
        done += 1
        meta = (r.stdout.strip().splitlines() or [""])[0].split("\t")
        title, date = (meta + ["", ""])[:2]
        date = f"{date[:4]}-{date[4:6]}-{date[6:]}" if re.fullmatch(r"\d{8}", date) else ""
        subs = sorted(Path(tmp).glob("*.vtt"))
        if not subs:
            manifest["videos"][vid] = {"url": url, "title": title, "published": date, "status": "no-captions"}
            print(f"  {vid}: no captions ({r.stderr.strip().splitlines()[-1:] or ''})")
        else:
            body = vtt_paragraphs(subs[0].read_text(errors="ignore"))
            f = inbox / f"{a.prefix}-{vid}.md"
            f.write_text(f"# {title}\nLink: {url}\nPublished: {date}\nFetched: {time.strftime('%Y-%m-%d')} via yt-dlp (captions)\n\n{body}\n")
            manifest["videos"][vid] = {"url": url, "title": title, "published": date, "status": "fetched", "file": str(f)}
            print(f"  {vid}: {title}")
    mpath.write_text(json.dumps(manifest, indent=2))
    time.sleep(a.sleep)
print(f"Done: {done} videos this run, {len(manifest['videos'])} in the manifest.")
