export type AccidentalPreference = "sharp" | "flat" | "auto";

const SHARP_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
const FLAT_NOTES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"] as const;

const NOTE_INDEX: Record<string, number> = {
  C: 0,
  "B#": 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  "E#": 5,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
  Cb: 11,
};

const CHORD_PATTERN = /^([A-Ga-g])([#b♯♭]?)([^/]*?)(?:\/([A-Ga-g])([#b♯♭]?))?$/;

function normalizeNote(letter: string, accidental = ""): string {
  const normalizedAccidental = accidental.replace("♯", "#").replace("♭", "b");
  return `${letter.toUpperCase()}${normalizedAccidental}`;
}

function modulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function transposeNote(note: string, semitones: number, preference: AccidentalPreference): string {
  const index = NOTE_INDEX[note];
  if (index === undefined) return note;
  const notes =
    preference === "flat" || (preference === "auto" && note.includes("b"))
      ? FLAT_NOTES
      : SHARP_NOTES;
  return notes[modulo(index + semitones, 12)] ?? note;
}

/** Transposes the harmonic roots while preserving every chord modifier verbatim. */
export function transposeChord(
  chord: string,
  semitones: number,
  preference: AccidentalPreference = "auto",
): string {
  const match = chord.trim().match(CHORD_PATTERN);
  if (!match) return chord;

  const [, rootLetter = "", rootAccidental = "", suffix = "", bassLetter, bassAccidental = ""] =
    match;
  const root = normalizeNote(rootLetter, rootAccidental);
  const effectivePreference =
    preference === "auto" && !root.includes("b") && semitones < 0 ? "flat" : preference;
  const nextRoot = transposeNote(root, semitones, effectivePreference);
  const bass = bassLetter
    ? `/${transposeNote(normalizeNote(bassLetter, bassAccidental), semitones, effectivePreference)}`
    : "";

  return `${nextRoot}${suffix}${bass}`;
}

/** Transposes chords enclosed in brackets without ever mutating the lyric text. */
export function transposeSong(
  content: string,
  semitones: number,
  preference: AccidentalPreference = "auto",
): string {
  if (semitones === 0) return content;
  return content.replace(
    /\[([^\]\r\n]+)]/g,
    (_, chord: string) => `[${transposeChord(chord, semitones, preference)}]`,
  );
}

export interface SongToken {
  type: "chord" | "lyric";
  value: string;
}

export function tokenizeLine(line: string): SongToken[] {
  const tokens: SongToken[] = [];
  let cursor = 0;
  for (const match of line.matchAll(/\[([^\]]+)]/g)) {
    if (match.index > cursor)
      tokens.push({ type: "lyric", value: line.slice(cursor, match.index) });
    tokens.push({ type: "chord", value: match[1] ?? "" });
    cursor = match.index + match[0].length;
  }
  if (cursor < line.length) tokens.push({ type: "lyric", value: line.slice(cursor) });
  return tokens;
}

export function transposeKey(
  key: string,
  semitones: number,
  preference: AccidentalPreference = "auto",
): string {
  return transposeChord(key, semitones, preference);
}
