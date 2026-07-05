import { isISODate } from "../../lib/dates";

export function firstDisplayName(displayName: string | undefined, fallback = "Músico"): string {
  return displayName?.trim().split(/\s+/)[0] || fallback;
}

export function homeProgramCta(serviceDate: string | undefined, today = new Date()): string {
  if (!serviceDate || !isISODate(serviceDate)) return "Abrir setlist  ›";
  const todayIso = localIsoDate(today);
  if (serviceDate === todayIso) return "Abrir programa  ›";
  if (serviceDate > todayIso) return "Prepararme  ›";
  return "Abrir setlist  ›";
}

function localIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
