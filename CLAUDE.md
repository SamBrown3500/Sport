# sportsnarratives.com

Calendar of NFL and NBA narratives. Vite + React + TypeScript, data in `src/data/*.ts`, all page reads go through `src/lib/db.ts`.

- `npm test` checks data integrity (ids, links, dates, citations); `npm run build` type-checks and builds.
- When gam gives you a video, podcast, article or transcript to use as a source, follow `docs/ADDING_SOURCES.md` exactly. Cite the transcript with timestamps and exact quotes; never invent a quote, timestamp or fact the source doesn't contain, and flag conflicts with existing narratives instead of overwriting them.
- gam is not a developer. Explain results in plain language.
