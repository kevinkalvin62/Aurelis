import { dateToISO, isISODate } from "../../lib/dates";
import type { Setlist } from "../../types/domain";

export type SetlistTemporalStatus = "upcoming" | "past" | "undated" | "deleted";

export interface SetlistTimeSections {
  upcoming: Setlist[];
  undated: Setlist[];
  past: Setlist[];
}

export function getSetlistTemporalStatus(
  setlist: Pick<Setlist, "serviceDate" | "deletedAt">,
  today = new Date(),
): SetlistTemporalStatus {
  if (setlist.deletedAt) return "deleted";
  if (!setlist.serviceDate || !isISODate(setlist.serviceDate)) return "undated";
  return setlist.serviceDate >= dateToISO(today) ? "upcoming" : "past";
}

export function splitSetlistsByTime(setlists: Setlist[], today = new Date()): SetlistTimeSections {
  const sections: SetlistTimeSections = {
    upcoming: [],
    undated: [],
    past: [],
  };

  for (const setlist of setlists) {
    const status = getSetlistTemporalStatus(setlist, today);
    if (status === "deleted") continue;
    sections[status].push(setlist);
  }

  sections.upcoming.sort(compareUpcomingSetlists);
  sections.undated.sort(compareStableSetlists);
  sections.past.sort(comparePastSetlists);
  return sections;
}

function compareUpcomingSetlists(left: Setlist, right: Setlist): number {
  return left.serviceDate!.localeCompare(right.serviceDate!) || compareStableSetlists(left, right);
}

function comparePastSetlists(left: Setlist, right: Setlist): number {
  return right.serviceDate!.localeCompare(left.serviceDate!) || compareStableSetlists(left, right);
}

function compareStableSetlists(left: Setlist, right: Setlist): number {
  return left.title.localeCompare(right.title, "es");
}
