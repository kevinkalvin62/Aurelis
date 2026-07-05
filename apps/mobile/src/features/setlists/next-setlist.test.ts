import { describe, expect, it } from "vitest";
import { selectNextSetlist } from "./next-setlist";
import type { Setlist } from "@/types/domain";

const setlist = (id: string, serviceDate?: string): Setlist => ({
  id,
  title: id,
  dateLabel: "",
  time: "",
  location: "",
  songIds: [],
  peopleCount: 0,
  ...(serviceDate ? { serviceDate } : {}),
});

describe("selectNextSetlist", () => {
  it("chooses the nearest future program across sources", () => {
    expect(
      selectNextSetlist(
        [setlist("local", "2026-07-12"), setlist("organization", "2026-07-05")],
        new Date(2026, 6, 1),
      )?.id,
    ).toBe("organization");
  });

  it("falls back to an undated program", () => {
    expect(
      selectNextSetlist([setlist("past", "2026-06-01"), setlist("undated")], new Date(2026, 6, 1))
        ?.id,
    ).toBe("undated");
  });
});
