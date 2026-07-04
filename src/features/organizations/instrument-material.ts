import { transposeContent, transposeNotationChord } from "../music-engine/notation";
import type { Instrument, InstrumentMaterial, Song } from "@/types/domain";

export function getInstrumentTransposeOffset(instrument: {
  instrumentName?: string;
  name?: string;
  transpositionKey?: string;
  writtenOffset?: number;
}): number {
  if (Number.isFinite(instrument.writtenOffset)) return instrument.writtenOffset ?? 0;
  const key = instrument.transpositionKey?.replace("♭", "b").toUpperCase();
  if (key === "BB") return 2;
  if (key === "EB") return 9;
  if (key === "F") return 7;
  const name = (instrument.instrumentName ?? instrument.name ?? "").toLowerCase();
  if (name.includes("sax") && (name.includes("alto") || name.includes("barítono"))) return 9;
  if (name.includes("trompeta") || name.includes("clarinete") || name.includes("saxofón tenor"))
    return 2;
  return 0;
}

export function transposeSongForInstrument(
  song: Song,
  instrument: {
    instrumentName?: string;
    name?: string;
    transpositionKey?: string;
    writtenOffset?: number;
  },
): Song {
  const semitones = getInstrumentTransposeOffset(instrument);
  if (!semitones) return song;
  return {
    ...song,
    key: transposeNotationChord(song.key, semitones, song.notation),
    ...(song.currentKey
      ? {
          currentKey: transposeNotationChord(song.currentKey, semitones, song.notation),
        }
      : {}),
    content: transposeContent(song.content, semitones, song.contentType, song.notation),
  };
}

export function adaptInstrumentMaterial(
  material: InstrumentMaterial,
  source: Instrument,
  target: Instrument,
): InstrumentMaterial {
  const semitones = getInstrumentTransposeOffset(target) - getInstrumentTransposeOffset(source);
  if (semitones === 0) {
    return {
      ...material,
      instrumentId: target.id,
      instrumentName: target.name,
    };
  }

  return {
    ...material,
    instrumentId: target.id,
    instrumentName: target.name,
    ...(material.key ? { key: transposeNotationChord(material.key, semitones, "american") } : {}),
    ...(material.contentRaw
      ? {
          contentRaw: transposeContent(material.contentRaw, semitones, "wind_notes", "american"),
        }
      : {}),
    adaptedFromInstrumentName: source.name,
  };
}

export function suggestedInstrumentKey(concertKey: string, instrument: Instrument): string {
  return transposeNotationChord(concertKey, instrument.writtenOffset, "american");
}
