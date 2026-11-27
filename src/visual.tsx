import { useMemo, useRef } from 'react';
import { PageHead, Section, Timeline } from './components';
import { bbref } from './data/bbref';
import { decadePhotos } from './data/decadePhotos';
import { franchises, nameMatches } from './data/franchises';
import type { Category, Story } from './data/types';
import { getStory, getTeam, storiesForTeam, storiesInSeason, teams } from './lib/db';
import { TeamBadge, teamVars } from './teamLook';
import { byImportance, LANDMARKS } from './lib/importance';
import { notionFor } from './lib/notions';
import { href } from './lib/router';
import { CATEGORIES, FIRST_SEASON, categoryInfo, currentSeason, seasonLabel, seasonOf } from './lib/seasons';
import { franchiseTotals, teamSeasons } from './lib/teamSeasons';
import { NOTION_VERDICTS } from './data/notions';
import { NotionsTeaser } from './byYear';
import { Scoreboard } from './scoreboard';
import { DecadeStrip, PhotoCredits } from './pages';

/*
 * The visual layer (gam, 2026-11-27): the home page with a featured narrative,
 * a champion strip in team colors and team tiles, and the timeline page that
 * scrolls sideways through every season by decade. Team colors and player
 * photo slots live in teamLook.tsx.
 */

/* ── Champions, from the Basketball Reference snapshot ───────────────── */

const franchiseIds = Object.keys(franchises);
function franchiseFor(name: string, season: number): string | undefined {
  return franchiseIds.find((id) => nameMatches(franchises[id], name, season));
}

export function championOf(season: number): { id?: string; name: string } | undefined {
  const finals = bbref[season]?.playoffs?.find((s) => s[0] === 'Finals');
  if (!finals) return undefined;
  return { id: franchiseFor(finals[1], season), name: finals[1] };
}

/* ── Timeline by decade ──────────────────────────────────────────────── */

const CAT_CLASS: Record<Category, string> = {
  'mvp-race': 'c-mvp', 'draft-drama': 'c-draft', contenders: 'c-contenders', surprises: 'c-surprises',
};
const PER_SEASON = 4;

function SeasonColumn({ season }: { season: number }) {
  const list = useMemo(() => storiesInSeason(season).sort(byImportance()), [season]);
  const champ = championOf(season);
  const shown = list.slice(0, PER_SEASON);
  return (
    <div className="tl-season">
      <a className="tl-cap" href={href.season(season)} style={champ?.id ? teamVars(champ.id) : undefined}>
        <span className="tl-year">{seasonLabel(season)}</span>
        <span className="tl-champ">{champ ? <>Champion: {champ.name.split(' ').slice(-1)[0]}</> : season >= currentSeason() ? 'In progress' : '—'}</span>
      </a>
      <ol className="tl-cards">
        {shown.map((s) => {
          const cat = s.categories?.[0];
          const n = notionFor(s);
          return (
            <li key={s.id} className={cat ? CAT_CLASS[cat] : ''}>
              <a href={href.story(s.id)}>{s.title}</a>
              {n && <span className={`nv-dot nv-${n[2]}`} title={NOTION_VERDICTS[n[2]]} />}
            </li>
          );
        })}
      </ol>
      {list.length > shown.length && <a className="tl-more" href={href.season(season)}>+{list.length - shown.length} more</a>}
    </div>
  );
}

export function TimelinePage() {
  const track = useRef<HTMLDivElement>(null);
  const last = currentSeason();
  const decades = useMemo(() => {
    const out: number[] = [];
    for (let d = Math.floor(FIRST_SEASON / 10) * 10; d <= last; d += 10) out.push(d);
    return out;
  }, [last]);
  const jump = (d: number) => {
    const el = track.current?.querySelector<HTMLElement>(`[data-decade="${d}"]`);
    if (el && track.current) track.current.scrollTo({ left: el.offsetLeft - track.current.offsetLeft, behavior: 'smooth' });
  };
  const nudge = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: 'smooth' });
  return (
    <>
      <PageHead eyebrow="NBA, 1946 to today" title="Timeline">
        <p className="lede">Every season side by side. Scroll sideways through the decades: each column is a season, topped in the champion's colors, with its biggest stories underneath.</p>
      </PageHead>
      <div className="tl-controls">
        <div className="toggle" role="group" aria-label="Jump to decade">
          {decades.map((d) => <button key={d} type="button" onClick={() => jump(d)}>{d}s</button>)}
        </div>
        <span className="tl-arrows">
          <button type="button" className="tl-arrow" onClick={() => nudge(-1)} aria-label="Scroll back">←</button>
          <button type="button" className="tl-arrow" onClick={() => nudge(1)} aria-label="Scroll forward">→</button>
        </span>
      </div>
      <p className="tl-legend">
        {CATEGORIES.map((c) => <span key={c.id} className={`tl-key ${CAT_CLASS[c.id]}`}>{c.name}</span>)}
        <span className="tl-key-dots"><span className="nv-dot nv-busted" /> consensus busted <span className="nv-dot nv-held" /> held</span>
      </p>
      <div className="tl-track" ref={track} tabIndex={0} aria-label="Timeline, scrolls sideways">
        {decades.map((d) => {
          const photo = decadePhotos[d];
          const seasons = Array.from({ length: 10 }, (_, i) => d + i).filter((s) => s >= FIRST_SEASON && s <= last);
          return (
            <section key={d} className="tl-decade" data-decade={d} aria-label={`${d}s`}>
              <header className="tl-decade-head">
                {photo && <img src={photo.src} alt={photo.player} title={`${photo.player} · ${photo.author}, ${photo.license}`} />}
                <div>
                  <a href={href.decade(d)} className="tl-decade-name">The {d}s</a>
                  {photo && <span className="tl-decade-face">{photo.player}</span>}
                </div>
              </header>
              <div className="tl-seasons">
                {seasons.map((s) => <SeasonColumn key={s} season={s} />)}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

/* ── Home page ──────────────────────────────────────────── */

function featured(): Story | undefined {
  const pool = [...LANDMARKS].map((id) => getStory(id)).filter((s): s is Story => !!s && !!notionFor(s));
  if (!pool.length) return undefined;
  const day = Math.floor(Date.now() / 86_400_000);
  return pool[day % pool.length];
}

function FeaturedCard() {
  const s = featured();
  if (!s) return null;
  const [expected, happened, verdict] = notionFor(s)!;
  const team = s.teams.find((t) => franchises[t]);
  return (
    <a className="feature" href={href.story(s.id)} style={team ? teamVars(team) : undefined}>
      <span className="feature-eyebrow">Today's narrative · {seasonLabel(seasonOf(s))}{s.categories?.[0] ? ` · ${categoryInfo(s.categories[0])?.name}` : ''}</span>
      <span className="feature-title">{s.title}</span>
      <span className="feature-row"><b>Expected</b>{expected}</span>
      <span className="feature-row"><b>Happened</b>{happened}</span>
      <span className={`nv nv-${verdict} feature-verdict`}>{NOTION_VERDICTS[verdict]}</span>
    </a>
  );
}

function ChampionStrip() {
  const last = currentSeason();
  const seasons = Array.from({ length: last - FIRST_SEASON }, (_, i) => FIRST_SEASON + i);
  return (
    <div className="champstrip-wrap">
      <div className="champstrip" role="list">
        {seasons.map((s) => {
          const c = championOf(s);
          return (
            <a key={s} role="listitem" href={href.season(s)} style={c?.id ? teamVars(c.id) : undefined}
              title={`${seasonLabel(s)}: ${c?.name ?? 'no champion on file'}`} aria-label={`${seasonLabel(s)} champion ${c?.name ?? 'unknown'}`} />
          );
        })}
      </div>
      <div className="champstrip-axis" aria-hidden="true">
        {[1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020].map((y) => (
          <span key={y} style={{ left: `${((y - FIRST_SEASON) / seasons.length) * 100}%` }}>{y}</span>
        ))}
      </div>
    </div>
  );
}

function TeamTiles() {
  const known = new Set(teams.map((t) => t.id));
  const ids = Object.entries(franchises).filter(([id, f]) => f.conference && known.has(id))
    .sort((a, b) => (a[1].conference! + getTeam(a[0])!.name).localeCompare(b[1].conference! + getTeam(b[0])!.name));
  return (
    <div className="tiles">
      {ids.map(([id, f]) => {
        const t = getTeam(id)!;
        const titles = franchiseTotals(teamSeasons(id, storiesForTeam(id))).titles.length;
        return (
          <a key={id} className="tile" href={href.team(id)} style={teamVars(id)}>
            <TeamBadge id={id} />
            <span className="tile-name">{t.name.split(' ').slice(-1)[0]}</span>
            <span className="tile-meta">{f.conference} · {titles ? `${titles} title${titles > 1 ? 's' : ''}` : 'no titles'}</span>
          </a>
        );
      })}
    </div>
  );
}

export function Home() {
  const cur = currentSeason();
  const season = storiesInSeason(cur).length ? cur : cur - 1;
  const current = storiesInSeason(season).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <section className="hero2">
        <div className="hero2-text">
          <p className="eyebrow">NBA history, 1946 to today</p>
          <h1>What was everyone saying at the time?</h1>
          <p className="lede">Who was supposed to win, who was supposed to bust, and what actually happened. Pick a decade, scroll the timeline, or search any date, player or team.</p>
          <p className="hero2-links"><a href={href.timeline}>Open the timeline →</a><a href={href.notions}>Every preconceived notion →</a></p>
        </div>
        <FeaturedCard />
      </section>

      <Section title="Browse by decade">
        <DecadeStrip />
        <PhotoCredits />
      </Section>

      <Section title="Every champion" aside={<a className="more" href={href.timeline}>Timeline →</a>}>
        <p className="section-lede">One stripe per season in the champion's colors, from Basketball Reference. Tap one for that season.</p>
        <ChampionStrip />
      </Section>

      <Scoreboard />

      <Section title="Teams" count={30} aside={<a className="more" href={href.teams}>All teams →</a>}>
        <TeamTiles />
      </Section>

      <NotionsTeaser />

      <Section title={`Current narratives: ${seasonLabel(season)}`} count={current.length}
        aside={<a className="more" href={href.season(season)}>Full season page →</a>}>
        <Timeline stories={current.slice(0, 8)} />
      </Section>
    </>
  );
}
