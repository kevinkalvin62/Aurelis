import { z } from "zod";
import type { MusicNotation, Song, SongContentType } from "@/types/domain";

export const songEditorSchema = z.object({
  title: z.string().trim().min(2),
  artist: z.string().trim(),
  key: z.string().trim(),
  sourceInstrumentName: z.string().trim().min(1),
  contentType: z.enum(["lyrics_chords", "chords_only", "wind_notes"]),
  notation: z.enum(["american", "latin"]),
  visibility: z.enum(["private", "public", "organization"]),
  content: z.string().trim().min(4),
});

export type SongEditorValues = z.infer<typeof songEditorSchema>;

export const songContentTypes: {
  value: SongContentType;
  label: string;
  mark: string;
}[] = [
  { value: "lyrics_chords", label: "Letra + acordes", mark: "Aa" },
  { value: "chords_only", label: "Sólo acordes", mark: "♯" },
  { value: "wind_notes", label: "Notas de viento", mark: "♪" },
];

export const songNotations: {
  value: MusicNotation;
  label: string;
  example: string;
}[] = [
  { value: "american", label: "Americana", example: "C · D · E" },
  { value: "latin", label: "Latina", example: "DO · RE · MI" },
];

export function getSongEditorDefaults(
  song: Song | undefined,
  organizationId: string | undefined,
): SongEditorValues {
  return {
    title: song?.title ?? "",
    artist: song?.artist ?? "",
    key: song?.key ?? "C",
    sourceInstrumentName: song?.sourceInstrumentName ?? "Concert",
    contentType: song?.contentType ?? "lyrics_chords",
    notation: song?.notation ?? "american",
    visibility: song?.visibility ?? (organizationId ? "organization" : "private"),
    content: song?.content ?? "",
  };
}
