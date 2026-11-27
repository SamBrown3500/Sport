# Adding videos and podcasts as sources

Every narrative should point back to something real. Sources are the videos, podcasts, articles and books that narratives come from. Each one gets a page on the site (`#sources`), and every narrative drawn from it shows a **Sourced** badge and lists its sources at the bottom of its page.

**gam's rule (2026-11-20): no timestamps.** Don't add `at` to citations and don't show times on the site. A narrative page cites each source once, at the bottom. Keep the exact quotes in the data (they are how we check every claim), but they are not displayed.

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

A narrative tells the story **as it was understood at the time**, not a neutral history of what happened. Every narrative is built on one contrast: **the consensus at the time versus what actually happened** (gam, 2026-11-19). Open with the consensus, then what happened, then the gap between them:

- Who was supposed to win, and why. Who was the favorite, who was written off.
- Playoff series: what analysts and predictions said the series would look like (who in how many, a mismatch, a coin flip), then how it actually went.
- Draft picks: whether the pick was seen at the time as a reach, a project, a bust waiting to happen, a safe pick or a steal, then how the player turned out.
- Trades and signings: who people thought won the deal in the moment, then how it aged.
- Why it went the way it did, in the explanations people gave then.
- For awards, why this player won over the others in the race (the case for each, what swung voters).
- For trades and signings, what people thought each side was doing and who "won" it in the moment.
- What changed in the conversation afterward.

Every one of those claims still needs the source to say it: cite the moment where the expectation or opinion is voiced. Facts (scores, dates, trade terms) can sit in the background, but they aren't the point.

### Facts come from Basketball Reference

For NBA facts (scores, series results and lengths, records, seeds, awards and vote placings, draft picks, stats, dates), [basketball-reference.com](https://www.basketball-reference.com) is the fact source (gam, 2026-11-23). Videos, podcasts and articles supply the opinions and expectations; Basketball Reference supplies the numbers. Before adding a narrative, check every fact in it there. When a source gets a fact wrong, write the Basketball Reference version without asking (keep the source's exact quote in the data as it was said), and note the fix in the PR. Avoid "franchise-best", "league-worst" or "first since" claims unless Basketball Reference's standings confirm them. The cloud container can't reach the site, so fetch it through the built-in browser on gam's computer.

## For Claude: what to do with a source

1. **Get the transcript.** If gam only gave a link, run `npm run transcript -- <source-id> <url>`. If that fails (no key, host blocked, no captions), ask gam to paste the transcript.
   **Save the transcript** to `sources/transcripts/<source-id>.md` with the title, link and published date at the top and timestamps kept in `[M:SS]` form. Never paraphrase into this file; it is the record of what the source says. If no transcript was given and you cannot fetch one, ask gam for it rather than working from memory of the video.
2. **Add the source** to `src/data/sources.ts`: id (kebab-case, short and descriptive), kind, title, outlet, url, published, added (today), a one or two sentence `about`, and `transcript`.
3. **Pull out data points.** Read the transcript for claims about specific events, dates, players and teams. For each:
   - If an existing narrative in `src/data/stories.ts` covers it and the source agrees, add a citation: `sources: [{ source: '<id>', at: '41:07', quote: '<short exact quote>' }]`.
   - If the source contradicts an existing narrative (a different date, score or detail), check Basketball Reference: for a plain fact, use its version; for anything else, do not silently change it and list the conflict in the PR description for gam to decide.
   - If it is new, add a narrative citing the source. Date it only as precisely as the source supports (`day`, `month` or `year`). Add any new players or teams to `src/data/people.ts`.
   - Opinion and expectation are the point (see "How narratives are written"): keep what people predicted, debated and believed at the time, and say whose view it is when it is one voice ("Kenny called it a severe underpay"). Skip personal asides that aren't about the story.
   - **NBA narratives get season-page categories** (gam, 2026-11-21). Every NBA season has a page (`#nba-season-2014` is 2014-15) with four sections, and each is also a browsable category: `mvp-race` (the award race and why one player won over another), `draft-drama` (lotteries, draft nights, picks seen as reaches, busts or steals), `contenders` (the favorites and how their runs went against expectations) and `surprises` (upsets, runs nobody predicted, collapses of favorites, shock moves). Add `categories: [...]` to the story's options, main one first; a story can sit in more than one. Leave it off if none fits. The season comes from the date (July to June; a Draft Drama story listed first and dated April to June goes to the draft class's first season). Set `season: <start year>` only if that puts it in the wrong one.
   - **Season pages show overviews, not the individual narratives** (gam, 2026-11-22). Each season section reads as one short overview of the whole race or storyline, kept in `src/data/seasonOverviews.ts` under `'<start year>:<category>'`. When a narrative lands in a section, update that section's overview (or write one if the section was empty) so it covers the new story, using only what the section's narratives say. `npm test` fails if a filled section has no overview. Team, player and story pages keep the full individual narratives.
   - **Add a preconceived notion** (gam, 2026-11-26). If the narrative states what people expected at the time, add one line to `src/data/notions.ts` under its story id: `[expected, happened, verdict]`, where verdict is `held`, `busted`, `mixed` or `open` (season still being played). Paraphrase only the narrative and its sources, one sentence each. These fill the "Preconceived notions" sections on team, player, season and story pages and the `#notions` page, and mark the year-by-year tables. Leave it out when the narrative states no expectation.
4. **Quotes are exact** and short (one or two sentences), copied word for word from the transcript. No timestamps.
5. **Check:** `npm test` (it verifies every citation points at a real source, and transcripts exist) and `npm run build`.
6. **Open a PR** listing: the source, narratives added, narratives that gained a citation, and any conflicts or claims you were unsure of.

## Trades and free agency (moves)

Big trades, free agency signings and draft-night deals live in `src/data/moves.ts`, separate from the narratives, and show on the Trades page (`#moves`), each move's page (`#move-<id>`), the free agency summer pages (`#offseason-<year>`), and the Moves sections of team, player, season and source pages.

1. **Sources are articles written that week** (grades, instant reactions), never retrospectives. Add each to `src/data/moveSources.ts` as an `article`.
2. **`then`** is the consensus at the time: who was supposed to win the deal, the grades, the doubts. **`happened`** is what actually happened. No outlet names in either; sources go at the bottom.
3. **Each team gets a side:** what it got, `graded` (every letter grade the move got at the time, one per grader, empty if nobody graded it), and `hindsight` (our grade from what happened) with a one-line `why`. For a signing, the team the player left is a side too ("Lost X").
4. **`ripples`** are season-by-season results that came from the move: records, series, awards, what the picks became. Every one comes from Basketball Reference (`bbref.ts`, `draftClasses.ts`, or the site).
5. **Quotes** on `sources` are exact and short, at least two articles per move, no timestamps. Link related narratives with `stories`.
6. A move that happens June to October appears on that summer's page; give the summer a paragraph in `offseasonOverviews` (the test checks).
7. A "big miss" is computed: a team's hindsight grade more than a full letter from its average grade at the time.

## Data shape

See `Source` and `Citation` in `src/data/types.ts`. A narrative can cite several sources, and a source can back many narratives.
