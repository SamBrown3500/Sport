/*
 * Upsets shown on the home page scoreboard: who was expected to win a series
 * and what actually happened. Each one links to the narrative that tells it.
 * Records, seeds and series results are from basketball-reference.com.
 */
export interface ScoreboardTeam {
  name: string;
  /** Seed or conference, as shown under the name. */
  seed: string;
  /** Regular-season record. */
  record: string;
  /** Games won in the series. */
  wins: number;
}

export interface ScoreboardGame {
  story: string;
  year: number;
  round: string;
  favorite: ScoreboardTeam;
  underdog: ScoreboardTeam;
  /** The pick at the time, as a city. */
  pick: string;
  /** What happened, e.g. "Golden State 4-2". */
  result: string;
}

export const scoreboard: ScoreboardGame[] = [
  {
    story: 'we-believe-upset-mavs', year: 2007, round: 'West · Round 1',
    favorite: { name: 'Mavericks', seed: '#1 seed', record: '67-15', wins: 2 },
    underdog: { name: 'Warriors', seed: '#8 seed', record: '42-40', wins: 4 },
    pick: 'Dallas', result: 'Golden State 4-2',
  },
  {
    story: 'pistons-win-2004-title', year: 2004, round: 'NBA Finals',
    favorite: { name: 'Lakers', seed: 'West', record: '56-26', wins: 1 },
    underdog: { name: 'Pistons', seed: 'East', record: '54-28', wins: 4 },
    pick: 'Los Angeles', result: 'Detroit 4-1',
  },
  {
    story: 'magic-upset-cavs-2009', year: 2009, round: 'East Finals',
    favorite: { name: 'Cavaliers', seed: '#1 seed', record: '66-16', wins: 2 },
    underdog: { name: 'Magic', seed: '#3 seed', record: '59-23', wins: 4 },
    pick: 'Cleveland', result: 'Orlando 4-2',
  },
  {
    story: 'blazers-win-1977-title', year: 1977, round: 'NBA Finals',
    favorite: { name: '76ers', seed: 'East', record: '50-32', wins: 2 },
    underdog: { name: 'Trail Blazers', seed: 'West', record: '49-33', wins: 4 },
    pick: 'Philadelphia', result: 'Portland 4-2',
  },
];
