import { describe, expect, it } from "vitest";
import {
  adaptInstrumentMaterial,
  getInstrumentTransposeOffset,
  suggestedInstrumentKey,
  transposeSongForInstrument,
} from "./instrument-material";

describe("instrument material helpers", () => {
  describe("getInstrumentTransposeOffset", () => {
    it("uses explicit writtenOffset when provided", () => {
      expect(
        getInstrumentTransposeOffset({
          instrumentName: "Custom",
          writtenOffset: 5,
        }),
      ).toBe(5);
    });

    it("returns offsets from transpositionKey", () => {
      expect(getInstrumentTransposeOffset({ transpositionKey: "Bb" })).toBe(2);
      expect(getInstrumentTransposeOffset({ transpositionKey: "Eb" })).toBe(9);
      expect(getInstrumentTransposeOffset({ transpositionKey: "F" })).toBe(7);
    });

    it("infers Eb instruments from their name", () => {
      expect(getInstrumentTransposeOffset({ name: "Sax Alto" })).toBe(9);
      expect(getInstrumentTransposeOffset({ name: "Sax Barítono" })).toBe(9);
    });

    it("infers Bb instruments from their name", () => {
      expect(getInstrumentTransposeOffset({ name: "Trompeta" })).toBe(2);
      expect(getInstrumentTransposeOffset({ name: "Saxofón Tenor" })).toBe(2);
    });

    it("returns concert pitch when no transposition is detected", () => {
      expect(getInstrumentTransposeOffset({ name: "Flauta traversa" })).toBe(0);
    });
  });

  describe("transposeSongForInstrument", () => {
    const baseSong = {
      id: "song-1",
      title: "Canción",
      key: "C",
      currentKey: "D",
      content: "C D E",
      contentType: "wind_notes",
      notation: "american",
    } as any;

    it("returns the same song when the target instrument has no transpose offset", () => {
      const result = transposeSongForInstrument(baseSong, {
        name: "Flauta traversa",
      });

      expect(result).toBe(baseSong);
    });

    it("transposes key, currentKey and content", () => {
      const result = transposeSongForInstrument(baseSong, {
        name: "Trompeta",
      });

      expect(result).not.toBe(baseSong);
      expect(result.key).not.toBe(baseSong.key);
      expect(result.currentKey).not.toBe(baseSong.currentKey);
      expect(result.content).not.toBe(baseSong.content);
    });

    it("works when currentKey is not present", () => {
      const songWithoutCurrentKey = {
        ...baseSong,
        currentKey: undefined,
      };

      const result = transposeSongForInstrument(songWithoutCurrentKey, {
        name: "Trompeta",
      });

      expect(result.currentKey).toBeUndefined();
      expect(result.key).not.toBe(songWithoutCurrentKey.key);
    });
  });

  describe("adaptInstrumentMaterial", () => {
    const source = {
      id: "source-1",
      name: "Flauta traversa",
      writtenOffset: 0,
    } as any;

    const targetConcert = {
      id: "target-1",
      name: "Teclado",
      writtenOffset: 0,
    } as any;

    const targetBb = {
      id: "target-2",
      name: "Trompeta",
      writtenOffset: 2,
    } as any;

    it("only changes instrument identity when no transposition is needed", () => {
      const material = {
        instrumentId: source.id,
        instrumentName: source.name,
        key: "C",
        contentRaw: "C D E",
      } as any;

      const result = adaptInstrumentMaterial(material, source, targetConcert);

      expect(result.instrumentId).toBe(targetConcert.id);
      expect(result.instrumentName).toBe(targetConcert.name);
      expect(result.adaptedFromInstrumentName).toBeUndefined();
    });

    it("transposes key and raw content for a different instrument", () => {
      const material = {
        instrumentId: source.id,
        instrumentName: source.name,
        key: "C",
        contentRaw: "C D E",
      } as any;

      const result = adaptInstrumentMaterial(material, source, targetBb);

      expect(result.instrumentId).toBe(targetBb.id);
      expect(result.instrumentName).toBe(targetBb.name);
      expect(result.key).not.toBe(material.key);
      expect(result.contentRaw).not.toBe(material.contentRaw);
      expect(result.adaptedFromInstrumentName).toBe(source.name);
    });

    it("adapts material without optional key or content", () => {
      const material = {
        instrumentId: source.id,
        instrumentName: source.name,
      } as any;

      const result = adaptInstrumentMaterial(material, source, targetBb);

      expect(result.key).toBeUndefined();
      expect(result.contentRaw).toBeUndefined();
      expect(result.adaptedFromInstrumentName).toBe(source.name);
    });
  });

  describe("suggestedInstrumentKey", () => {
    it("returns the transposed suggested key", () => {
      const instrument = {
        id: "trumpet",
        name: "Trompeta",
        writtenOffset: 2,
      } as any;

      expect(suggestedInstrumentKey("C", instrument)).not.toBe("C");
    });
  });
});
