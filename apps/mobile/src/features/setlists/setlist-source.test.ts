import { describe, expect, it } from "vitest";
import { decodeSetlistSource, encodeSetlistSource } from "./setlist-source";

describe("setlist source metadata", () => {
  it("keeps pasted text and general notes together", () => {
    const encoded = encodeSetlistSource("Lista domingo", "Entrada con piano");
    expect(decodeSetlistSource(encoded)).toEqual({
      sourceText: "Lista domingo",
      notes: "Entrada con piano",
    });
  });

  it("keeps legacy plain source text readable", () => {
    expect(decodeSetlistSource("Lista antigua")).toEqual({ sourceText: "Lista antigua" });
  });
});
