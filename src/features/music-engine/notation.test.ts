import { describe, expect, it } from 'vitest';
import { getDisplayLines, inlineToAlignedLines, isChordLine, transposeContent, transposeMelody, transposeNotationChord } from './notation';

describe('notation-aware chord engine', () => {
  it('transposes American and Latin chords', () => {
    expect(transposeNotationChord('Dmaj7/F#', 2, 'american')).toBe('Emaj7/G#');
    expect(transposeNotationChord('REm7/FA', 2, 'latin')).toBe('MIm7/SOL');
  });

  it('recognizes an aligned LaCuerda chord row', () => {
    expect(isChordLine('DO              LAm   DO', 'latin')).toBe(true);
    expect(isChordLine('Tú decías que me amabas', 'latin')).toBe(false);
  });

  it('preserves lyric spacing while transposing only chord rows', () => {
    const source = 'D0       Am\nTú decías que me amabas';
    expect(transposeContent(source, 2, 'lyrics_chords', 'american'))
      .toBe('E0       Bm\nTú decías que me amabas');
  });

  it('aligns legacy bracket chords over lyrics', () => {
    expect(inlineToAlignedLines('[G]Hola [D]mundo')).toEqual(['G    D', 'Hola mundo']);
  });
});

describe('wind melody sequences', () => {
  it('transposes notes while retaining every articulation symbol', () => {
    expect(transposeMelody('/////DEFEDA///// AGFGAGF E', 2, 'american'))
      .toBe('/////EF#GF#EB///// BAGABAG F#');
  });

  it('does not mistake words for note sequences', () => {
    expect(transposeMelody('Final D-CD.', 2, 'american')).toBe('Final E-DE.');
  });

  it('classifies sequence rows for the dedicated renderer', () => {
    expect(getDisplayLines('AGFG\nCD.', 'wind_notes', 'american').every((line) => line.kind === 'melody')).toBe(true);
  });
});
