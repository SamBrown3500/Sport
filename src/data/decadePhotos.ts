/*
 * One player photo per decade for the home page decade strip. All come from
 * Wikimedia Commons under a public-domain or Creative Commons license, cropped
 * and shrunk to 120x144. CC licenses need credit, which the home page shows.
 */
import p1940 from '../assets/decades/1940.jpg';
import p1950 from '../assets/decades/1950.jpg';
import p1960 from '../assets/decades/1960.jpg';
import p1970 from '../assets/decades/1970.webp';
import p1980 from '../assets/decades/1980.webp';
import p1990 from '../assets/decades/1990.webp';
import p2000 from '../assets/decades/2000.webp';
import p2010 from '../assets/decades/2010.webp';
import p2020 from '../assets/decades/2020.webp';

export interface DecadePhoto {
  src: string;
  player: string;
  /** Photographer, as Commons lists them. */
  author: string;
  license: string;
  /** The file's page on Wikimedia Commons. */
  page: string;
}

const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${file}`;

export const decadePhotos: Record<number, DecadePhoto> = {
  1940: { src: p1940, player: 'George Mikan', author: 'Unknown author', license: 'Public domain', page: commons('George_Mikan_1945.jpeg') },
  1950: { src: p1950, player: 'Bob Cousy', author: 'Unknown author', license: 'Public domain', page: commons('Bob_Cousy_(1).jpeg') },
  1960: { src: p1960, player: 'Bill Russell', author: 'Unknown author', license: 'Public domain', page: commons('Bill_russell_dribbling_(cropped).jpg') },
  1970: { src: p1970, player: 'Kareem Abdul-Jabbar', author: 'Frank Bryan', license: 'Public domain', page: commons('Kareem_Abdul-Jabbar_1974.jpeg') },
  1980: { src: p1980, player: 'Larry Bird', author: 'Steve Lipofsky', license: 'CC BY-SA 3.0', page: commons('Larry_Bird_Lipofsky_(high_quality)_(cropped).jpg') },
  1990: { src: p1990, player: 'Michael Jordan', author: 'Steve Lipofsky', license: 'CC BY-SA 3.0', page: commons('Steve_Lipfosky_--_Michael_Jordan_(1997)_(cropped).jpg') },
  2000: { src: p2000, player: 'Kobe Bryant', author: 'Keith Allison', license: 'CC BY-SA 2.0', page: commons('Kobe_Bryant_Dec_2014.jpg') },
  2010: { src: p2010, player: 'LeBron James', author: 'Erik Drost', license: 'CC BY 2.0', page: commons('LeBron_James_(51959977144)_(cropped2).jpg') },
  2020: { src: p2020, player: 'Nikola Jokić', author: 'All-Pro Reels', license: 'CC BY-SA 2.0', page: commons('Nikola_Jokic_free_throw_(cropped).jpg') },
};
