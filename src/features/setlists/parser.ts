import type { Song } from '@/types/domain';

export interface ParsedSetlistLine { line: string; song?: Song }

export function normalizeSongTitle(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

export function parsePastedSetlist(source: string, songs: Song[]): { title: string; matches: ParsedSetlistLine[] } {
  const lines = source.split(/\r?\n/).map((line) => line.replace(/^\s*(?:[-*•]+|\d+[.)])\s*/, '').trim()).filter(Boolean);
  const first = lines[0] ?? '';
  const hasHeader = /:$/.test(first) || /^(lista|programa|setlist|ensayo|domingo|servicio|evento)\b/i.test(first);
  const title = hasHeader ? first.replace(/:$/, '').trim() : '';
  const itemLines = hasHeader ? lines.slice(1) : lines;
  const matches = itemLines.map((line): ParsedSetlistLine => {
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
