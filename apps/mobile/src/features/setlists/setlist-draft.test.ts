import { describe, expect, it } from "vitest";
import {
  createDraftEntry,
  moveDraftEntry,
  toLocalSetlistItems,
  toRemoteSetlistItems,
} from "./setlist-draft";

const song = {
  id: "local-song",
  remoteId: "remote-song",
  title: "Song",
  artist: "",
  key: "C",
  bpm: 80,
  visibility: "private" as const,
  updatedAt: "Ahora",
  content: "C F G",
  contentType: "chords_only" as const,
  notation: "american" as const,
  sourceInstrumentName: "Concert",
};

describe("setlist draft", () => {
  it("links a draft entry with its current song key", () => {
    expect(createDraftEntry("Song", { ...song, currentKey: "D" }, "entry-1")).toMatchObject({
      clientId: "entry-1",
      songId: "local-song",
      selectedKey: "D",
    });
  });

  it("moves entries without mutating the source", () => {
    const source = [
      createDraftEntry("One", undefined, "1"),
      createDraftEntry("Two", undefined, "2"),
    ];
    const moved = moveDraftEntry(source, "2", -1);
    expect(moved.map((entry) => entry.clientId)).toEqual(["2", "1"]);
    expect(source.map((entry) => entry.clientId)).toEqual(["1", "2"]);
  });

  it("removes client ids locally and maps remote song ids remotely", () => {
    const entries = [createDraftEntry("Song", song, "entry-1")];
    expect(toLocalSetlistItems(entries)[0]).not.toHaveProperty("clientId");
    expect(toRemoteSetlistItems(entries, [song])[0]).toMatchObject({ songId: "remote-song" });
  });
});
