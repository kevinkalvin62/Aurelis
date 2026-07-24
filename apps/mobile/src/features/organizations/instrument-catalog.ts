import type { Instrument } from "@/types/domain";

const HIDDEN_PHYSICAL_INSTRUMENT_NAMES = new Set([
  "clarinete",
  "clarinete bb",
  "flauta",
  "flauta transversal",
]);

function normalizeInstrumentCatalogName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function isSelectablePhysicalInstrument(instrument: Pick<Instrument, "name">): boolean {
  return !HIDDEN_PHYSICAL_INSTRUMENT_NAMES.has(normalizeInstrumentCatalogName(instrument.name));
}

export function listSelectablePhysicalInstruments<T extends Pick<Instrument, "name">>(
  instruments: T[],
): T[] {
  return instruments.filter(isSelectablePhysicalInstrument);
}
