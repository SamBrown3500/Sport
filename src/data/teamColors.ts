/*
 * Team colors for team pages (gam, 2026-11-27). Today's primary and
 * secondary colors as each franchise uses them, plus the short code shown in
 * the badge. No logos: the badge is plain text in the team's colors.
 */

export interface TeamColors { code: string; primary: string; secondary: string }

export const teamColors: Record<string, TeamColors> = {
  celtics: { code: 'BOS', primary: '#007A33', secondary: '#BA9653' },
  nets: { code: 'BKN', primary: '#000000', secondary: '#FFFFFF' },
  knicks: { code: 'NYK', primary: '#006BB6', secondary: '#F58426' },
  sixers: { code: 'PHI', primary: '#006BB6', secondary: '#ED174C' },
  raptors: { code: 'TOR', primary: '#CE1141', secondary: '#000000' },
  bulls: { code: 'CHI', primary: '#CE1141', secondary: '#000000' },
  cavaliers: { code: 'CLE', primary: '#860038', secondary: '#FDBB30' },
  pistons: { code: 'DET', primary: '#C8102E', secondary: '#1D42BA' },
  pacers: { code: 'IND', primary: '#002D62', secondary: '#FDBB30' },
  bucks: { code: 'MIL', primary: '#00471B', secondary: '#EEE1C6' },
  hawks: { code: 'ATL', primary: '#E03A3E', secondary: '#C1D32F' },
  hornets: { code: 'CHA', primary: '#1D1160', secondary: '#00788C' },
  heat: { code: 'MIA', primary: '#98002E', secondary: '#F9A01B' },
  magic: { code: 'ORL', primary: '#0077C0', secondary: '#C4CED4' },
  wizards: { code: 'WAS', primary: '#002B5C', secondary: '#E31837' },
  nuggets: { code: 'DEN', primary: '#0E2240', secondary: '#FEC524' },
  timberwolves: { code: 'MIN', primary: '#0C2340', secondary: '#78BE20' },
  thunder: { code: 'OKC', primary: '#007AC1', secondary: '#EF3B24' },
  blazers: { code: 'POR', primary: '#E03A3E', secondary: '#000000' },
  jazz: { code: 'UTA', primary: '#3E2680', secondary: '#79A3DC' }, // 2025 "Mountain Purple" rebrand
  warriors: { code: 'GSW', primary: '#1D428A', secondary: '#FFC72C' },
  clippers: { code: 'LAC', primary: '#C8102E', secondary: '#1D428A' },
  lakers: { code: 'LAL', primary: '#552583', secondary: '#FDB927' },
  suns: { code: 'PHX', primary: '#1D1160', secondary: '#E56020' },
  kings: { code: 'SAC', primary: '#5A2D81', secondary: '#63727A' },
  mavericks: { code: 'DAL', primary: '#00538C', secondary: '#B8C4CA' },
  rockets: { code: 'HOU', primary: '#CE1141', secondary: '#000000' },
  grizzlies: { code: 'MEM', primary: '#5D76A9', secondary: '#12173F' },
  pelicans: { code: 'NOP', primary: '#0C2340', secondary: '#C8102E' },
  spurs: { code: 'SAS', primary: '#000000', secondary: '#C4CED4' },
};

const FORMER: TeamColors = { code: '', primary: '#46505B', secondary: '#AAB1B9' };

export function colorsFor(id: string, name = ''): TeamColors {
  return teamColors[id] ?? { ...FORMER, code: name.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase() };
}
