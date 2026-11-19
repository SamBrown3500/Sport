# Adding videos and podcasts as sources

Every narrative should point back to something real. Sources are the videos, podcasts, articles and books that narratives come from. Each one gets a page on the site (`#sources`), and every narrative drawn from it shows a **Sourced** badge and a citation that links to the exact moment.

## For gam: how to hand over a source

Post in the project chat:

1. **The link** (YouTube, Spotify, Apple Podcasts, a show's website, an article).
2. **The transcript, if you can grab it.** This is the part that makes it work, because Claude reads the transcript rather than watching the video.
   - YouTube: under the video, click **...more**, then **Show transcript**. Select all the text in the panel and paste it.
   - Apple Podcasts: open the episode and tap the transcript (speech bubble) button, then copy.
   - Spotify: many episodes show a transcript below the player.
   - Or upload a transcript file, or the notes you took while listening.
3. **Optional:** what you care about in it ("the part about the 1986 Celtics, around minute 40").

Claude turns that into a pull request you can look over before anything goes live.

**Once the transcript service is set up, just the link is enough.** Claude fetches the transcript itself with `npm run transcript -- <source-id> <url>` (see below), so step 2 becomes optional.

### Transcript service (one-time setup)

`scripts/fetch-transcript.mjs` uses [Supadata](https://supadata.ai). It reads existing captions for YouTube, TikTok, Instagram, X and Facebook videos (1 credit each) and transcribes audio with AI when there are none, including direct MP3/M4A podcast links (2 credits per minute). The free plan gives 100 credits a month; paid plans start at $5/month for 300.

1. Sign up at supadata.ai and copy the API key from the dashboard.
2. In the project's cloud environment settings, add the key as a network secret for `api.supadata.ai` (or as the environment variable `SUPADATA_API_KEY`), and allow the domain `api.supadata.ai` under network access.
3. Start a new conversation so the setting takes effect.

### A whole channel

`npm run channel -- <channel-url> --max 50 --prefix <short-name>` saves captions for the channel's newest regular videos to `sources/inbox/`, 50 at a time (about 1 credit per video), skipping any already fetched. Claude then reads each transcript, follows the steps below for the ones with real events in them, and moves those transcripts into `sources/transcripts/`. Videos with no new facts are left in the inbox manifest as read.

## How narratives are written

A narrative tells the story **as it was understood at the time**, not a neutral history of what happened. Lead with the expectations and the debate, then what happened against them:

- Who was supposed to win, and why. Who was the favorite, who was written off.
- Why it went the way it did, in the explanations people gave then.
- For awards, why this player won over the others in the race (the case for each, what swung voters).
- For trades and signings, what people thought each side was doing and who "won" it in the moment.
- What changed in the conversation afterward.

Every one of those claims still needs the source to say it: cite the moment where the expectation or opinion is voiced. Facts (scores, dates, trade terms) can sit in the background, but they aren't the point.

## For Claude: what to do with a source

1. **Get the transcript.** If gam only gave a link, run `npm run transcript -- <source-id> <url>`. If that fails (no key, host blocked, no captions), ask gam to paste the transcript.
   **Save the transcript** to `sources/transcripts/<source-id>.md` with the title, link and published date at the top and timestamps kept in `[M:SS]` form. Never paraphrase into this file; it is the record of what the source says. If no transcript was given and you cannot fetch one, ask gam for it rather than working from memory of the video.
2. **Add the source** to `src/data/sources.ts`: id (kebab-case, short and descriptive), kind, title, outlet, url, published, added (today), a one or two sentence `about`, and `transcript`.
3. **Pull out data points.** Read the transcript for claims about specific events, dates, players and teams. For each:
   - If an existing narrative in `src/data/stories.ts` covers it and the source agrees, add a citation: `sources: [{ source: '<id>', at: '41:07', quote: '<short exact quote>' }]`.
   - If the source contradicts an existing narrative (a different date, score or detail), do not silently change it. List the conflict in the PR description for gam to decide.
   - If it is new, add a narrative citing the source. Date it only as precisely as the source supports (`day`, `month` or `year`). Add any new players or teams to `src/data/people.ts`.
   - Opinion and expectation are the point (see "How narratives are written"): keep what people predicted, debated and believed at the time, and say whose view it is when it is one voice ("Kenny called it a severe underpay"). Skip personal asides that aren't about the story.
4. **Quotes are exact** and short (one or two sentences), copied from the transcript at the cited timestamp.
5. **Check:** `npm test` (it verifies every citation points at a real source, timestamps are well formed and transcripts exist) and `npm run build`.
6. **Open a PR** listing: the source, narratives added, narratives that gained a citation, and any conflicts or claims you were unsure of.

## Data shape

See `Source` and `Citation` in `src/data/types.ts`. A narrative can cite several sources, and a source can back many narratives.
