import type { Setlist } from "@/types/domain";
import { splitSetlistsByTime } from "./setlist-time";

export function selectNextSetlist(setlists: Setlist[], today = new Date()): Setlist | undefined {
  return splitSetlistsByTime(setlists, today).upcoming[0];
}
