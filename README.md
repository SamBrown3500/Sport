# hardwoodnarratives.com

A calendar of NBA history. The site name lives in `src/site.ts`; change it there and the header, footer and tab title follow. Browse by decade, year, month or day back to 1900, or search any date, player, team or story and every related narrative comes up in date order.

## Milestone 1 (this code)

- Calendar pages: decade, year, month (calendar grid), day, and On this day
- Universal search: dates in many formats ("1962", "1960s", "March 2, 1962", "3/2/1962", "March 2"), players, teams (including old names like "Seattle SuperSonics"), story nicknames ("The Decision") and themes ("free agency")
- Story, player timeline and team timeline pages
- About 60 starter narratives in `src/data/stories.ts`. These are drafts: each needs a source checked and cited before launch.

## Run it

```sh
npm install
npm run dev      # local dev server
npm test         # search and data checks
npm run build    # writes a single self-contained dist/index.html
```

## Adding a narrative

Add an entry to `src/data/stories.ts`. Give it a date at the precision you actually know (`1962-03-02`, `1962-03` or `1962`), link players and teams by id from `src/data/people.ts`, and add `aliases` for nicknames people will search. `npm test` checks every link and date.

## Sources

Videos, podcasts, articles and books live in `src/data/sources.ts`, with transcripts in `sources/transcripts/`. Narratives cite them with a timestamp and a short quote, and the site shows a Sources library, a page per source (with the video embedded for YouTube) and a citation list on each narrative. See [docs/ADDING_SOURCES.md](docs/ADDING_SOURCES.md).

## What comes next

See the plan doc. Milestone 2 adds season stats to player and team pages, which is when the data moves from these files into a database and the app moves to Next.js with real URLs (`/1962/03/02`). The data layer in `src/lib/db.ts` is the only file pages read from, so that swap stays contained.
