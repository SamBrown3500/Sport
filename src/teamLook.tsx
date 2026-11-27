import type { CSSProperties, ReactNode } from 'react';
import { decadePhotos } from './data/decadePhotos';
import { franchises } from './data/franchises';
import { colorsFor } from './data/teamColors';
import { getPlayer, getTeam, storiesForPlayer } from './lib/db';

/* Team colors and player photo slots (gam, 2026-11-27). No logos or photos we lack rights to: badges are text in team colors, and photos come only from Wikimedia Commons with credit. */

export const teamVars = (id: string, name?: string) => {
  const c = colorsFor(id, name);
  return { '--team': c.primary, '--team-2': c.secondary } as CSSProperties;
};

/* ── Team badge and banner ───────────────────────────────────────────── */

export function TeamBadge({ id, size = 'md' }: { id: string; size?: 'sm' | 'md' | 'lg' }) {
  const t = getTeam(id);
  const c = colorsFor(id, t?.name);
  return (
    <span className={`badge badge-${size}`} style={teamVars(id, t?.name)} aria-hidden="true">{c.code}</span>
  );
}

export function TeamBanner({ id }: { id: string }) {
  const t = getTeam(id);
  if (!t) return null;
  const f = franchises[id];
  const nick = t.name.split(' ').slice(-1)[0];
  return (
    <div className="teamband" style={teamVars(id, t.name)}>
      <TeamBadge id={id} size="lg" />
      <div>
        <p className="teamband-eyebrow">{f?.conference ? `${f.conference} · ${f.division} Division` : 'Former franchise'}</p>
        <h1 className="teamband-name">{t.name}</h1>
      </div>
      <span className="teamband-nick" aria-hidden="true">{nick}</span>
    </div>
  );
}

/** Wraps a team page so its section rules and highlights pick up the team's colors. */
export function TeamTheme({ id, children }: { id: string; children: ReactNode }) {
  return <div className="teamtheme" style={teamVars(id, getTeam(id)?.name)}>{children}</div>;
}

/* ── Player photo slot ───────────────────────────────────────────────── */

const photoByPlayer = new Map(Object.values(decadePhotos).map((p) => [p.player.normalize('NFD').replace(/[̀-ͯ]/g, ''), p]));

/** The team a player appears with most often in the narratives. */
function mainTeam(playerId: string): string | undefined {
  const n = new Map<string, number>();
  for (const s of storiesForPlayer(playerId)) for (const t of s.teams) n.set(t, (n.get(t) ?? 0) + 1);
  return [...n.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

export function Headshot({ id }: { id: string }) {
  const p = getPlayer(id);
  if (!p) return null;
  const photo = photoByPlayer.get(p.name.normalize('NFD').replace(/[̀-ͯ]/g, ''));
  const team = mainTeam(id);
  const initials = p.name.replace(/".*?"\s*/g, '').split(' ').map((w) => w[0]).join('').slice(0, 2);
  return (
    <figure className="headshot" style={team ? teamVars(team) : undefined}>
      {photo
        ? <img src={photo.src} alt={p.name} />
        : <span className="headshot-empty" aria-label={`No photo yet for ${p.name}`}>{initials}</span>}
      <figcaption>{photo ? `${photo.author}, ${photo.license}` : 'Photo slot: free-licensed photo to come'}</figcaption>
    </figure>
  );
}

