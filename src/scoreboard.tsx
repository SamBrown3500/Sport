import { useEffect, useState } from 'react';
import { scoreboard, type ScoreboardTeam } from './data/scoreboard';
import { href } from './lib/router';
import { site } from './site';

/* The home page scoreboard: an arena board that cycles through famous upsets,
   showing the pick at the time against what happened. */

const SECONDS = 6;

function Team({ t }: { t: ScoreboardTeam }) {
  return (
    <div className={`sb-team${t.wins === 4 ? ' is-winner' : ''}`}>
      <div className="sb-wins">{t.wins}</div>
      <div className="sb-name">{t.name}</div>
      <div className="sb-rec">{t.seed} · {t.record}</div>
    </div>
  );
}

export function Scoreboard() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(() => {
    if (paused || reduce) return;
    const t = setTimeout(() => setI((n) => (n + 1) % scoreboard.length), SECONDS * 1000);
    return () => clearTimeout(t);
  }, [i, paused, reduce]);
  const g = scoreboard[i];
  return (
    <section className="scoreboard" aria-label="Upsets: the pick and the result"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="sb-brand">{site.brand[0]} <span>{site.brand[1]}</span></div>
      <div className="sb-sub">The pick · The result</div>
      <a className="sb-game" href={href.story(g.story)} aria-live="polite">
        <Team t={g.favorite} />
        <div className="sb-mid">
          <span className="sb-tag">Upset</span>
          <span className="sb-year">{g.year}</span>
          <span>{g.round}</span>
        </div>
        <Team t={g.underdog} />
      </a>
      <div className="sb-verdict">
        <div>The pick: <b>{g.pick}</b></div>
        <div>What happened: <b>{g.result}</b></div>
      </div>
      <div className="sb-clock" aria-hidden="true">
        <i key={`${i}-${paused}`} style={{ animationDuration: `${SECONDS}s`, animationPlayState: paused || reduce ? 'paused' : 'running' }} />
      </div>
      <div className="sb-dots">
        {scoreboard.map((x, j) => (
          <button key={x.story} type="button" aria-current={i === j} aria-label={`${x.year} ${x.round}`} onClick={() => setI(j)} />
        ))}
      </div>
    </section>
  );
}
