import { describe, expect, it } from "vitest";
import { parsePastedSetlist } from "./parser";
import type { Song } from "@/types/domain";

const song = (id: string, title: string): Song => ({
  id,
  title,
  artist: "",
  key: "C",
  bpm: 80,
  visibility: "private",
  updatedAt: "",
  content: "",
  contentType: "lyrics_chords",
  notation: "american",
  sourceInstrumentName: "Concert",
});

describe("parsePastedSetlist", () => {
  const library = [song("1", "Digno y Santo"), song("2", "Gracia Sublime")];
  it("extracts a title and exact normalized matches", () => {
    const parsed = parsePastedSetlist(
      "Domingo AM\n- Digno y Santo\n2. Gracia Sublime",
      library,
    );
    expect(parsed.title).toBe("Domingo AM");
    expect(parsed.matches.map((item) => item.song?.id)).toEqual(["1", "2"]);
  });
  it("handles accents and leaves unknown songs unconfirmed", () => {
    const parsed = parsePastedSetlist(
      "Ensayo\nGrácia Sublime\nCanción inexistente",
      library,
    );
    expect(parsed.matches[0]?.song?.id).toBe("2");
    expect(parsed.matches[1]?.song).toBeUndefined();
  });
  it("keeps every line when the pasted list has no header", () => {
    const parsed = parsePastedSetlist(
      "1. Digno y Santo\n2. Canción Nueva",
      library,
    );
    expect(parsed.title).toBe("");
    expect(parsed.matches.map((item) => item.line)).toEqual([
      "Digno y Santo",
      "Canción Nueva",
    ]);
    expect(parsed.matches[0]?.song?.id).toBe("1");
    expect(parsed.matches[1]?.song).toBeUndefined();
  });
});
