import type { Setlist } from "../../types/domain";

export function softDeleteSetlistById(
  setlists: Setlist[],
  id: string,
  deletedAt = new Date().toISOString(),
): Setlist[] {
  return setlists.map((setlist) => (setlist.id === id ? { ...setlist, deletedAt } : setlist));
}
