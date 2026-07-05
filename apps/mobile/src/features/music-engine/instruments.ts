import { transposeContent } from "./notation";
import type { MusicNotation, SongContentType } from "@/types/domain";

export const SOURCE_INSTRUMENT_OPTIONS = [
  "Concert",
  "Voz",
  "Guitarra",
  "Piano",
  "Trompeta Bb",
  "Sax Alto Eb",
  "Sax Tenor Bb",
  "Clarinete Bb",
  "Trombón",
  "Bajo",
  "Otro",
] as const;

// Written-pitch convention: positive values are semitones above concert pitch.
const OFFSETS: Record<string, number> = {
  concert: 0,
  general: 0,
  c: 0,
  voz: 0,
  piano: 0,
  teclado: 0,
  guitarra: 0,
  bajo: 0,
  trombon: 0,
  "trompeta bb": 2,
  trompeta: 2,
  "clarinete bb": 2,
  clarinete: 2,
  "sax tenor bb": 2,
  "saxofon tenor": 2,
  "sax soprano bb": 2,
  "saxofon soprano": 2,
  "sax alto eb": 9,
  "saxofon alto": 9,
  "sax baritono eb": 9,
  "saxofon baritono": 9,
  "corno frances f": 7,
  "corno frances": 7,
};

function normalizeInstrumentName(value?: string): string {
  return (value || "Concert")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/♭/g, "b")
    .trim()
    .toLowerCase();
}

export function getInstrumentTransposeOffset(instrumentName?: string): number {
  const normalized = normalizeInstrumentName(instrumentName);
  if (normalized in OFFSETS) return OFFSETS[normalized]!;
  if (/\b(bb|si bemol)\b/.test(normalized)) return 2;
  if (/\b(eb|mi bemol)\b/.test(normalized)) return 9;
  if (/\b(f|fa)\b/.test(normalized)) return 7;
  return 0;
}

export function getTransposeDeltaBetweenInstruments(source?: string, target?: string): number {
  return getInstrumentTransposeOffset(target) - getInstrumentTransposeOffset(source);
}

export function shouldTranspose(source?: string, target?: string): boolean {
  return getTransposeDeltaBetweenInstruments(source, target) !== 0;
}

export function transposeContentBetweenInstruments(
  content: string,
  source: string | undefined,
  target: string | undefined,
  contentType: SongContentType = "wind_notes",
  notation: MusicNotation = "american",
): string {
  return transposeContent(
    content,
    getTransposeDeltaBetweenInstruments(source, target),
    contentType,
    notation,
  );
}
