import { describe, expect, it } from "vitest";
import { getSongEditorDefaults, songEditorSchema } from "./song-editor-model";

describe("song editor model", () => {
  it("uses organization visibility for a new organization song", () => {
    const defaults = getSongEditorDefaults(undefined, "organization-1");
    expect(defaults.visibility).toBe("organization");
    expect(defaults.content).toBe("");
  });

  it("keeps the existing song values", () => {
    const defaults = getSongEditorDefaults(
      {
        id: "song-1",
        title: "Song",
        artist: "Artist",
        key: "Bb",
        bpm: 90,
        visibility: "public",
        updatedAt: "Ahora",
        content: "Bb F Gm Eb",
        contentType: "chords_only",
        notation: "american",
        sourceInstrumentName: "Trumpet Bb",
      },
      undefined,
    );

    expect(defaults).toMatchObject({
      title: "Song",
      key: "Bb",
      visibility: "public",
      contentType: "chords_only",
    });
  });

  it("rejects incomplete values", () => {
    expect(
      songEditorSchema.safeParse({
        ...getSongEditorDefaults(undefined, undefined),
        title: "A",
        content: "",
      }).success,
    ).toBe(false);
  });
});
