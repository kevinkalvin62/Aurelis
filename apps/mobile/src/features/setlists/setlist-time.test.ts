import { describe, expect, it } from "vitest";
import { getSetlistTemporalStatus, splitSetlistsByTime } from "./setlist-time";
import type { Setlist } from "@/types/domain";

const setlist = (id: string, serviceDate?: string, deletedAt?: string): Setlist => ({
  id,
  title: id,
  dateLabel: "",
  time: "",
  location: "",
  songIds: [],
  peopleCount: 0,
  ...(serviceDate ? { serviceDate } : {}),
  ...(deletedAt ? { deletedAt } : {}),
});

describe("setlist temporal classification", () => {
  const today = new Date(2026, 6, 23);

  it("classifies today and future programs as upcoming", () => {
    expect(getSetlistTemporalStatus(setlist("today", "2026-07-23"), today)).toBe("upcoming");
    expect(getSetlistTemporalStatus(setlist("future", "2026-07-24"), today)).toBe("upcoming");
  });

  it("classifies past programs as history", () => {
    expect(getSetlistTemporalStatus(setlist("past", "2026-07-22"), today)).toBe("past");
  });

  it("classifies undated programs as drafts", () => {
    expect(getSetlistTemporalStatus(setlist("draft"), today)).toBe("undated");
  });

  it("excludes deleted programs from visible sections", () => {
    const sections = splitSetlistsByTime(
      [
        setlist("today", "2026-07-23"),
        setlist("draft"),
        setlist("past", "2026-07-22"),
        setlist("deleted", "2026-07-24", "2026-07-23T12:00:00.000Z"),
      ],
      today,
    );

    expect(sections.upcoming.map((item) => item.id)).toEqual(["today"]);
    expect(sections.undated.map((item) => item.id)).toEqual(["draft"]);
    expect(sections.past.map((item) => item.id)).toEqual(["past"]);
  });

  it("orders upcoming ascending and history descending", () => {
    const sections = splitSetlistsByTime(
      [
        setlist("later", "2026-08-01"),
        setlist("recent-past", "2026-07-22"),
        setlist("soon", "2026-07-24"),
        setlist("older-past", "2026-07-01"),
      ],
      today,
    );

    expect(sections.upcoming.map((item) => item.id)).toEqual(["soon", "later"]);
    expect(sections.past.map((item) => item.id)).toEqual(["recent-past", "older-past"]);
  });
});
