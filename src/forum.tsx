import { useState, type FormEvent, type ReactNode } from 'react';
import { Crumbs, Empty, PageHead, Section } from './components';
import type { Story } from './data/types';
import { NOTION_VERDICTS } from './data/notions';
import { allStories, getStory } from './lib/db';
import { formatDate } from './lib/dates';
import { href } from './lib/router';
import { notionFor } from './lib/notions';
import { currentSeason, FIRST_SEASON, seasonLabel, seasonOf } from './lib/seasons';
import {
  LIMITS, authorName, clean, forum, lastActivity, safeLink, saveName, savedName, stanceTally, useForum,
  type ForumState, type Reply, type Stance, type SuggestionStatus, type Thread,
} from './lib/forum';
import { NotionBox, VerdictTag } from './byYear';

/* ── Small pieces ──────────────────────────────────────────────────── */

const STATUS: Record<SuggestionStatus, string> = { new: 'Under review', added: 'Added to the site', declined: 'Not added' };

function StatusTag({ status }: { status?: SuggestionStatus }) {
  const s = status ?? 'new';
  return <span className={`fs fs-${s}`}>{STATUS[s]}</span>;
}

const when = (iso: string) => formatDate(iso.slice(0, 10));

/** Where posts are saved, said plainly, and anything the reader should know. */
function ModeNote({ s }: { s: ForumState }) {
  return (
    <>
      {s.mode === 'local' && (
        <p className="forum-mode">
          Practice mode: posts are saved in this browser only, until the site goes live with its own server.
        </p>
      )}
      {s.notice && <p className="forum-mode is-warn" role="status">{s.notice}</p>}
    </>
  );
}

function canRemove(s: ForumState, p: { authorId: string }) {
  return !!s.viewer && (s.viewer.isModerator || (!!s.viewer.id && p.authorId === s.viewer.id));
}

/** Paragraphs from plain text. Posts are never treated as markup. */
function Body({ text }: { text: string }) {
  return <>{text.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</>;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

function NameField({ s, value, onChange }: { s: ForumState; value: string; onChange: (v: string) => void }) {
  if (s.mode !== 'local') return null;
  return (
    <Field label="Your name" hint="Shown with your post.">
      <input value={value} maxLength={LIMITS.name} onChange={(e) => onChange(e.target.value)} placeholder="Anonymous" />
    </Field>
  );
}

/* ── Forum home ────────────────────────────────────────────────────── */

type Tab = 'all' | 'debates' | 'suggestions';

export function ForumPage({ tab: initial }: { tab?: 'debates' | 'suggestions' }) {
  const s = useForum();
  const [tab, setTab] = useState<Tab>(initial ?? 'all');
  const [status, setStatus] = useState<SuggestionStatus | 'all'>('all');
  const sorted = [...s.threads]
    .map((t) => ({ t, last: lastActivity(t, s.replies), n: s.replies.filter((r) => r.threadId === t.id).length }))
    .sort((a, b) => b.last.localeCompare(a.last));
  const shown = sorted.filter(({ t }) =>
    (tab === 'all' || (tab === 'debates' ? t.kind === 'debate' : t.kind === 'suggestion'))
    && (tab !== 'suggestions' || status === 'all' || (t.status ?? 'new') === status));
  const count = (k: Thread['kind']) => s.threads.filter((t) => t.kind === k).length;
  return (
    <>
      <Crumbs items={[['Calendar', href.home], ['Forum']]} />
      <PageHead eyebrow="Community" title="Forum">
        <p className="lede">
          Argue with the verdicts, defend the takes that aged badly, and suggest narratives the calendar is missing.
          Suggestions are checked against Basketball Reference before they are added.
        </p>
      </PageHead>
      <ModeNote s={s} />
      <div className="forum-actions">
        <a className="btn" href={href.forumDebate()}>Start a debate</a>
        <a className="btn btn-quiet" href={href.forumSuggest}>Suggest a narrative</a>
      </div>
      <div className="filters">
        <div className="toggle" role="group" aria-label="Show">
          <button type="button" aria-pressed={tab === 'all'} onClick={() => setTab('all')}>Everything ({s.threads.length})</button>
          <button type="button" aria-pressed={tab === 'debates'} onClick={() => setTab('debates')}>Debates ({count('debate')})</button>
          <button type="button" aria-pressed={tab === 'suggestions'} onClick={() => setTab('suggestions')}>Suggestions ({count('suggestion')})</button>
        </div>
        {tab === 'suggestions' && (
          <div className="toggle" role="group" aria-label="Status">
            <button type="button" aria-pressed={status === 'all'} onClick={() => setStatus('all')}>Any status</button>
            {(Object.keys(STATUS) as SuggestionStatus[]).map((st) => (
              <button key={st} type="button" aria-pressed={status === st} onClick={() => setStatus(st)}>{STATUS[st]}</button>
            ))}
          </div>
        )}
      </div>
      {s.loading && s.mode !== 'local'
        ? <p className="note">Loading posts…</p>
        : shown.length
          ? (
            <div className="table-wrap">
              <table className="stats forum-table">
                <thead>
                  <tr>
                    <th scope="col">Topic</th>
                    <th scope="col">About</th>
                    <th scope="col" className="num">Replies</th>
                    <th scope="col">Last post</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map(({ t, n, last }) => <ThreadRow key={t.id} t={t} n={n} last={last} s={s} />)}
                </tbody>
              </table>
            </div>
          )
          : <Empty>{s.threads.length ? 'Nothing here with these filters.' : 'No posts yet. Start the first debate, or pick any narrative and debate its verdict.'}</Empty>}
    </>
  );
}

function ThreadRow({ t, n, last, s }: { t: Thread; n: number; last: string; s: ForumState }) {
  const story = t.storyId ? getStory(t.storyId) : undefined;
  return (
    <tr>
      <td className="wrap">
        <a href={href.forumThread(t.id)}><strong>{t.title}</strong></a>
        <div className="note">{t.kind === 'debate' ? 'Debate' : 'Suggestion'} · {authorName(s, t)}</div>
      </td>
      <td className="wrap">
        {t.kind === 'suggestion'
          ? <>{t.season !== undefined && <>{seasonLabel(t.season)} · </>}<StatusTag status={t.status} /></>
          : story ? <a href={href.story(story.id)}>{story.title}</a> : <span className="muted">General</span>}
      </td>
      <td className="num">{n}</td>
      <td>{when(last)}</td>
    </tr>
  );
}

/* ── Start a thread ────────────────────────────────────────────────── */

export function ForumNewPage({ kind, story: storyId }: { kind: 'debate' | 'suggestion'; story?: string }) {
  const s = useForum();
  const story = storyId ? getStory(storyId) : undefined;
  const [name, setName] = useState(savedName);
  const [title, setTitle] = useState(story ? story.title.slice(0, LIMITS.title) : '');
  const [body, setBody] = useState('');
  const [pick, setPick] = useState(storyId ?? '');
  const [season, setSeason] = useState(String(currentSeason()));
  const [expected, setExpected] = useState('');
  const [happened, setHappened] = useState('');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isDebate = kind === 'debate';
  const seasons = Array.from({ length: currentSeason() - FIRST_SEASON + 1 }, (_, i) => currentSeason() - i);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const t = clean(title, LIMITS.title);
    const b = clean(body, LIMITS.body);
    if (!t) return setError('Give it a title.');
    if (isDebate && !b) return setError('Say what you think.');
    if (!isDebate && !clean(expected, LIMITS.field)) return setError('Say what people expected at the time. That is the heart of every narrative here.');
    if (link.trim() && !safeLink(link)) return setError('Source links need to start with https://');
    const authorName = s.mode === 'local' ? clean(name, LIMITS.name) || undefined : undefined;
    if (authorName) saveName(authorName);
    setBusy(true);
    try {
      const id = await forum.addThread(isDebate
        ? { kind, title: t, body: b, storyId: pick || undefined, authorName }
        : {
          kind, title: t, body: b, season: Number(season), authorName,
          expected: clean(expected, LIMITS.field), happened: clean(happened, LIMITS.field) || undefined,
          link: safeLink(link),
        });
      location.hash = href.forumThread(id).slice(1);
    } catch {
      setError("That didn't save. Try again in a moment.");
      setBusy(false);
    }
  };

  const blocked = !s.viewer?.canPost && s.mode !== 'connecting';
  return (
    <>
      <Crumbs items={[['Forum', href.forum], [isDebate ? 'Start a debate' : 'Suggest a narrative']]} />
      <PageHead eyebrow="Forum" title={isDebate ? 'Start a debate' : 'Suggest a narrative'}>
        <p className="lede">
          {isDebate
            ? 'Pick a narrative, or leave it general. Debates about a prediction let readers say whether the verdict on file is right.'
            : 'Every narrative here starts with what people expected at the time, then what happened. Add a source link from the time if you have one.'}
        </p>
      </PageHead>
      <ModeNote s={s} />
      {story && <NotionBox story={story} />}
      {blocked
        ? <Empty>You can read the forum but not post from this view.</Empty>
        : (
          <form className="forum-form" onSubmit={submit}>
            <NameField s={s} value={name} onChange={setName} />
            {isDebate && (
              <Field label="Narrative" hint="Optional.">
                <StoryPicker value={pick} onChange={setPick} />
              </Field>
            )}
            <Field label="Title">
              <input value={title} maxLength={LIMITS.title} onChange={(e) => setTitle(e.target.value)} required
                placeholder={isDebate ? 'The 2004 Pistons were never really underdogs' : 'The 1999 Knicks as an 8 seed'} />
            </Field>
            {!isDebate && (
              <>
                <Field label="Season">
                  <select value={season} onChange={(e) => setSeason(e.target.value)}>
                    {seasons.map((y) => <option key={y} value={y}>{seasonLabel(y)}</option>)}
                  </select>
                </Field>
                <Field label="What people expected at the time">
                  <textarea rows={3} value={expected} maxLength={LIMITS.field} onChange={(e) => setExpected(e.target.value)} required
                    placeholder="Who was the favorite, what analysts predicted, how the pick was graded" />
                </Field>
                <Field label="What actually happened" hint="Optional.">
                  <textarea rows={3} value={happened} maxLength={LIMITS.field} onChange={(e) => setHappened(e.target.value)} />
                </Field>
                <Field label="Source from the time" hint="Optional. An article, video or podcast link, starting with https://">
                  <input type="url" value={link} maxLength={LIMITS.link} onChange={(e) => setLink(e.target.value)} placeholder="https://" />
                </Field>
              </>
            )}
            <Field label={isDebate ? 'Your take' : 'Anything else'} hint={isDebate ? undefined : 'Optional.'}>
              <textarea rows={6} value={body} maxLength={LIMITS.body} onChange={(e) => setBody(e.target.value)} required={isDebate} />
            </Field>
            {error && <p className="forum-error" role="alert">{error}</p>}
            <div className="forum-actions">
              <button className="btn" type="submit" disabled={busy || s.mode === 'connecting'}>{busy ? 'Posting…' : 'Post'}</button>
              <a className="btn btn-quiet" href={story ? href.story(story.id) : href.forum}>Cancel</a>
            </div>
          </form>
        )}
    </>
  );
}

/** Choose a narrative by typing part of its title. */
function StoryPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [q, setQ] = useState('');
  const chosen = value ? getStory(value) : undefined;
  if (chosen) {
    return (
      <span className="picked">
        <a href={href.story(chosen.id)}>{chosen.title}</a>
        <button type="button" className="linkbtn" onClick={() => onChange('')}>Change</button>
      </span>
    );
  }
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = words.length
    ? allStories.filter((st) => words.every((w) => `${st.title} ${seasonLabel(seasonOf(st))}`.toLowerCase().includes(w))).slice(-12).reverse()
    : [];
  return (
    <span className="storypicker">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a team, player or year" />
      {hits.length > 0 && (
        <span className="storypicker-list" role="listbox">
          {hits.map((st) => (
            <button key={st.id} type="button" role="option" aria-selected={false} onClick={() => onChange(st.id)}>
              {st.title} <span className="muted">{seasonLabel(seasonOf(st))}</span>
            </button>
          ))}
        </span>
      )}
    </span>
  );
}

/* ── One thread ────────────────────────────────────────────────────── */

export function ForumThreadPage({ id }: { id: string }) {
  const s = useForum();
  const t = s.threads.find((x) => x.id === id);
  if (!t) {
    return (
      <>
        <Crumbs items={[['Forum', href.forum], ['Thread']]} />
        {s.loading ? <p className="note">Loading…</p> : <Empty>This thread isn't here. It may have been removed. <a href={href.forum}>Back to the forum</a>.</Empty>}
      </>
    );
  }
  const story = t.storyId ? getStory(t.storyId) : undefined;
  const notion = story ? notionFor(story) : undefined;
  const replies = s.replies.filter((r) => r.threadId === id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const tally = stanceTally(replies);
  const remove = async () => {
    await forum.removeThread(t.id);
    location.hash = href.forum.slice(1);
  };
  return (
    <>
      <Crumbs items={[['Forum', href.forum], [t.kind === 'debate' ? 'Debates' : 'Suggestions', href.forumTab(t.kind === 'debate' ? 'debates' : 'suggestions')], [t.title]]} />
      <PageHead eyebrow={t.kind === 'debate' ? 'Debate' : 'Suggested narrative'} title={t.title}>
        <p className="note">Posted by {authorName(s, t)} on {when(t.createdAt)}</p>
      </PageHead>
      <ModeNote s={s} />
      {story && <NotionBox story={story} />}
      {story && !notion && <p className="note">About <a href={href.story(story.id)}>{story.title}</a></p>}
      {t.kind === 'suggestion' && (
        <dl className="facts">
          <div><dt>Status</dt><dd><StatusTag status={t.status} /></dd></div>
          {t.season !== undefined && <div><dt>Season</dt><dd><a href={href.season(t.season)}>{seasonLabel(t.season)}</a></dd></div>}
          {t.expected && <div><dt>Expected then</dt><dd>{t.expected}</dd></div>}
          {t.happened && <div><dt>What happened</dt><dd>{t.happened}</dd></div>}
          {safeLink(t.link) && <div><dt>Source</dt><dd><a href={safeLink(t.link)} target="_blank" rel="noopener noreferrer nofollow">{new URL(safeLink(t.link)!).hostname.replace(/^www\./, '')}</a></dd></div>}
        </dl>
      )}
      {t.body && <div className="post-body"><Body text={t.body} /></div>}
      {(s.viewer?.isModerator || canRemove(s, t)) && (
        <div className="forum-actions">
          {t.kind === 'suggestion' && s.viewer?.isModerator && (Object.keys(STATUS) as SuggestionStatus[]).filter((st) => st !== (t.status ?? 'new')).map((st) => (
            <button key={st} type="button" className="btn btn-quiet" onClick={() => forum.setStatus(t.id, st)}>Mark {STATUS[st].toLowerCase()}</button>
          ))}
          {canRemove(s, t) && <RemoveButton label="Remove thread" onConfirm={remove} />}
        </div>
      )}

      <Section title="Replies" count={replies.length}
        aside={notion && (tally.agree || tally.disagree) ? <span className="note">{tally.agree} agree with “{NOTION_VERDICTS[notion[2]]}” · {tally.disagree} disagree</span> : undefined}>
        {replies.length
          ? <ol className="replies">{replies.map((r) => <ReplyItem key={r.id} r={r} s={s} />)}</ol>
          : <Empty>No replies yet.</Empty>}
      </Section>
      <ReplyForm s={s} thread={t} hasVerdict={!!notion} verdict={notion?.[2]} />
    </>
  );
}

function RemoveButton({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  // Two clicks instead of a browser dialog, which hosted previews block.
  const [sure, setSure] = useState(false);
  return sure
    ? <button type="button" className="btn btn-danger" onClick={onConfirm}>Yes, remove</button>
    : <button type="button" className="btn btn-quiet" onClick={() => setSure(true)}>{label}</button>;
}

function ReplyItem({ r, s }: { r: Reply; s: ForumState }) {
  return (
    <li className="reply">
      <div className="reply-head">
        <strong>{authorName(s, r)}</strong>
        <span className="note">{when(r.createdAt)}</span>
        {r.stance && <span className={`stance stance-${r.stance}`}>{r.stance === 'agree' ? 'Agrees with the verdict' : 'Disagrees with the verdict'}</span>}
        {canRemove(s, r) && <span className="reply-tools"><RemoveButton label="Remove" onConfirm={() => forum.removeReply(r.id)} /></span>}
      </div>
      <div className="post-body"><Body text={r.body} /></div>
    </li>
  );
}

function ReplyForm({ s, thread, hasVerdict, verdict }: { s: ForumState; thread: Thread; hasVerdict: boolean; verdict?: Parameters<typeof VerdictTag>[0]['verdict'] }) {
  const [name, setName] = useState(savedName);
  const [body, setBody] = useState('');
  const [stance, setStance] = useState<Stance | ''>('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (s.mode !== 'connecting' && !s.viewer?.canPost) return <p className="note">You can read the forum but not reply from this view.</p>;
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const b = clean(body, LIMITS.body);
    if (!b) return setError('Write something first.');
    const authorName = s.mode === 'local' ? clean(name, LIMITS.name) || undefined : undefined;
    if (authorName) saveName(authorName);
    setBusy(true);
    setError('');
    try {
      await forum.addReply({ threadId: thread.id, body: b, stance: stance || undefined, authorName });
      setBody('');
      setStance('');
    } catch {
      setError("That didn't save. Try again in a moment.");
    }
    setBusy(false);
  };
  return (
    <form className="forum-form" onSubmit={submit}>
      <h3>Reply</h3>
      <NameField s={s} value={name} onChange={setName} />
      {hasVerdict && verdict && (
        <div className="field">
          <span className="field-label">The verdict on file is <VerdictTag verdict={verdict} /></span>
          <div className="toggle" role="group" aria-label="Your view of the verdict">
            <button type="button" aria-pressed={stance === ''} onClick={() => setStance('')}>No view</button>
            <button type="button" aria-pressed={stance === 'agree'} onClick={() => setStance('agree')}>I agree</button>
            <button type="button" aria-pressed={stance === 'disagree'} onClick={() => setStance('disagree')}>I disagree</button>
          </div>
        </div>
      )}
      <textarea rows={4} aria-label="Your reply" value={body} maxLength={LIMITS.body} onChange={(e) => setBody(e.target.value)} />
      {error && <p className="forum-error" role="alert">{error}</p>}
      <div className="forum-actions">
        <button className="btn" type="submit" disabled={busy || s.mode === 'connecting'}>{busy ? 'Posting…' : 'Post reply'}</button>
      </div>
    </form>
  );
}

/* ── On a narrative's page ─────────────────────────────────────────── */

export function StoryDebates({ story }: { story: Story }) {
  const s = useForum();
  const list = s.threads.filter((t) => t.storyId === story.id).sort((a, b) => lastActivity(b, s.replies).localeCompare(lastActivity(a, s.replies)));
  const notion = notionFor(story);
  return (
    <Section title="Debate" count={list.length || undefined}
      aside={<a className="more" href={href.forumDebate(story.id)}>Start a debate →</a>}>
      {list.length
        ? (
          <ul className="headlines">
            {list.map((t) => {
              const n = s.replies.filter((r) => r.threadId === t.id).length;
              return <li key={t.id}><a href={href.forumThread(t.id)}>{t.title}</a> <span className="note">{n} {n === 1 ? 'reply' : 'replies'}</span></li>;
            })}
          </ul>
        )
        : <p className="section-lede">{notion ? `Think “${NOTION_VERDICTS[notion[2]].toLowerCase()}” is the wrong verdict? Make the case.` : 'Nobody has debated this one yet.'}</p>}
    </Section>
  );
}
