import { describe, expect, it } from "vitest";
import { normalizeSetlistSelectedKey } from "./setlist-key";

describe("setlist selected keys", () => {
  it.each([
    ["Em", "Em"],
    ["Am", "Am"],
    ["Bbm", "Bbm"],
    ["Bb", "Bb"],
    ["F#m", "F#m"],
    ["Mi menor", "Em"],
    ["", null],
    ["H", null],
  ])("normalizes %s for Supabase", (input, expected) => {
    expect(normalizeSetlistSelectedKey(input)).toBe(expected);
  });
});
