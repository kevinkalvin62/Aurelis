import type { Instrument, Setlist, Song } from '@/types/domain';

export const songs: Song[] = [
  {
    id: 'paloma-blanca', title: 'Paloma Blanca', artist: 'Tradicional', key: 'G', bpm: 74,
    visibility: 'organization', updatedAt: 'Hoy, 09:42', favorite: true,
    contentType: 'lyrics_chords', notation: 'american',
    content: `G                 C\nPaloma blanca, alza tu vuelo\nG                       D\nlleva este canto al cielo\n\nEm                    C\nDile a los pueblos que no están solos\nG                    D\nque hay esperanza, que hay un hogar`,
  },
  {
    id: 'hay-libertad', title: 'Hay Libertad', artist: 'Art Aguilera', key: 'A', bpm: 128,
    visibility: 'organization', updatedAt: 'Ayer',
    contentType: 'chords_only', notation: 'american',
    content: `A   E/G#   F#m7   Dadd9\nA   E      D      E\nF#m C#m    D      E`,
  },
  {
    id: 'digno-y-santo', title: 'Digno y Santo', artist: 'Kari Jobe', key: 'D', bpm: 66,
    visibility: 'private', updatedAt: '24 jun',
    contentType: 'lyrics_chords', notation: 'latin',
    content: `RE                    LAm\nDigno y Santo, el Cordero inmolado\nDO                         SOL\nquien fue y quien es y quien vendrá`,
  },
  {
    id: 'gracia-sublime', title: 'Gracia Sublime', artist: 'En Espíritu y en Verdad', key: 'E', bpm: 92,
    visibility: 'organization', updatedAt: '21 jun', favorite: true,
    contentType: 'wind_notes', notation: 'american',
    content: `/////DEFEDA///// AGFGAGF E\nCD. DACD\nA A#  A# F A A#\nFG. GEFG\nGA. AGFE\nFGC DCDG. G. A#. D. AAAAA D E\n//AGCAFD// FDGAAGA EGAAGA\nAGCAFD DCDF. GGGG EE\nAGFGACA-DDC#. - DE\nFinal D-CD-CD-CD-CFEDC. DD`,
  },
];

export const setlists: Setlist[] = [
  { id: 'domingo-am', title: 'Domingo AM', dateLabel: 'DOM · 05 JUL', time: '10:00', location: 'Auditorio principal', songIds: ['paloma-blanca', 'hay-libertad', 'digno-y-santo'], peopleCount: 12 },
  { id: 'noche-acustica', title: 'Noche acústica', dateLabel: 'VIE · 10 JUL', time: '19:30', location: 'Salón Norte', songIds: ['gracia-sublime', 'digno-y-santo'], peopleCount: 6 },
];

export const instruments: Instrument[] = [
  { id: 'piano', name: 'Piano', family: 'Teclas', transposition: 0, primary: true },
  { id: 'trumpet', name: 'Trompeta en Bb', family: 'Metales', transposition: 2 },
];
