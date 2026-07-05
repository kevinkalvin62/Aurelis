import { describe, expect, it } from "vitest";
import {
  adaptInstrumentMaterial,
  getInstrumentTransposeOffset,
  suggestedInstrumentKey,
  transposeSongForInstrument,
} from "./instrument-material";
import type { Instrument, InstrumentMaterial } from "@/types/domain";

const trumpet: Instrument = {
  id: "trumpet",
  name: "Trompeta",
  transpositionKey: "Bb",
  writtenOffset: 2,
};
const altoSax: Instrument = {
  id: "alto",
  name: "Saxofón alto",
  transpositionKey: "Eb",
  writtenOffset: 9,
};
const piano: Instrument = {
  id: "piano",
  name: "Piano",
  transpositionKey: "C",
  writtenOffset: 0,
};
const material: InstrumentMaterial = {
  id: "part-1",
  songId: "song-1",
  instrumentId: trumpet.id,
  instrumentName: trumpet.name,
  key: "D",
  contentRaw: "D E F#",
  notes: "Entrada suave",
};

describe("instrument material adaptation", () => {
  it("suggests the written key from the concert key", () => {
    expect(suggestedInstrumentKey("C", trumpet)).toBe("D");
    expect(suggestedInstrumentKey("C", altoSax)).toBe("A");
  });

  it("returns trumpet notes to concert pitch", () => {
    expect(adaptInstrumentMaterial(material, trumpet, piano)).toMatchObject({
      instrumentName: "Piano",
      key: "C",
      contentRaw: "C D E",
      adaptedFromInstrumentName: "Trompeta",
    });
  });

  it("adapts a trumpet part for alto sax", () => {
    expect(adaptInstrumentMaterial(material, trumpet, altoSax)).toMatchObject({
      instrumentName: "Saxofón alto",
      key: "A",
      contentRaw: "A B C#",
      adaptedFromInstrumentName: "Trompeta",
    });
  });

  it("transposes a base wind song through a pure instrument rule", () => {
    const song = {
      id: "song",
      title: "Notas",
      artist: "",
      key: "C",
      bpm: 80,
      visibility: "organization" as const,
      updatedAt: "",
      content: "C D E",
      contentType: "wind_notes" as const,
      notation: "american" as const,
      sourceInstrumentName: "Concert",
    };
    expect(getInstrumentTransposeOffset(trumpet)).toBe(2);
    expect(transposeSongForInstrument(song, trumpet)).toMatchObject({
      key: "D",
      content: "D E F#",
    });
  });
});
