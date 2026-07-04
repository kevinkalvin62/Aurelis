import { describe, expect, it } from "vitest";
import {
  buildSongContentStructured,
  mapRemoteSong,
  normalizeSongKey,
  songPayload,
} from "./song-mapper";
import type { Song } from "@/types/domain";

const song: Song = {
  id: "local-1",
  title: "Viento",
  artist: "Kevin",
  key: "D",
  bpm: 96,
  visibility: "private",
  updatedAt: "Ahora",
  content: "DEFEDA / AGFGAGF",
  contentType: "wind_notes",
  notation: "american",
  sourceInstrumentName: "Concert",
};

describe("Supabase song mapping", () => {
  it("stores app metadata in content_structured", () => {
    const payload = songPayload(song, "user-1");
    expect(payload).not.toHaveProperty("source_instrument_name");
    expect(payload).toMatchObject({
      user_id: "user-1",
      organization_id: null,
      content_structured: [
        {
          schema_version: 1,
          type: "wind_notes",
          notation: "american",
          bpm: 96,
          lines: [{ raw: "DEFEDA / AGFGAGF" }],
        },
      ],
    });
  });

  it("restores type, notation and bpm from content_structured", () => {
    expect(
      mapRemoteSong({
        id: "song-1",
        user_id: "user-1",
        organization_id: null,
        title: "Viento",
        artist: "Kevin",
        original_key: "D",
        current_key: "E",
        content_raw: "DEFEDA",
        content_structured: [{ version: 1, type: "wind_notes", notation: "american", bpm: 96 }],
        song_versions: [
          { version: 1, source_instrument_name: "Concert" },
          { version: 2, source_instrument_name: "Trompeta Bb" },
        ],
        visibility: "private",
        updated_at: "2026-06-29T00:00:00.000Z",
      }),
    ).toMatchObject({
      id: "remote-song-1",
      remoteId: "song-1",
      contentType: "wind_notes",
      notation: "american",
      bpm: 96,
      currentKey: "E",
      sourceInstrumentName: "Trompeta Bb",
    });
  });

  it("uses safe defaults for legacy content", () => {
    expect(
      mapRemoteSong({
        id: "song-2",
        user_id: "user-1",
        organization_id: null,
        title: "Legado",
        artist: null,
        original_key: null,
        current_key: null,
        content_raw: "",
        content_structured: null,
        visibility: "private",
        updated_at: "2026-06-29T00:00:00.000Z",
      }),
    ).toMatchObject({
      contentType: "lyrics_chords",
      notation: "american",
      bpm: 80,
      key: "C",
    });
  });

  it("normalizes Latin and rejects invalid database keys", () => {
    expect(normalizeSongKey("Do#")).toBe("C#");
    expect(normalizeSongKey("Sol")).toBe("G");
    expect(normalizeSongKey("sib")).toBe("Bb");
    expect(normalizeSongKey("Em")).toBe("Em");
    expect(normalizeSongKey("E minor")).toBe("Em");
    expect(normalizeSongKey("Mi menor")).toBe("Em");
    expect(normalizeSongKey("Do mayor")).toBe("C");
    expect(normalizeSongKey("Bb")).toBe("Bb");
    expect(normalizeSongKey("F#m")).toBe("F#m");
    expect(normalizeSongKey("H")).toBeNull();
    expect(normalizeSongKey("")).toBeNull();
  });

  it("sends an empty optional key as null", () => {
    expect(songPayload({ ...song, key: "" }, "user-1")).toMatchObject({
      original_key: null,
      current_key: null,
    });
  });

  it("always builds a JSON array and uses an empty array without content", () => {
    expect(
      buildSongContentStructured({
        contentRaw: "",
        contentType: "wind_notes",
        notation: "american",
        bpm: 80,
      }),
    ).toEqual([]);
    expect(
      Array.isArray(
        buildSongContentStructured({
          contentRaw: "C D",
          contentType: "wind_notes",
          notation: "american",
          bpm: 80,
        }),
      ),
    ).toBe(true);
  });
});
