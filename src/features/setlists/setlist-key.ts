import { normalizeSongKey } from "../songs/song-mapper";

export function normalizeSetlistSelectedKey(value?: string): string | null {
  return normalizeSongKey(value);
}
