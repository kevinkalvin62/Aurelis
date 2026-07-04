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

export const songEditorSamples: Record<SongContentType, Record<MusicNotation, string>> = {
  lyrics_chords: {
    american:
      "C               Am    C\nTú decías que me amabas, pero era\n       G7\nmentira y con otro me engañabas,",
    latin:
      "DO              LAm   DO\nTú decías que me amabas, pero era\n       SOL7\nmentira y con otro me engañabas,",
  },
  chords_only: {
    american: "C   G/B   Am7   Fadd9\nC   G     F     G",
    latin: "DO   SOL/SI   LAm7   FAadd9\nDO   SOL      FA       SOL",
  },
  wind_notes: {
    american: "/////DEFEDA///// AGFGAGF E\nCD. DACD\nA A#  A# F A A#",
    latin: "/////RE MI FA MI RE LA/////\nDO RE.  RE LA DO RE",
  },
};

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
    content: song?.content ?? songEditorSamples.lyrics_chords.american,
  };
}
