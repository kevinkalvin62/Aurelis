import type { Song } from "@/types/domain";

export function normalizeSongSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-MX")
    .trim()
    .replace(/\s+/g, " ");
}

export function searchSongs(songs: Song[], query: string): Song[] {
  const normalizedQuery = normalizeSongSearch(query);
  if (!normalizedQuery) return songs;

  return songs
    .map((song, index) => ({ song, index, score: songSearchScore(song, normalizedQuery) }))
    .filter((result) => result.score !== null)
    .sort((left, right) => left.score! - right.score! || left.index - right.index)
    .map((result) => result.song);
}

function songSearchScore(song: Song, query: string): number | null {
  const title = normalizeSongSearch(song.title);
  const artist = normalizeSongSearch(song.artist);
  if (title === query) return 0;
  if (title.startsWith(query)) return 1;
  if (title.includes(query)) return 2;
  if (artist === query) return 3;
  if (artist.startsWith(query)) return 4;
  if (artist.includes(query)) return 5;
  return null;
}
