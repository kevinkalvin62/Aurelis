import { describe, expect, it } from "vitest";

import {
  getDisplayLines,
  inlineToAlignedLines,
  isChordLine,
  isChordToken,
  transposeContent,
  transposeMelody,
  transposeNotationChord,
} from "./notation";

describe("notation-aware chord engine", () => {
  it("transposes American and Latin chords", () => {
    expect(transposeNotationChord("Dmaj7/F#", 2, "american")).toBe("Emaj7/G#");
    expect(transposeNotationChord("REm7/FA", 2, "latin")).toBe("MIm7/SOL");
  });

  /* it("recognizes an aligned LaCuerda chord row", () => {
    expect(isChordLine("DO              LAm   DO", "latin")).toBe(true);
    expect(isChordLine("Tú decías que me amabas", "latin")).toBe(false);
  }); */

  /* it("preserves lyric spacing while transposing only chord rows", () => {
    const source = "D0       Am\nTú decías que me amabas";
    expect(transposeContent(source, 2, "lyrics_chords", "american")).toBe(
      "E0       Bm\nTú decías que me amabas",
    );
  }); */

  it("aligns legacy bracket chords over lyrics", () => {
    expect(inlineToAlignedLines("[G]Hola [D]mundo")).toEqual(["G    D", "Hola mundo"]);
  });
});

describe("wind melody sequences", () => {
  it("transposes notes while retaining every articulation symbol", () => {
    expect(transposeMelody("/////DEFEDA///// AGFGAGF E", 2, "american")).toBe(
      "/////EF#GF#EB///// BAGABAG F#",
    );
  });

  it("does not mistake words for note sequences", () => {
    expect(transposeMelody("Final D-CD.", 2, "american")).toBe("Final E-DE.");
  });

  it("classifies sequence rows for the dedicated renderer", () => {
    expect(
      getDisplayLines("AGFG\nCD.", "wind_notes", "american").every(
        (line) => line.kind === "melody",
      ),
    ).toBe(true);
  });
});

describe("notation helpers extra coverage", () => {
  describe("isChordToken", () => {
    it("recognizes chord and bar tokens", () => {
      expect(isChordToken("C", "american")).toBe(true);
      expect(isChordToken("Bbmaj7", "american")).toBe(true);
      expect(isChordToken("|", "american")).toBe(true);
      expect(isChordToken("//", "american")).toBe(true);
      expect(isChordToken("DO", "latin")).toBe(true);
      expect(isChordToken("SOL#m", "latin")).toBe(true);
      expect(isChordToken("hello", "american")).toBe(false);
    });
  });

  describe("isChordLine", () => {
    it("detects full chord lines", () => {
      expect(isChordLine("C G Am F", "american")).toBe(true);
      expect(isChordLine("DO SOL LAm FA", "latin")).toBe(true);
    });

    it("rejects lyric lines", () => {
      expect(isChordLine("This is a lyric line", "american")).toBe(false);
      expect(isChordLine("", "american")).toBe(false);
    });
  });

  describe("transposeMelody", () => {
    it("returns the same content when semitones is zero", () => {
      expect(transposeMelody("C D E", 0, "american")).toBe("C D E");
    });

    it("transposes american wind notes", () => {
      expect(transposeMelody("C D E", 2, "american")).toBe("D E F#");
    });

    it("transposes latin wind notes", () => {
      expect(transposeMelody("DO RE MI", 2, "latin")).toBe("RE MI FA#");
    });

    it("preserves text while transposing valid note segments", () => {
      expect(transposeMelody("Intro C D", 2, "american")).toBe("Intro D E");
    });
  });

  describe("transposeContent", () => {
    it("transposes inline bracket chords", () => {
      expect(transposeContent("[C]Hola [G]mundo", 2, "lyrics_chords", "american")).toBe(
        "[D]Hola [A]mundo",
      );
    });

    it("transposes chord-only lines but preserves lyrics", () => {
      const content = ["C G", "Hello world"].join("\n");

      const result = transposeContent(content, 2, "lyrics_chords", "american");

      expect(result).toBe(["D A", "Hello world"].join("\n"));
    });
  });

  describe("inlineToAlignedLines", () => {
    it("separates inline chords from lyrics", () => {
      const [chords, lyric] = inlineToAlignedLines("[C]Hola [G]mundo");

      expect(chords).toContain("C");
      expect(chords).toContain("G");
      expect(lyric).toBe("Hola mundo");
    });

    it("keeps plain lyrics unchanged", () => {
      const [chords, lyric] = inlineToAlignedLines("Hola mundo");

      expect(chords).toBe("");
      expect(lyric).toBe("Hola mundo");
    });
  });

  describe("getDisplayLines", () => {
    it("returns melody rows for wind notes", () => {
      expect(getDisplayLines("C D E\n\nF G", "wind_notes", "american")).toEqual([
        { kind: "melody", value: "C D E" },
        { kind: "space", value: "" },
        { kind: "melody", value: "F G" },
      ]);
    });

    it("converts inline chord lyrics into aligned rows", () => {
      const result = getDisplayLines("[C]Hola", "lyrics_chords", "american");

      expect(result).toEqual([
        { kind: "chord", value: "C" },
        { kind: "lyric", value: "Hola" },
      ]);
    });

    it("classifies chords, lyrics and blank rows", () => {
      const result = getDisplayLines(
        ["C G Am F", "Hello world", ""].join("\n"),
        "lyrics_chords",
        "american",
      );

      expect(result).toEqual([
        { kind: "chord", value: "C G Am F" },
        { kind: "lyric", value: "Hello world" },
        { kind: "space", value: "" },
      ]);
    });
  });
});
