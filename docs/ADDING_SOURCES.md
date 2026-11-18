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

## For Claude: what to do with a source

1. **Save the transcript** to `sources/transcripts/<source-id>.md` with the title, link and published date at the top and timestamps kept in `[M:SS]` form. Never paraphrase into this file; it is the record of what the source says. If no transcript was given and you cannot fetch one, ask gam for it rather than working from memory of the video.
2. **Add the source** to `src/data/sources.ts`: id (kebab-case, short and descriptive), kind, title, outlet, url, published, added (today), a one or two sentence `about`, and `transcript`.
3. **Pull out data points.** Read the transcript for claims about specific events, dates, players and teams. For each:
   - If an existing narrative in `src/data/stories.ts` covers it and the source agrees, add a citation: `sources: [{ source: '<id>', at: '41:07', quote: '<short exact quote>' }]`.
   - If the source contradicts an existing narrative (a different date, score or detail), do not silently change it. List the conflict in the PR description for gam to decide.
   - If it is new, add a narrative citing the source. Date it only as precisely as the source supports (`day`, `month` or `year`). Add any new players or teams to `src/data/people.ts`.
   - Skip opinion and speculation unless it is itself the story (a famous quote, a feud).
4. **Quotes are exact** and short (one or two sentences), copied from the transcript at the cited timestamp.
5. **Check:** `npm test` (it verifies every citation points at a real source, timestamps are well formed and transcripts exist) and `npm run build`.
6. **Open a PR** listing: the source, narratives added, narratives that gained a citation, and any conflicts or claims you were unsure of.

## Data shape

See `Source` and `Citation` in `src/data/types.ts`. A narrative can cite several sources, and a source can back many narratives.
