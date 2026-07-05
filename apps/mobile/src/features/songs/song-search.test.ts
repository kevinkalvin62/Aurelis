import { describe, expect, it } from "vitest";
import type { Song } from "@/types/domain";
import { normalizeSongSearch, searchSongs } from "./song-search";

const song = (id: string, title: string, artist = ""): Song => ({
  id,
  title,
  artist,
  key: "C",
  bpm: 80,
  visibility: "private",
  updatedAt: "Ahora",
  content: "C F G",
  contentType: "chords_only",
  notation: "american",
  sourceInstrumentName: "Concert",
});

describe("song search", () => {
  const songs = [
    song("partial", "Mi canción favorita", "Ana"),
    song("artist", "Alabanza", "Canción Nueva"),
    song("prefix", "Canción de paz", "Luis"),
    song("exact", "Canción", "María"),
  ];

  it("normalizes accents, case and repeated spaces", () => {
    expect(normalizeSongSearch("  CANCIÓN   Nueva ")).toBe("cancion nueva");
  });

  it("ranks exact and title matches before artist matches", () => {
    expect(searchSongs(songs, "cancion").map((item) => item.id)).toEqual([
      "exact",
      "prefix",
      "partial",
      "artist",
    ]);
  });

  it("finds artists without accents", () => {
    expect(searchSongs(songs, "maria").map((item) => item.id)).toEqual(["exact"]);
  });

  it("keeps the original order for an empty query", () => {
    expect(searchSongs(songs, " ")).toBe(songs);
  });
});
