import { describe, expect, it } from "vitest";
import {
  isSelectablePhysicalInstrument,
  listSelectablePhysicalInstruments,
} from "./instrument-catalog";

describe("physical instrument catalog", () => {
  it("keeps Flauta traversa as a selectable physical instrument", () => {
    expect(isSelectablePhysicalInstrument({ name: "Flauta traversa" })).toBe(true);
  });

  it("removes clarinet from new physical selections", () => {
    expect(isSelectablePhysicalInstrument({ name: "Clarinete" })).toBe(false);
    expect(isSelectablePhysicalInstrument({ name: "Clarinete Bb" })).toBe(false);
  });

  it("removes legacy flute names from new physical selections", () => {
    expect(isSelectablePhysicalInstrument({ name: "Flauta" })).toBe(false);
    expect(isSelectablePhysicalInstrument({ name: "Flauta transversal" })).toBe(false);
  });

  it("returns only currently selectable physical instruments", () => {
    const catalog = listSelectablePhysicalInstruments([
      { name: "Flauta traversa" },
      { name: "Clarinete" },
      { name: "Flauta" },
      { name: "Trompeta" },
    ]);

    expect(catalog.map((instrument) => instrument.name)).toEqual(["Flauta traversa", "Trompeta"]);
  });
});
