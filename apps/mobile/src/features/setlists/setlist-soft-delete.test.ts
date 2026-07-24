import { describe, expect, it } from "vitest";
import { splitSetlistsByTime } from "./setlist-time";
import { softDeleteSetlistById } from "./setlist-soft-delete";
import type { Setlist } from "../../types/domain";

const setlist = (id: string, serviceDate?: string): Setlist => ({
  id,
  title: id,
  dateLabel: "",
  time: "",
  location: "",
  songIds: ["song-1"],
  peopleCount: 1,
  notes: "Notas históricas",
  items: [{ id: `${id}-item`, setlistId: id, position: 0, titleSnapshot: "Canto 1" }],
  ...(serviceDate ? { serviceDate } : {}),
});

describe("setlist soft delete", () => {
  it("marks a local setlist as deleted without removing its historical data", () => {
    const result = softDeleteSetlistById(
      [setlist("past", "2026-07-01")],
      "past",
      "2026-07-23T12:00:00.000Z",
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.deletedAt).toBe("2026-07-23T12:00:00.000Z");
    expect(result[0]?.items?.[0]?.titleSnapshot).toBe("Canto 1");
    expect(result[0]?.notes).toBe("Notas históricas");
  });

  it("excludes soft-deleted setlists from visible temporal sections", () => {
    const result = softDeleteSetlistById(
      [setlist("past", "2026-07-01")],
      "past",
      "2026-07-23T12:00:00.000Z",
    );

    const sections = splitSetlistsByTime(result, new Date(2026, 6, 23));
    expect(sections.upcoming).toEqual([]);
    expect(sections.undated).toEqual([]);
    expect(sections.past).toEqual([]);
  });

  it("keeps old persisted setlists without deletedAt compatible", () => {
    const legacySetlist = setlist("future", "2026-07-24");
    delete legacySetlist.deletedAt;

    const sections = splitSetlistsByTime([legacySetlist], new Date(2026, 6, 23));

    expect(sections.upcoming.map((item) => item.id)).toEqual(["future"]);
  });
});
