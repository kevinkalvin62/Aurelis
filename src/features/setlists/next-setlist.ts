import type { Setlist } from "@/types/domain";

export function selectNextSetlist(setlists: Setlist[], today = new Date()): Setlist | undefined {
  const todayIso = localIsoDate(today);
  const upcoming = setlists
    .filter((setlist) => setlist.serviceDate && setlist.serviceDate >= todayIso)
    .sort((left, right) => left.serviceDate!.localeCompare(right.serviceDate!));
  if (upcoming[0]) return upcoming[0];
  return (
    setlists.find((setlist) => !setlist.serviceDate) ??
    [...setlists]
      .filter((setlist) => setlist.serviceDate)
      .sort((left, right) => right.serviceDate!.localeCompare(left.serviceDate!))[0]
  );
}

function localIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
