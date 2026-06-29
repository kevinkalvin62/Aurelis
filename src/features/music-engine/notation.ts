import type { MusicNotation, SongContentType } from '@/types/domain';
import type { AccidentalPreference } from './transpose';

const SHARP_AMERICAN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const FLAT_AMERICAN = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;
const SHARP_LATIN = ['DO', 'DO#', 'RE', 'RE#', 'MI', 'FA', 'FA#', 'SOL', 'SOL#', 'LA', 'LA#', 'SI'] as const;
const FLAT_LATIN = ['DO', 'REb', 'RE', 'MIb', 'MI', 'FA', 'SOLb', 'SOL', 'LAb', 'LA', 'SIb', 'SI'] as const;

const PITCH: Record<string, number> = {
  C: 0, 'B#': 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, Fb: 4,
  'E#': 5, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9,
  'A#': 10, Bb: 10, B: 11, Cb: 11,
  DO: 0, 'SI#': 0, 'DO#': 1, REb: 1, RE: 2, 'RE#': 3, MIb: 3, MI: 4,
  FAb: 4, 'MI#': 5, FA: 5, 'FA#': 6, SOLb: 6, SOL: 7, 'SOL#': 8,
  LAb: 8, LA: 9, 'LA#': 10, SIb: 10, SI: 11, DOb: 11,
};

const AMERICAN_CHORD = /^([A-Ga-g])([#b♯♭]?)([^/]*?)(?:\/([A-Ga-g])([#b♯♭]?))?$/;
const LATIN_CHORD = /^(DO|RE|MI|FA|SOL|LA|SI)([#b♯♭]?)([^/]*?)(?:\/(DO|RE|MI|FA|SOL|LA|SI)([#b♯♭]?))?$/i;
const BAR_TOKEN = /^(?:\|{1,2}|\/{1,2}|:|x\d+)$/i;

function modulo(value: number): number { return ((value % 12) + 12) % 12; }
function normalizeAccidental(value = ''): string { return value.replace('♯', '#').replace('♭', 'b'); }

export function isChordToken(value: string, notation: MusicNotation): boolean {
  return BAR_TOKEN.test(value) || (notation === 'latin' ? LATIN_CHORD : AMERICAN_CHORD).test(value);
}

export function transposeNotationChord(
  chord: string,
  semitones: number,
  notation: MusicNotation,
  preference: AccidentalPreference = 'auto',
): string {
  const match = chord.match(notation === 'latin' ? LATIN_CHORD : AMERICAN_CHORD);
  if (!match) return chord;
  const [, rootName = '', rootAccidental = '', suffix = '', bassName, bassAccidental = ''] = match;
  const root = `${rootName.toUpperCase()}${normalizeAccidental(rootAccidental)}`;
  const pitch = PITCH[root];
  if (pitch === undefined) return chord;
  const wantsFlats = preference === 'flat' || (preference === 'auto' && (root.includes('b') || semitones < 0));
  const notes = notation === 'latin'
    ? (wantsFlats ? FLAT_LATIN : SHARP_LATIN)
    : (wantsFlats ? FLAT_AMERICAN : SHARP_AMERICAN);
  const nextRoot = notes[modulo(pitch + semitones)] ?? root;
  const bass = bassName ? `${bassName.toUpperCase()}${normalizeAccidental(bassAccidental)}` : undefined;
  const bassPitch = bass ? PITCH[bass] : undefined;
  const nextBass = bassPitch === undefined ? '' : `/${notes[modulo(bassPitch + semitones)]}`;
  return `${nextRoot}${suffix}${nextBass}`;
}

export function isChordLine(line: string, notation: MusicNotation): boolean {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  return tokens.length > 0 && tokens.every((token) => isChordToken(token, notation));
}

function transposeChordLine(line: string, semitones: number, notation: MusicNotation): string {
  return line.replace(/\S+/g, (token) => transposeNotationChord(token, semitones, notation));
}

export function transposeMelody(content: string, semitones: number, notation: MusicNotation): string {
  if (semitones === 0) return content;
  if (notation === 'latin') {
    return content.replace(/SOL[#b]?|DO[#b]?|RE[#b]?|MI[#b]?|FA[#b]?|LA[#b]?|SI[#b]?/gi,
      (note) => transposeNotationChord(note, semitones, 'latin'));
  }
  return content.replace(/\S+/g, (segment) => {
    if (/[a-z]/.test(segment) || !/^[A-G#b/.\-]+$/.test(segment)) return segment;
    return segment.replace(/[A-G](?:#|b)?/g, (note) => transposeNotationChord(note, semitones, 'american'));
  });
}

export function transposeContent(
  content: string,
  semitones: number,
  contentType: SongContentType,
  notation: MusicNotation,
): string {
  if (semitones === 0) return content;
  if (contentType === 'wind_notes') return transposeMelody(content, semitones, notation);
  if (content.includes('[')) {
    return content.replace(/\[([^\]\r\n]+)]/g, (_, chord: string) => `[${transposeNotationChord(chord, semitones, notation)}]`);
  }
  return content.split('\n').map((line) =>
    contentType === 'chords_only' || isChordLine(line, notation)
      ? transposeChordLine(line, semitones, notation)
      : line,
  ).join('\n');
}

export interface DisplayLine { kind: 'chord' | 'lyric' | 'melody' | 'space'; value: string }

/** Converts legacy inline brackets into LaCuerda-style aligned chord/lyric rows. */
export function inlineToAlignedLines(line: string): [string, string] {
  let chords = '';
  let lyric = '';
  let pendingChord = '';
  for (let index = 0; index < line.length;) {
    if (line[index] === '[') {
      const close = line.indexOf(']', index);
      if (close >= 0) { pendingChord = line.slice(index + 1, close); index = close + 1; continue; }
    }
    if (pendingChord) {
      chords = chords.padEnd(lyric.length, ' ') + pendingChord;
      pendingChord = '';
    }
    lyric += line[index];
    index += 1;
  }
  return [chords, lyric];
}

export function getDisplayLines(content: string, contentType: SongContentType, notation: MusicNotation): DisplayLine[] {
  if (contentType === 'wind_notes') return content.split('\n').map((value) => ({ kind: value ? 'melody' : 'space', value }));
  if (contentType === 'lyrics_chords' && content.includes('[')) {
    return content.split('\n').flatMap((line): DisplayLine[] => {
      if (!line) return [{ kind: 'space', value: '' }];
      const [chord, lyric] = inlineToAlignedLines(line);
      return [{ kind: 'chord', value: chord }, { kind: 'lyric', value: lyric }];
    });
  }
  return content.split('\n').map((value) => ({
    kind: !value ? 'space' : contentType === 'chords_only' || isChordLine(value, notation) ? 'chord' : 'lyric',
    value,
  }));
}
