import { describe, expect, it } from "vitest";
import {
  getInstrumentTransposeOffset,
  getTransposeDeltaBetweenInstruments,
  SOURCE_INSTRUMENT_OPTIONS,
  shouldTranspose,
  transposeContentBetweenInstruments,
} from "./instruments";

describe("instrument-to-instrument transposition", () => {
  it("keeps the approved selectable source instrument catalog", () => {
    expect(SOURCE_INSTRUMENT_OPTIONS).toContain("Concert");
    expect(SOURCE_INSTRUMENT_OPTIONS).toContain("Flauta traversa");
    expect(SOURCE_INSTRUMENT_OPTIONS).not.toContain("Clarinete");
    expect(SOURCE_INSTRUMENT_OPTIONS).not.toContain("Clarinete Bb");
  });

  it("uses one documented written-pitch convention", () => {
    expect(getInstrumentTransposeOffset("Trompeta Bb")).toBe(2);
    expect(getInstrumentTransposeOffset("Sax Alto Eb")).toBe(9);
    expect(getInstrumentTransposeOffset("Concert")).toBe(0);
    expect(getInstrumentTransposeOffset("Flauta traversa")).toBe(0);
  });

  it("keeps historical clarinet transposition compatibility", () => {
    expect(getInstrumentTransposeOffset("Clarinete")).toBe(2);
    expect(getInstrumentTransposeOffset("Clarinete Bb")).toBe(2);
  });

  it("does not double transpose material already written for the target", () => {
    expect(shouldTranspose("Trompeta Bb", "Trompeta Bb")).toBe(false);
    expect(transposeContentBetweenInstruments("D E F#", "Trompeta Bb", "Trompeta Bb")).toBe(
      "D E F#",
    );
  });
  it("moves from source offset to target offset", () => {
    expect(getTransposeDeltaBetweenInstruments("Sax Alto Eb", "Trompeta Bb")).toBe(-7);
    expect(getTransposeDeltaBetweenInstruments("Flauta traversa", "Trompeta Bb")).toBe(2);
    expect(transposeContentBetweenInstruments("A B C#", "Sax Alto Eb", "Trompeta Bb")).toBe(
      "D E Gb",
    );
  });
});
