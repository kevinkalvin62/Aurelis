import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { listOrganizationSongs } from "@/features/organizations/organization-service";
import { useAuthStore } from "@/store/auth-store";
import { useSetlistStore } from "@/store/setlist-store";
import { useSongStore } from "@/store/song-store";
import { toast } from "@/store/toast-store";
import type { Song } from "@/types/domain";
import { parsePastedSetlist } from "./parser";
import {
  createDraftEntry,
  moveDraftEntry,
  toLocalSetlistItems,
  toRemoteSetlistItems,
  type SetlistCreationMode,
  type SetlistDraftEntry,
} from "./setlist-draft";
import { createRemoteSetlist } from "./setlist-service";

export function useSetlistCreator(organizationId?: string, initialMode?: SetlistCreationMode) {
  const accessMode = useAuthStore((state) => state.accessMode);
  const queryClient = useQueryClient();
  const allLocalSongs = useSongStore((state) => state.songs);
  const localSongs = useMemo(
    () => allLocalSongs.filter((song) => !song.organizationId),
    [allLocalSongs],
  );
  const createLocal = useSetlistStore((state) => state.createSetlist);
  const { data: organizationSongs = [] } = useQuery({
    queryKey: ["organization-songs", organizationId],
    queryFn: () => listOrganizationSongs(organizationId!),
    enabled: Boolean(organizationId && accessMode === "authenticated"),
  });
  const songs = organizationId ? organizationSongs : localSongs;
  const [mode, setMode] = useState<SetlistCreationMode>(
    initialMode === "import" ? "import" : "manual",
  );
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [source, setSource] = useState("");
  const [freeTitle, setFreeTitle] = useState("");
  const [entries, setEntries] = useState<SetlistDraftEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const parsed = useMemo(() => parsePastedSetlist(source, songs), [source, songs]);

  const addFreeEntry = () => {
    const value = freeTitle.trim();
    if (!value) {
      toast.warning("Escribe el nombre de la canción.");
      return;
    }
    setEntries((current) => [...current, createDraftEntry(value)]);
    setFreeTitle("");
    toast.info("Canción agregada como texto libre.");
  };

  const addLibrarySong = (song: Song) =>
    setEntries((current) => [...current, createDraftEntry(song.title, song)]);

  const importList = () => {
    if (!parsed.matches.length) {
      toast.warning("Pega al menos una canción.");
      return;
    }
    if (!title && parsed.title) setTitle(parsed.title);
    setEntries(parsed.matches.map((match) => createDraftEntry(match.line, match.song)));
    const linked = parsed.matches.filter((match) => match.song).length;
    const free = parsed.matches.length - linked;
    toast.info(`${linked} coincidencias; ${free} canciones se conservarán como texto libre.`);
  };

  const move = (clientId: string, delta: number) =>
    setEntries((current) => moveDraftEntry(current, clientId, delta));
  const remove = (clientId: string) =>
    setEntries((current) => current.filter((item) => item.clientId !== clientId));

  const submit = async () => {
    if (title.trim().length < 2) {
      toast.error("Escribe un título para el programa.");
      return;
    }
    if (!entries.length) {
      toast.warning("Agrega al menos una canción al programa.");
      return;
    }
    setSaving(true);
    if (organizationId) {
      if (accessMode !== "authenticated") {
        setSaving(false);
        toast.warning("Necesitas iniciar sesión para usar esta función.");
        router.replace("/auth");
        return;
      }
      const result = await createRemoteSetlist({
        organizationId,
        title: title.trim(),
        ...(date ? { serviceDate: date } : {}),
        ...(notes ? { notes } : {}),
        ...(mode === "import" ? { sourceText: source } : {}),
        items: toRemoteSetlistItems(entries, songs),
      });
      setSaving(false);
      if (!result.id) {
        toast.error(result.error ?? "No fue posible crear el programa.");
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: ["organization-setlists", organizationId],
      });
      await queryClient.invalidateQueries({ queryKey: ["organization-setlists-all"] });
      toast.success("Programa creado con todo su orden.");
      router.replace({
        pathname: "/setlist/[id]",
        params: { id: result.id, organizationId },
      });
      return;
    }
    const created = createLocal({
      title: title.trim(),
      ...(date ? { serviceDate: date } : {}),
      ...(notes ? { notes } : {}),
      ...(mode === "import" ? { sourceText: source } : {}),
      items: toLocalSetlistItems(entries),
    });
    setSaving(false);
    toast.success("Programa guardado en este dispositivo.");
    router.replace({ pathname: "/setlist/[id]", params: { id: created.id } });
  };

  return {
    addFreeEntry,
    addLibrarySong,
    date,
    entries,
    freeTitle,
    importList,
    mode,
    move,
    notes,
    parsed,
    remove,
    saving,
    setDate,
    setEntries,
    setFreeTitle,
    setMode,
    setNotes,
    setSource,
    setTitle,
    songs,
    source,
    submit,
    title,
  };
}
