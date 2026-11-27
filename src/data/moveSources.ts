import type { Source } from './types';

/*
 * Articles written the week of each trade or signing in moves.ts. Quotes from
 * them are kept on each move's citations (never shown). Added 2026-11-27.
 */

const a = (id: string, title: string, outlet: string, url: string, published: string, about: string): Source =>
  ({ id, kind: 'article', title, outlet, url, published, added: '2026-11-27', about });

export const moveSources: Source[] = [
  // Shaq to Miami, July 2004
  a('ap-go-east-young-man-2004', 'Go East, young man', 'The Spokesman-Review (Associated Press)', 'https://www.spokesman.com/stories/2004/jul/15/go-east-young-man/', '2004-07-15',
    'The day after the Lakers traded Shaquille O\'Neal to Miami: excitement in South Florida, gloom in Los Angeles.'),
  a('salon-shaq-heat-2004', 'Shaq goes to the Heat. Just another old guy retiring to South Florida?', 'Salon (King Kaufman\'s Sports Daily)', 'https://www.salon.com/2004/07/15/thursday_124/', '2004-07-15',
    'A skeptical column on whether a 32-year-old O\'Neal makes Miami a champion.'),
  a('ap-shaq-traded-heat-2004', 'Shaquille O\'Neal Traded to Miami Heat', 'Fox News (Associated Press)', 'https://www.foxnews.com/story/shaquille-oneal-traded-to-miami-heat', '2004-07-14',
    'The wire report on the O\'Neal trade: the package, his age and injuries, and the shift in the East.'),
  // Garnett to Boston, July 2007
  a('si-garnett-trade-2007', 'For Boston, that\'s the Ticket', 'Sports Illustrated (Ian Thomsen)', 'https://www.si.com/more-sports/2007/07/31/garnett-trade', '2007-07-31',
    'Instant analysis of Kevin Garnett joining Paul Pierce and Ray Allen in Boston.'),
  a('ap-celtics-garnett-7-for-1-2007', 'Celtics obtain former MVP in 7-for-1 deal', 'ESPN (Associated Press)', 'https://www.espn.com/espn/wire/_/section/nba/id/2956104', '2007-07-31',
    'The wire report on the Garnett trade, with reaction from Garnett, Danny Ainge and Kevin McHale.'),
  a('ap-wolves-garnett-best-alternative-2007', 'Wolves owner: Garnett trade was \'best alternative\'', 'MPR News (Associated Press)', 'https://www.mprnews.org/story/2007/07/31/twolvesfuture', '2007-07-31',
    'Minnesota\'s owner explains trading Garnett and starting over with young players.'),
  // Gasol to the Lakers, February 2008
  a('si-gasol-trade-war-of-words-2008', 'Gasol trade sparks war of words', 'Sports Illustrated', 'https://www.si.com/nba/2008/02/09/popovich-grizzlies', '2008-02-09',
    'Rival coaches and Memphis\'s owner argue over the Pau Gasol trade.'),
  a('br-gasol-kwame-analysis-2008', 'Pau Gasol-Kwame Brown Trade: Analysis', 'Bleacher Report (Jimmy Thompson)', 'https://bleacherreport.com/articles/8495-pau-gasol-kwame-brown-trade-analysis', '2008-02-02',
    'A roundup of reaction to the Gasol trade the day after it happened.'),
  a('upi-lakers-acquire-gasol-2008', 'Lakers acquire Pau Gasol from Memphis', 'UPI', 'https://www.upi.com/Sports_News/2008/02/01/Lakers-acquire-Pao-Gasol-from-Memphis/81141201906797/', '2008-02-01',
    'The wire report on the Gasol trade, with the Lakers\' reaction.'),
  // Carmelo to the Knicks, February 2011
  a('cbs-melo-knicks-grades-2011', 'Carmelo Anthony to the New York Knicks: Grading the trade', 'CBS Sports (Ben Golliver)', 'https://www.cbsnews.com/news/carmelo-anthony-to-the-new-york-knicks-grading-the-trade/', '2011-02-22',
    'Grades for every team in the three-team Carmelo Anthony trade.'),
  a('br-melo-grading-pieces-2011', 'Carmelo Anthony Trade: Grading All of the Trade Pieces', 'Bleacher Report (Ethan Norof)', 'https://bleacherreport.com/articles/616954-carmelo-anthony-trade-grading-all-of-the-trade-pieces', '2011-02',
    'Grades for each player who moved in the Carmelo Anthony trade.'),
  a('br-melo-nuggets-do-well-2011', 'Carmelo Anthony Finally Dealt to NY Knicks: Denver Nuggets Do Well in Trade', 'Bleacher Report (Rich Kurtzman)', 'https://bleacherreport.com/articles/616292-carmelo-anthony-finally-dealt-denver-nuggets-do-well', '2011-02-21',
    'Why Denver came out of the Anthony saga with a good return.'),
  // Chris Paul to the Clippers, December 2011
  a('br-cp3-clippers-grades-2011', 'Chris Paul to Clippers: Grading the Trade for Both Hornets and Los Angeles', 'Bleacher Report (Ryan Rudnansky)', 'https://bleacherreport.com/articles/983733-chris-paul-to-clippers-grading-the-trade-for-both-hornets-and-los-angeles', '2011-12-14',
    'Grades for the Clippers and Hornets after the Chris Paul trade.'),
  a('br-cp3-clippers-trumps-lakers-2011', 'Chris Paul Trade: Why Clippers\' Deal for CP3 Trumps Lakers\' Failed Deal', 'Bleacher Report (Zachary D. Rymer)', 'https://bleacherreport.com/articles/983787-chris-paul-trade-why-clippers-deal-for-cp3-trumps-lakers-failed-deal', '2011-12-15',
    'Comparing the Clippers\' package for Chris Paul with the vetoed Lakers deal.'),
  a('br-cp3-veto-reaction-2011', 'Chris Paul Trade: Twitter Explodes as NBA Reacts to Vetoed Deal', 'Bleacher Report (Gabe Zaldivar)', 'https://bleacherreport.com/articles/975792-chris-paul-trade-twitter-explodes-as-nba-reacts-to-vetoed-deal', '2011-12-09',
    'Reaction the night the league voided Chris Paul\'s trade to the Lakers.'),
  // Harden to Houston, October 2012
  a('si-grade-harden-trade-2012', 'Grade the trade: Thunder trade James Harden to Rockets', 'Sports Illustrated (Ben Golliver)', 'https://www.si.com/nba/2012/10/28/james-harden-trade-thunder-rockets', '2012-10-28',
    'Grades for Oklahoma City, Houston and Harden himself.'),
  a('si-harden-traded-thomsen-2012', 'James Harden traded to Houston Rockets', 'Sports Illustrated (Ian Thomsen)', 'https://www.si.com/more-sports/2012/10/28/james-harden-traded-houston-rockets', '2012-10-28',
    'What the Harden trade changes for the Thunder\'s winning formula.'),
  a('espn-5on5-harden-trade-2012', '5-on-5: James Harden trade thoughts', 'ESPN', 'https://africa.espn.com/nba/story/_/page/5-on-5-121028/nba-james-harden-trade-thoughts', '2012-10',
    'Five writers on whether trading Harden was a good move.'),
  // Kyrie to Boston, August 2017
  a('si-kyrie-isaiah-grades-2017', 'Trade Grades: Cavs Send Kyrie Irving to Celtics for Package Including Isaiah Thomas', 'Sports Illustrated (Rohan Nadkarni)', 'https://www.si.com/nba/2017/08/22/kyrie-irving-isaiah-thomas-cavaliers-celtics-trade-grades-analysis', '2017-08-22',
    'Grades for Cleveland and Boston after the Irving-for-Thomas trade.'),
  a('cbs-kyrie-isaiah-grade-2017', 'Grade the Trade: Cavs make out like bandits in Kyrie Irving-Isaiah Thomas deal', 'CBS Sports (Colin Ward-Henninger)', 'https://www.cbssports.com/nba/news/grade-the-trade-cavs-make-out-like-bandits-in-kyrie-irving-isaiah-thomas-deal', '2017-08-22',
    'Why Cleveland did well with little leverage.'),
  // Luka-Trae, June 2018
  a('si-luka-trae-grades-2018', 'NBA draft: Luka Doncic, Trae Young, Hawks-Mavericks trade grades', 'Sports Illustrated', 'https://www.si.com/nba/2018/06/21/nba-draft-luka-doncic-trae-young-hawks-mavericks-trade-grades', '2018-06-21',
    'Draft-night grades for the Doncic-for-Young swap.'),
  a('cbs-draft-grades-2018', 'NBA Draft Grades 2018: Mavericks and Hawks soar while Wizards and Grizzlies stumble', 'CBS Sports (Kyle Boone)', 'https://www.cbssports.com/nba/news/nba-draft-grades-2018-mavericks-and-hawks-soar-while-wizards-and-grizzlies-stumble/', '2018-06-23',
    'Team-by-team grades for the 2018 draft.'),
  // Nets-Celtics, June 2013
  a('si-grading-celtics-nets-2013', 'Grading Celtics-Nets deal for Kevin Garnett and Paul Pierce', 'Sports Illustrated (Ben Golliver)', 'https://www.si.com/nba/2013/06/28/boston-celtics-brooklyn-nets-trade-kevin-garnett-paul-pierce-grades', '2013-06-28',
    'Grades for both teams in the Pierce and Garnett trade.'),
  a('br-celtics-nets-blockbuster-2013', 'Celtics-Nets Blockbuster Trade: Grading Kevin Garnett, Paul Pierce to Brooklyn', 'Bleacher Report (Josh Cohen)', 'https://bleacherreport.com/articles/1687344-celtics-nets-blockbuster-trade-grading-kevin-garnett-paul-pierce-to-brooklyn', '2013-06',
    'Grades for Boston and Brooklyn after the draft-night agreement.'),
  a('si-nets-short-term-gains-2013', 'Nets make significant short-term gains in blockbuster deal with Celtics', 'Sports Illustrated (Rob Mahoney)', 'https://www.si.com/nba/2013/06/28/brooklyn-nets-boston-celtics-nba-trade-kevin-garnett-paul-pierce', '2013-06-28',
    'What Brooklyn bought, and what it cost, in the Pierce and Garnett trade.'),
  // Kawhi to Toronto, July 2018
  a('si-kawhi-derozan-grades-2018', 'Trade Grades: Kawhi Leonard Dealt to Raptors for DeMar DeRozan in Summer Blockbuster', 'Sports Illustrated (Rohan Nadkarni)', 'https://www.si.com/nba/2018/07/18/kawhi-leonard-demar-derozan-trade-spurs-raptors-grades', '2018-07-18',
    'Grades for Toronto and San Antonio after the Leonard-DeRozan trade.'),
  a('ringer-kawhi-derozan-no-fun-2018', 'Kawhi Leonard for DeMar DeRozan: There\'s No Fun Here', 'The Ringer (Juliet Litman)', 'https://www.theringer.com/2018/07/18/nba/kawhi-leonard-demar-derozan-trade-sucks-no-fun', '2018-07-18',
    'Why the Leonard trade felt like a loss for everyone involved.'),
  // Anthony Davis to the Lakers, June 2019
  a('si-ad-lakers-grades-2019', 'Trade Grades: Lakers Get Top Marks After Finally Acquiring Anthony Davis', 'Sports Illustrated (Rohan Nadkarni)', 'https://www.si.com/nba/2019/06/15/anthony-davis-trade-lakers-send-lonzo-ingram-pelicans', '2019-06-15',
    'Grades for the Lakers and Pelicans after the Anthony Davis trade.'),
  a('ringer-ad-winners-losers-2019', 'Winners and Losers of the Anthony Davis–Lakers Blockbuster Trade', 'The Ringer', 'https://www.theringer.com/nba/2019/6/15/18680572/lakers-anthony-davis-trade-lebron-james-pelicans', '2019-06-16',
    'Winners and losers the night the Lakers landed Anthony Davis.'),
  // Paul George and Kawhi to the Clippers, July 2019
  a('si-pg-clippers-grades-2019', 'Trade Grades: Clippers Acquire Paul George in Summer\'s Most Shocking Move', 'Sports Illustrated (Rohan Nadkarni)', 'https://www.si.com/nba/2019/07/06/grading-thunder-clippers-trade-paul-george', '2019-07-06',
    'Grades for the Clippers and Thunder after the Paul George trade.'),
  a('ringer-clippers-kawhi-pg-2019', 'The Clippers Got Kawhi Leonard and Paul George, and Changed What\'s Possible in the NBA', 'The Ringer (Kevin O\'Connor)', 'https://www.theringer.com/2019/07/06/nba/paul-george-kawhi-leonard-clippers-free-agency-russell-westbrook', '2019-07-06',
    'The night the Clippers landed Leonard and George, and who won and lost.'),
  a('si-kawhi-pg-winners-losers-2019', 'Winners and Losers: Kawhi Leonard, Paul George and NBA Free Agency\'s Second Act', 'Sports Illustrated (Rohan Nadkarni)', 'https://www.si.com/nba/2019/07/07/kawhi-leonard-paul-george-clippers-thunder-raptors-nba-free-agency', '2019-07-07',
    'Winners and losers from the Leonard signing and George trade.'),
  // Harden to Brooklyn, January 2021
  a('si-harden-nets-grade-2021', 'Grading the James Harden Blockbuster Trade', 'Sports Illustrated (Jeremy Woo)', 'https://www.si.com/nba/2021/01/13/james-harden-nets-rockets-trade-grade', '2021-01-13',
    'Grades for all four teams in the Harden trade.'),
  a('br-harden-experts-grade-2021', 'B/R NBA Experts Grade Every Team from Blockbuster James Harden Trade', 'Bleacher Report', 'https://bleacherreport.com/articles/2926839-br-nba-experts-grade-every-team-from-blockbuster-james-harden-trade', '2021-01-13',
    'Four writers grade each team in the Harden trade.'),
  // Luka to the Lakers, February 2025
  a('br-luka-ad-grades-2025', 'Grading Blockbuster Luka Dončić, Anthony Davis NBA Trade Between Lakers, Mavericks', 'Bleacher Report (Andy Bailey)', 'https://bleacherreport.com/articles/10153138-grading-blockbuster-luka-doncic-anthony-davis-nba-trade-between-lakers-mavericks', '2025-02-01',
    'Grades for the Lakers, Mavericks and Jazz the night of the Doncic trade.'),
  a('yahoo-luka-ad-grades-2025', 'Grading the stunning Lakers-Mavs trade: Who won the Luka Dončić-Anthony Davis swap?', 'Yahoo Sports (Morten Stig Jensen)', 'https://sports.yahoo.com/grading-the-stunning-lakers-mavs-trade-who-won-the-luka-doncic-anthony-davis-swap-133557076.html', '2025-02-02',
    'Who won the Doncic-for-Davis trade, graded the next day.'),
  // LeBron to Miami, July 2010
  a('si-plot-starts-here-2010', 'The plot starts here, showtime starts here', 'Sports Illustrated', 'https://vault.si.com/vault/2010/07/19/the-plot-starts-here-showtime-starts-here', '2010-07-19',
    'The magazine\'s story on LeBron James choosing Miami and the reaction in Cleveland.'),
  a('br-lebron-brand-legacy-2010', 'By Choosing Miami, LeBron James May Permanently Damage Brand and Legacy', 'Bleacher Report (Shady Botros)', 'https://bleacherreport.com/articles/417533-by-choosing-miami-lebron-james-may-permanently-damage-brand-and-legacy', '2010-07-08',
    'A same-night column on what joining Miami means for James\'s legacy.'),
  a('br-lebron-alienates-nation-2010', 'LeBron James Decision: Alienates a Nation and Hurts NBA', 'Bleacher Report (Anthony Tripicchio)', 'https://bleacherreport.com/articles/417772-lebron-james-alienates-a-nation-hurts-nba', '2010-07-09',
    'The day after The Decision: expectations for the Heat and criticism of James.'),
  // LeBron back to Cleveland, July 2014
  a('si-lebron-home-cleveland-2014', 'Four years later, LeBron is ready to bring success home to Cleveland', 'Sports Illustrated (Chris Mannix)', 'https://www.si.com/nba/2014/07/11/lebron-james-decision-cleveland-cavaliers-miami-heat-kyrie-irving', '2014-07-11',
    'Reaction to LeBron James returning to the Cavaliers.'),
  a('br-lebron-cavs-reaction-2014', 'LeBron James to Cavaliers: Latest Contract Details, Analysis and Reaction', 'Bleacher Report (Tyler Conway)', 'https://bleacherreport.com/articles/2109703-lebron-james-to-cavaliers-latest-contract-details-analysis-and-reaction', '2014-07-11',
    'The day James chose Cleveland: the contract, the other suitors and the reaction.'),
  // Durant to Golden State, July 2016
  a('si-durant-warriors-grades-2016', 'Grades: Warriors outdo themselves with Kevin Durant blockbuster deal', 'Sports Illustrated (Ben Golliver)', 'https://www.si.com/nba/2016/07/04/kevin-durant-warriors-thunder-nba-free-agency-contract-grades-stephen-curry', '2016-07-04',
    'A grade for the Warriors the day Durant chose Golden State.'),
  a('ringer-warriors-big-four-2016', 'The Warriors Have Assembled Their Big Four — What Does This Mean for the Rest of the League?', 'The Ringer (Jonathan Tjarks)', 'https://www.theringer.com/2016/07/05/nba/kevin-durant-warriors-superteam-league-changes-8ddef3b61f6', '2016-07-05',
    'What Durant joining a 73-win team meant for every other contender.'),
  a('si-golden-decision-2016', 'Golden Decision: Kevin Durant shakes up the NBA with move to the Warriors', 'Sports Illustrated (Ben Golliver)', 'https://www.si.com/nba/2016/07/04/kevin-durant-warriors-free-agency-stephen-curry-russell-westbrook', '2016-07-04',
    'The shock of Durant leaving Oklahoma City for Golden State.'),
  // LeBron to the Lakers, July 2018
  a('si-free-agency-grades-2018', '2018 NBA Free Agency: Grading Every Deal', 'Sports Illustrated', 'https://www.si.com/nba/2018/07/01/nba-free-agency-grades-contracts-deals-reports-rumors', '2018-07-01',
    'Grades for each 2018 free agent deal, starting with LeBron James to the Lakers.'),
  a('br-lebron-upside-down-2018', 'LeBron James Turns NBA Upside Down with Free-Agent Move to LA Lakers', 'Bleacher Report (Grant Hughes)', 'https://bleacherreport.com/articles/2784031-lebron-james-turns-nba-upside-down-with-free-agent-move-', '2018-07-01',
    'What James joining the Lakers meant for Cleveland and the West.'),
];
