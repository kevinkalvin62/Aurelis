import type { Song } from '@/types/domain';

export interface ParsedSetlistLine { line: string; song?: Song }

export function normalizeSongTitle(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

export function parsePastedSetlist(source: string, songs: Song[]): { title: string; matches: ParsedSetlistLine[] } {
  const lines = source.split(/\r?\n/).map((line) => line.replace(/^[-*•\d.)\s]+/, '').trim()).filter(Boolean);
  const title = lines[0] ?? '';
  const matches = lines.slice(1).map((line): ParsedSetlistLine => {
    const target = normalizeSongTitle(line);
    const exact = songs.find((song) => normalizeSongTitle(song.title) === target);
    const partial = exact ?? songs.find((song) => {
      const candidate = normalizeSongTitle(song.title);
      return target.length >= 4 && (candidate.includes(target) || target.includes(candidate));
    });
    return partial ? { line, song: partial } : { line };
  });
  return { title, matches };
}
