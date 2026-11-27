import { useEffect, useState } from 'react';

/*
 * The forum (gam, 2026-11-27): visitors debate narratives and suggest new
 * ones. Pages only talk to a ForumStore, so the storage can change without
 * the pages changing:
 *
 *   shared  the hosted preview on claude.ai, where posts are saved for
 *           everyone who opens the preview (the page's own database).
 *   local   anywhere else, for now: posts are saved in this browser only,
 *           so the forum can be tried before the site has a server.
 *
 * When the site is deployed to its domain, add a third store here that
 * calls the site's API (same methods), and pick it in createStore().
 */

export type ThreadKind = 'debate' | 'suggestion';
export type SuggestionStatus = 'new' | 'added' | 'declined';
export type Stance = 'agree' | 'disagree';

export interface Thread {
  id: string;
  kind: ThreadKind;
  title: string;
  body: string;
  /** The narrative a debate is about. */
  storyId?: string;
  /** Suggestions: the season it belongs to (2014 = 2014-15), the consensus then, what happened, and a source link. */
  season?: number;
  expected?: string;
  happened?: string;
  link?: string;
  status?: SuggestionStatus;
  authorId: string;
  /** Only in this-browser mode, where there are no accounts. */
  authorName?: string;
  createdAt: string;
}

export interface Reply {
  id: string;
  threadId: string;
  body: string;
  /** On a debate about a prediction: does the poster agree with the verdict on file? */
  stance?: Stance;
  authorId: string;
  authorName?: string;
  createdAt: string;
}

export interface Viewer {
  id: string;
  /** False when the viewer can only read (for example a view-only share). */
  canPost: boolean;
  /** Can mark suggestions added or declined, and remove any post. */
  isModerator: boolean;
}

export type ForumMode = 'connecting' | 'shared' | 'local';

export interface ForumState {
  mode: ForumMode;
  viewer: Viewer | null;
  threads: Thread[];
  replies: Reply[];
  loading: boolean;
  /** Something the viewer should know, such as "posts can't be reached right now". */
  notice?: string;
  /** Display names by author id (shared mode). */
  names: Record<string, string>;
}

export const LIMITS = { title: 120, body: 4000, field: 600, link: 500, name: 40 };

export type NewThread = Omit<Thread, 'id' | 'authorId' | 'createdAt' | 'status'>;
export type NewReply = Omit<Reply, 'id' | 'authorId' | 'createdAt'>;

interface Store {
  addThread(t: NewThread): Promise<string>;
  addReply(r: NewReply): Promise<void>;
  setStatus(id: string, status: SuggestionStatus): Promise<void>;
  removeThread(id: string): Promise<void>;
  removeReply(id: string): Promise<void>;
}

/** Lowercase letters and digits only, so ids fit in the site's links. */
export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const clean = (s: string | undefined, max: number) => (s ?? '').replace(/\r\n?/g, '\n').trim().slice(0, max);

/** Only https links are shown as links. */
export const safeLink = (s?: string) => (s && /^https:\/\/[^\s<>"']+$/i.test(s.trim()) ? s.trim() : undefined);

/** Newest activity first: a thread's own date or its latest reply. */
export function lastActivity(t: Thread, replies: Reply[]): string {
  let last = t.createdAt;
  for (const r of replies) if (r.threadId === t.id && r.createdAt > last) last = r.createdAt;
  return last;
}

export function stanceTally(replies: Reply[]): Record<Stance, number> {
  const c = { agree: 0, disagree: 0 };
  for (const r of replies) if (r.stance) c[r.stance]++;
  return c;
}

/* ── State shared by every forum component ─────────────────────────── */

let state: ForumState = { mode: 'connecting', viewer: null, threads: [], replies: [], loading: true, names: {} };
const listeners = new Set<(s: ForumState) => void>();
const setState = (patch: Partial<ForumState>) => {
  state = { ...state, ...patch };
  for (const l of listeners) l(state);
};

let store: Store | null = null;
let started = false;

function start() {
  if (started) return;
  started = true;
  const claude = (globalThis as { claude?: { use?: (name: string) => Promise<unknown> } }).claude;
  if (typeof claude?.use === 'function') startShared(claude.use.bind(claude)).catch(() => startLocal('The shared forum could not be reached, so posts are saved in this browser only.'));
  else startLocal();
}

/** Live forum state for a component. */
export function useForum(): ForumState {
  const [s, set] = useState(state);
  useEffect(() => {
    start();
    listeners.add(set);
    set(state);
    return () => { listeners.delete(set); };
  }, []);
  return s;
}

function need(): Store {
  if (!store) throw new Error('The forum is still loading.');
  return store;
}
export const forum: Store = {
  addThread: (t) => need().addThread(t),
  addReply: (r) => need().addReply(r),
  setStatus: (id, st) => need().setStatus(id, st),
  removeThread: (id) => need().removeThread(id),
  removeReply: (id) => need().removeReply(id),
};

/* ── This-browser store ────────────────────────────────────────────── */

const LOCAL_KEY = 'hn-forum-v1';
const NAME_KEY = 'hn-forum-name';
const LOCAL_ID = 'local';

export function savedName(): string {
  try { return localStorage.getItem(NAME_KEY) ?? ''; } catch { return ''; }
}
export function saveName(name: string) {
  try { localStorage.setItem(NAME_KEY, name); } catch { /* storage blocked: fine */ }
}

function startLocal(notice?: string) {
  const read = (): { threads: Thread[]; replies: Reply[] } => {
    try {
      const raw = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '{}');
      return { threads: Array.isArray(raw.threads) ? raw.threads : [], replies: Array.isArray(raw.replies) ? raw.replies : [] };
    } catch { return { threads: [], replies: [] }; }
  };
  let data = read();
  const write = () => {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); } catch { /* storage blocked: posts last until the page closes */ }
    setState({ threads: data.threads, replies: data.replies });
  };
  store = {
    async addThread(t) {
      const id = newId();
      data = { ...data, threads: [...data.threads, { ...t, id, authorId: LOCAL_ID, createdAt: new Date().toISOString(), ...(t.kind === 'suggestion' ? { status: 'new' as const } : {}) }] };
      write();
      return id;
    },
    async addReply(r) {
      data = { ...data, replies: [...data.replies, { ...r, id: newId(), authorId: LOCAL_ID, createdAt: new Date().toISOString() }] };
      write();
    },
    async setStatus(id, status) {
      data = { ...data, threads: data.threads.map((t) => (t.id === id ? { ...t, status } : t)) };
      write();
    },
    async removeThread(id) {
      data = { threads: data.threads.filter((t) => t.id !== id), replies: data.replies.filter((r) => r.threadId !== id) };
      write();
    },
    async removeReply(id) {
      data = { ...data, replies: data.replies.filter((r) => r.id !== id) };
      write();
    },
  };
  setState({
    mode: 'local', loading: false, notice,
    viewer: { id: LOCAL_ID, canPost: true, isModerator: true },
    threads: data.threads, replies: data.replies,
  });
}

/* ── Shared store (the hosted preview's database) ──────────────────── */

/* Minimal shapes of the preview's database and viewer APIs that this file uses. */
interface DocSnap { id: string; exists: boolean; data(): Record<string, unknown> | undefined }
interface QuerySnap { docs: DocSnap[]; metadata: { fromCache: boolean } }
interface DocRef { set(d: Record<string, unknown>): Promise<void>; update(d: Record<string, unknown>): Promise<void>; delete(): Promise<void> }
interface CollRef {
  doc(id?: string): DocRef;
  limit(n: number): { onSnapshot(next: (s: QuerySnap) => void, err?: (e: { code: string }) => void): () => void };
}
interface Db { collection(path: string): CollRef }
interface User {
  id(): Promise<string | null>;
  isOwner(): Promise<boolean>;
  canEdit(): Promise<boolean>;
  can(name: string): Promise<boolean | null>;
  profiles(ids: string[]): Promise<Record<string, { name?: string }>>;
}

const str = (v: unknown) => (typeof v === 'string' ? v : undefined);

function toThread(d: DocSnap): Thread | null {
  const x = d.data();
  if (!x || (x.kind !== 'debate' && x.kind !== 'suggestion') || !str(x.title) || !str(x.createdAt)) return null;
  return {
    id: d.id, kind: x.kind, title: clean(str(x.title), LIMITS.title), body: clean(str(x.body), LIMITS.body),
    storyId: str(x.storyId), season: typeof x.season === 'number' ? x.season : undefined,
    expected: str(x.expected), happened: str(x.happened), link: str(x.link),
    status: x.status === 'added' || x.status === 'declined' || x.status === 'new' ? x.status : x.kind === 'suggestion' ? 'new' : undefined,
    authorId: str(x.authorId) ?? '', createdAt: str(x.createdAt)!,
  };
}

function toReply(d: DocSnap): Reply | null {
  const x = d.data();
  if (!x || !str(x.threadId) || !str(x.body) || !str(x.createdAt)) return null;
  return {
    id: d.id, threadId: str(x.threadId)!, body: clean(str(x.body), LIMITS.body),
    stance: x.stance === 'agree' || x.stance === 'disagree' ? x.stance : undefined,
    authorId: str(x.authorId) ?? '', createdAt: str(x.createdAt)!,
  };
}

/** Drop undefined fields: the database stores JSON. */
const json = <T extends object>(o: T) => JSON.parse(JSON.stringify(o)) as Record<string, unknown>;

async function startShared(use: (name: string) => Promise<unknown>) {
  const [db, user] = (await Promise.all([use('db'), use('user')])) as [Db | null, User | null];
  if (!db) { startLocal('This copy of the preview has no shared forum, so posts are saved in this browser only.'); return; }
  const [id, owner, editor, canWrite] = user
    ? await Promise.all([user.id(), user.isOwner(), user.canEdit(), user.can('data.write')])
    : [null, false, false, null];
  const viewer: Viewer = { id: id ?? '', canPost: !!id && canWrite !== false, isModerator: owner || editor };
  const threads = db.collection('threads');
  const replies = db.collection('replies');

  store = {
    async addThread(t) {
      const tid = newId();
      await threads.doc(tid).set(json({ ...t, authorId: viewer.id, createdAt: new Date().toISOString(), ...(t.kind === 'suggestion' ? { status: 'new' } : {}) }));
      return tid;
    },
    async addReply(r) {
      await replies.doc(newId()).set(json({ ...r, authorId: viewer.id, createdAt: new Date().toISOString() }));
    },
    async setStatus(tid, status) { await threads.doc(tid).update({ status }); },
    async removeThread(tid) {
      for (const r of state.replies.filter((x) => x.threadId === tid)) await replies.doc(r.id).delete();
      await threads.doc(tid).delete();
    },
    async removeReply(rid) { await replies.doc(rid).delete(); },
  };
  setState({ mode: 'shared', viewer, loading: true });

  // Say so if the posts haven't arrived in 10 seconds; clear it when they do.
  let timer: ReturnType<typeof setTimeout> | undefined = setTimeout(() => setState({ notice: "Posts can't be reached yet. They'll appear when the connection comes back." }), 10000);
  const settle = (fromCache: boolean) => {
    if (fromCache || !timer) return;
    clearTimeout(timer);
    timer = undefined;
    setState({ loading: false, notice: undefined });
  };
  const fail = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    setState({ loading: false, notice: 'The forum stopped updating. Reload the page to see new posts.' });
  };
  const resolveNames = async (ids: string[]) => {
    const missing = [...new Set(ids)].filter((x) => x && !(x in state.names));
    if (!missing.length || !user) return;
    try {
      const ps = await user.profiles(missing);
      const names = { ...state.names };
      for (const x of missing) names[x] = ps[x]?.name || 'A reader';
      setState({ names });
    } catch { /* names are a nicety */ }
  };
  threads.limit(1000).onSnapshot((snap) => {
    const list = snap.docs.map(toThread).filter((t): t is Thread => !!t);
    setState({ threads: list });
    settle(snap.metadata.fromCache);
    void resolveNames(list.map((t) => t.authorId));
  }, fail);
  replies.limit(1000).onSnapshot((snap) => {
    const list = snap.docs.map(toReply).filter((r): r is Reply => !!r);
    setState({ replies: list });
    void resolveNames(list.map((r) => r.authorId));
  }, fail);
}

/** What to call a post's author. */
export function authorName(s: ForumState, p: { authorId: string; authorName?: string }): string {
  if (s.mode === 'local') return p.authorName || 'You';
  if (s.viewer && p.authorId === s.viewer.id) return 'You';
  return s.names[p.authorId] || 'A reader';
}
