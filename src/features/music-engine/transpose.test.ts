import { describe, expect, it } from 'vitest';
import { tokenizeLine, transposeChord, transposeSong } from './transpose';

describe('transposeChord', () => {
  it.each([
    ['C', 2, 'D'],
    ['F#m7', 2, 'G#m7'],
    ['Bbmaj7', 2, 'Cmaj7'],
    ['G7/B', 5, 'C7/E'],
    ['Cadd9', -2, 'Bbadd9'],
    ['Dsus4/F#', -2, 'Csus4/E'],
    ['Eaug', 1, 'Faug'],
  ])('transposes %s by %i', (chord, semitones, expected) => {
    expect(transposeChord(chord, semitones)).toBe(expected);
  });

  it('leaves unrecognized notation untouched', () => {
    expect(transposeChord('N.C.', 4)).toBe('N.C.');
  });
});

describe('transposeSong', () => {
  it('changes chords and preserves lyrics byte-for-byte', () => {
    expect(transposeSong('[G]Paloma blanca, [C]alza tu vuelo', 2))
      .toBe('[A]Paloma blanca, [D]alza tu vuelo');
  });

  it('does not treat ordinary brackets across lines as chords', () => {
    expect(transposeSong('[Am]\nLa letra no cambia', 2)).toBe('[Bm]\nLa letra no cambia');
  });
});

describe('tokenizeLine', () => {
  it('creates a stable sequence for the visual renderer', () => {
    expect(tokenizeLine('[G]Hola [D/F#]mundo')).toEqual([
      { type: 'chord', value: 'G' },
      { type: 'lyric', value: 'Hola ' },
      { type: 'chord', value: 'D/F#' },
      { type: 'lyric', value: 'mundo' },
    ]);
  });
});
