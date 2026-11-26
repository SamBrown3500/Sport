/*
 * Franchises: where each team sits today and every name it has played under,
 * spelled as Basketball Reference spells them in src/data/bbref.ts, so a team
 * page can line up its narratives with its record season by season.
 *
 * A name with a season range belongs to this franchise only in those seasons
 * (by start year). Three names need it: Charlotte Hornets (1988-2001 is today's
 * Pelicans, 2014 on is today's Hornets), Baltimore Bullets (the 1947-1954
 * team folded; the 1963-1972 team is today's Wizards) and Denver Nuggets (the
 * 1949-50 team was a different franchise; today's joined from the ABA in 1976).
 */

export type Conference = 'East' | 'West';
export type Division = 'Atlantic' | 'Central' | 'Southeast' | 'Northwest' | 'Pacific' | 'Southwest';
export type FranchiseName = string | [name: string, from: number, to: number];

export interface Franchise {
  /** Conference and division today; none for a franchise that folded. */
  conference?: Conference;
  division?: Division;
  names: FranchiseName[];
}

export const DIVISIONS: [Conference, Division][] = [
  ['East', 'Atlantic'], ['East', 'Central'], ['East', 'Southeast'],
  ['West', 'Northwest'], ['West', 'Pacific'], ['West', 'Southwest'],
];

export const franchises: Record<string, Franchise> = {
  celtics: { conference: 'East', division: 'Atlantic', names: ['Boston Celtics'] },
  nets: { conference: 'East', division: 'Atlantic', names: ['New York Nets', 'New Jersey Nets', 'Brooklyn Nets'] },
  knicks: { conference: 'East', division: 'Atlantic', names: ['New York Knicks'] },
  sixers: { conference: 'East', division: 'Atlantic', names: ['Syracuse Nationals', 'Philadelphia 76ers'] },
  raptors: { conference: 'East', division: 'Atlantic', names: ['Toronto Raptors'] },
  bulls: { conference: 'East', division: 'Central', names: ['Chicago Bulls'] },
  cavaliers: { conference: 'East', division: 'Central', names: ['Cleveland Cavaliers'] },
  pistons: { conference: 'East', division: 'Central', names: ['Fort Wayne Pistons', 'Detroit Pistons'] },
  pacers: { conference: 'East', division: 'Central', names: ['Indiana Pacers'] },
  bucks: { conference: 'East', division: 'Central', names: ['Milwaukee Bucks'] },
  hawks: { conference: 'East', division: 'Southeast', names: ['Tri-Cities Blackhawks', 'Milwaukee Hawks', 'St. Louis Hawks', 'Atlanta Hawks'] },
  hornets: { conference: 'East', division: 'Southeast', names: ['Charlotte Bobcats', ['Charlotte Hornets', 2014, 9999]] },
  heat: { conference: 'East', division: 'Southeast', names: ['Miami Heat'] },
  magic: { conference: 'East', division: 'Southeast', names: ['Orlando Magic'] },
  wizards: { conference: 'East', division: 'Southeast', names: ['Chicago Packers', 'Chicago Zephyrs', ['Baltimore Bullets', 1963, 1972], 'Capital Bullets', 'Washington Bullets', 'Washington Wizards'] },
  nuggets: { conference: 'West', division: 'Northwest', names: [['Denver Nuggets', 1976, 9999]] },
  timberwolves: { conference: 'West', division: 'Northwest', names: ['Minnesota Timberwolves'] },
  thunder: { conference: 'West', division: 'Northwest', names: ['Seattle SuperSonics', 'Oklahoma City Thunder'] },
  blazers: { conference: 'West', division: 'Northwest', names: ['Portland Trail Blazers'] },
  jazz: { conference: 'West', division: 'Northwest', names: ['New Orleans Jazz', 'Utah Jazz'] },
  warriors: { conference: 'West', division: 'Pacific', names: ['Philadelphia Warriors', 'San Francisco Warriors', 'Golden State Warriors'] },
  clippers: { conference: 'West', division: 'Pacific', names: ['Buffalo Braves', 'San Diego Clippers', 'Los Angeles Clippers'] },
  lakers: { conference: 'West', division: 'Pacific', names: ['Minneapolis Lakers', 'Los Angeles Lakers'] },
  suns: { conference: 'West', division: 'Pacific', names: ['Phoenix Suns'] },
  kings: { conference: 'West', division: 'Pacific', names: ['Rochester Royals', 'Cincinnati Royals', 'Kansas City-Omaha Kings', 'Kansas City Kings', 'Sacramento Kings'] },
  mavericks: { conference: 'West', division: 'Southwest', names: ['Dallas Mavericks'] },
  rockets: { conference: 'West', division: 'Southwest', names: ['San Diego Rockets', 'Houston Rockets'] },
  grizzlies: { conference: 'West', division: 'Southwest', names: ['Vancouver Grizzlies', 'Memphis Grizzlies'] },
  pelicans: { conference: 'West', division: 'Southwest', names: [['Charlotte Hornets', 1988, 2001], 'New Orleans Hornets', 'New Orleans/Oklahoma City Hornets', 'New Orleans Pelicans'] },
  spurs: { conference: 'West', division: 'Southwest', names: ['San Antonio Spurs'] },
  'toronto-huskies': { names: ['Toronto Huskies'] },
  'washington-capitols': { names: ['Washington Capitols'] },
  'chicago-stags': { names: ['Chicago Stags'] },
  'baltimore-bullets-1947': { names: [['Baltimore Bullets', 1946, 1954]] },
};

/** Whether a Basketball Reference team name is this franchise in that season. */
export function nameMatches(f: Franchise, name: string, season: number): boolean {
  return f.names.some((n) => (typeof n === 'string' ? n === name : n[0] === name && season >= n[1] && season <= n[2]));
}
