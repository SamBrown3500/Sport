# sportsnarratives.com

Calendar of NFL and NBA narratives. Vite + React + TypeScript, data in `src/data/*.ts`, all page reads go through `src/lib/db.ts`.

- `npm test` checks data integrity (ids, links, dates, citations); `npm run build` type-checks and builds.
- When gam gives you a video, podcast, article or transcript to use as a source, follow `docs/ADDING_SOURCES.md` exactly. Back each narrative with exact quotes from the transcript (kept in the data, not shown) and no timestamps: the site lists each source once at the bottom of the narrative page; never invent a quote, timestamp or fact the source doesn't contain, and flag conflicts with existing narratives instead of overwriting them.
- NBA facts (scores, series, records, seeds, awards, draft picks, stats, dates) come from basketball-reference.com; check each one there and use its version when a source disagrees. See "Facts come from Basketball Reference" in `docs/ADDING_SOURCES.md`.
- Season pages also show Basketball Reference tables under each section (top-3 MVP candidate cards from `src/data/mvpRace.ts` with cases written from facts by `src/lib/mvp.ts`, MVP voting, draft and Rookie of the Year voting, standings and playoff series, upsets and win swings) from `src/data/bbref.ts` via `src/lib/bbref.ts` and `src/seasonFacts.tsx`. The data is a snapshot pulled through the built-in browser; refresh it from Basketball Reference, never by hand.
- Every narrative is built on the consensus at the time versus what actually happened: favorites and doubts, how analysts expected playoff series to go, which draft picks were seen as reaches, busts or steals, award debates, who won a trade in the moment. Open with the consensus, then what happened. See "How narratives are written" in `docs/ADDING_SOURCES.md`.
- NBA narratives carry `categories` (MVP Race, Draft Drama, Contenders, Surprises) that fill each season page. Season pages show one overview per section from `src/data/seasonOverviews.ts` (update it when adding a categorized narrative); see `src/lib/seasons.ts` and step 3 of `docs/ADDING_SOURCES.md`.
- gam is not a developer. Explain results in plain language.
