/*
 * How picks were seen on draft night, paraphrased from sourced narratives
 * (each entry names the story it comes from). Only add a take that a source
 * states; never one from hindsight or memory.
 */

export type DraftVerdict = 'consensus' | 'favored' | 'doubted' | 'project' | 'slid' | 'modest';
/** Player (as Basketball Reference spells it), verdict, short note, story id. */
export type DraftTake = [player: string, verdict: DraftVerdict, note: string, story: string];

export const VERDICTS: Record<DraftVerdict, string> = {
  consensus: 'Consensus pick',
  favored: 'Favored',
  doubted: 'Doubted',
  project: 'Seen as a project',
  slid: 'Slid',
  modest: 'Modest hopes',
};

export const draftTakes: Record<number, DraftTake[]> = {
  1980: [
    ["Joe Barry Carroll", "favored", "Golden State gave up Robert Parish and the No. 3 pick to get him, seeing a center with more upside.", "warriors-trade-parish-and-mchale-pick"],
  ],
  1986: [
    ["Len Bias", "favored", "Expected to keep Boston's dynasty going through the '90s, and partly expected to be Michael Jordan's rival.", "len-bias-death"],
  ],
  1996: [
    ["Stephon Marbury", "favored", "The player Minnesota really wanted; it drafted Ray Allen and traded him to get Marbury.", "wolves-trade-allen-for-marbury"],
    ["Kobe Bryant", "project", "A 17-year-old high schooler; Jerry West traded his starting center for Bryant's raw potential.", "lakers-trade-divac-for-kobe"],
  ],
  1998: [
    ["Dirk Nowitzki", "project", "A skinny German teenager; Milwaukee wanted a more physical big, and Dallas's trade was called a leap of faith.", "mavs-land-dirk-and-nash"],
  ],
  2001: [
    ["Tony Parker", "slid", "European point guards weren't trusted; Boston backed off at the last moment as too risky, and he fell to 28.", "parker-falls-to-28"],
    ["Kwame Brown", "project", "A 19-year-old high schooler Jordan took for his enormous potential.", "high-schoolers-go-first-2001"],
    ["Pau Gasol", "favored", "His value rose sharply in the days before the draft.", "high-schoolers-go-first-2001"],
  ],
  2003: [
    ["LeBron James", "consensus", "The most hyped high school player ever.", "lebron-drafted"],
    ["Dwyane Wade", "doubted", "Pat Riley wasn't sold on him and wanted a point guard or a center.", "heat-draft-wade"],
  ],
  2006: [
    ["Brandon Roy", "doubted", "Had a documented knee issue; Minnesota traded him on draft night for Randy Foye.", "wolves-trade-brandon-roy"],
    ["Randy Foye", "favored", "Seen at the time as the safer, more popular pick than Brandon Roy.", "wolves-trade-brandon-roy"],
  ],
  2007: [
    ["Kevin Durant", "doubted", "Debated against Greg Oden for No. 1; people asked whether he was too skinny for the NBA.", "sonics-draft-durant-trade-allen"],
  ],
  2008: [
    ["Russell Westbrook", "doubted", "Projected to go later, and Sam Presti was criticized for taking a defense-first, off-ball guard.", "presti-drafts-westbrook-harden"],
  ],
  2009: [
    ["Blake Griffin", "consensus", "Seen as a magic bullet for the Clippers.", "clippers-draft-blake-griffin"],
    ["James Harden", "doubted", "Talk that he was too slow.", "presti-drafts-westbrook-harden"],
    ["Ricky Rubio", "favored", "Looked at points like the best prospect in the draft.", "wolves-pass-on-curry"],
    ["Hasheem Thabeet", "doubted", "Questions about his offense; he still struggled to catch and shoot.", "thabeet-goes-second-2009"],
  ],
  2010: [
    ["Paul George", "project", "A raw, little-known forward; most expected a long-term project.", "pacers-draft-paul-george"],
  ],
  2011: [
    ["Kyrie Irving", "consensus", "Half of the consensus top two.", "wolves-draft-johnson-williams"],
    ["Derrick Williams", "consensus", "Half of the consensus top two; taking him second was what any team would do.", "wolves-draft-johnson-williams"],
    ["Kawhi Leonard", "modest", "Framed as a fix for the Spurs' wing rotation, not a future star.", "spurs-trade-for-kawhi"],
  ],
  2013: [
    ["Trey Burke", "favored", "Utah's big move: it traded up from 14 to 9 to get him.", "jazz-draft-burke-and-gobert"],
    ["Kelly Olynyk", "favored", "Boston traded up for him, and a Celtics blog asked why he couldn't be the next Dirk.", "celtics-2014-rebuild"],
    ["Giannis Antetokounmpo", "project", "An 18-year-old from Greece, raw and unproven.", "bucks-draft-giannis"],
    ["Anthony Bennett", "doubted", "A shock No. 1, ranked lower by the consensus; most mock drafts had Nerlens Noel first.", "cavs-shock-with-bennett-2013"],
    ["Nerlens Noel", "slid", "Topped most mock drafts and went sixth.", "cavs-shock-with-bennett-2013"],
  ],
  2014: [
    ["Andrew Wiggins", "consensus", "The No. 1 pick, hyped as Kobe's protégé.", "kevin-love-trade"],
    ["Joel Embiid", "slid", "Might have been the top prize before a foot fracture just before the draft.", "wiggins-parker-embiid-2014"],
    ["Jabari Parker", "favored", "Some saw him as more NBA-ready than Wiggins.", "wiggins-parker-embiid-2014"],
  ],
  2015: [
    ["Kristaps Porziņģis", "doubted", "Booed by Knicks fans; Phil Jackson called him a great risk.", "knicks-fans-boo-porzingis-2015"],
  ],
  2016: [
    ["Ben Simmons", "consensus", "Half of a two-player draft.", "two-player-draft-2016"],
    ["Brandon Ingram", "consensus", "Half of a two-player draft.", "two-player-draft-2016"],
  ],
  2017: [
    ["Markelle Fultz", "consensus", "Seen as the clear-cut best prospect; Philadelphia traded up for him.", "sixers-trade-up-for-fultz-2017"],
  ],
  2018: [
    ["Deandre Ayton", "consensus", "The consensus No. 1 pick.", "mavs-trade-for-luka"],
    ["Luka Dončić", "doubted", "Many doubted him because he hadn't played college basketball; even Dirk wondered if he was quick enough.", "mavs-trade-for-luka"],
    ["Marvin Bagley III", "favored", "The safe pick; SI warned Sacramento might rue passing on Doncic.", "bagley-over-doncic-2018"],
    ["Jaren Jackson Jr.", "favored", "Many thought he might be one of the three best players in the class.", "bagley-over-doncic-2018"],
  ],
  2020: [
    ["Anthony Edwards", "doubted", "His commitment was questioned after he said he'd give up basketball for the NFL; people called him another dud.", "wolves-draft-anthony-edwards"],
  ],
  2022: [
    ["Jabari Smith Jr.", "slid", "The long-expected No. 1 until draft day; went third.", "magic-switch-to-banchero-2022"],
  ],
  2023: [
    ["Victor Wembanyama", "consensus", "A unicorn who could one day break basketball.", "spurs-win-wembanyama-lottery"],
    ["Brandon Miller", "favored", "Charlotte's pick over Scoot Henderson, seen as a better fit and a much better shooter.", "hornets-take-miller-over-scoot-2023"],
    ["Scoot Henderson", "slid", "Debated for weeks as the No. 2 pick; went third.", "hornets-take-miller-over-scoot-2023"],
  ],
  2025: [
    ["Ace Bailey", "slid", "Projected as a top-three talent before draft-night dynamics pushed him to fifth.", "jazz-tank-for-ace-bailey"],
  ],
};
