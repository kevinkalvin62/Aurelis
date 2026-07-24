import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { router } from "expo-router";
import { canAdministerOrganization } from "@/features/organizations/permissions";
import { listMyOrganizations } from "@/features/organizations/organization-service";
import { useAuthStore } from "@/store/auth-store";
import { useSongStore } from "@/store/song-store";
import { toast } from "@/store/toast-store";
import type { MusicNotation, SongContentType } from "@/types/domain";
import { normalizeSongKey } from "./song-mapper";
import { deleteRemoteSong, syncSong } from "./song-sync";
import {
  getSongEditorDefaults,
  songEditorSchema,
  type SongEditorValues,
} from "./song-editor-model";

export function useSongEditor(id?: string, organizationId?: string) {
  const queryClient = useQueryClient();
  const songs = useSongStore((state) => state.songs);
  const saveSong = useSongStore((state) => state.saveSong);
  const markSyncPending = useSongStore((state) => state.markSyncPending);
  const markSynced = useSongStore((state) => state.markSynced);
  const deleteSong = useSongStore((state) => state.deleteSong);
  const restoreSong = useSongStore((state) => state.restoreSong);
  const { accessMode, user } = useAuthStore();
  const song = songs.find((item) => item.id === id);
  const effectiveOrganizationId = organizationId || song?.organizationId;
  const { data: organizations = [] } = useQuery({
    queryKey: ["organizations", user?.id],
    queryFn: listMyOrganizations,
    enabled: Boolean(effectiveOrganizationId && accessMode === "authenticated"),
  });
  const membership = organizations.find(
    (organization) => organization.id === effectiveOrganizationId,
  );
  const canDelete = Boolean(
    song &&
    (!effectiveOrganizationId
      ? !song.ownerUserId || song.ownerUserId === user?.id
      : canAdministerOrganization(membership?.role)),
  );
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const form = useForm<SongEditorValues>({
    defaultValues: getSongEditorDefaults(song, organizationId),
  });
  const contentType = useWatch({ control: form.control, name: "contentType" });
  const notation = useWatch({ control: form.control, name: "notation" });
  const sourceInstrumentName = useWatch({
    control: form.control,
    name: "sourceInstrumentName",
  });

  const chooseContentType = (value: SongContentType) => {
    form.setValue("contentType", value, { shouldDirty: true });
  };

  const chooseNotation = (value: MusicNotation) => {
    form.setValue("notation", value, { shouldDirty: true });
  };

  const submit = form.handleSubmit(
    async (values) => {
      const result = songEditorSchema.safeParse(values);
      if (!result.success) {
        toast.error("Completa título, tono y contenido antes de guardar.");
        return;
      }
      const normalizedKey = normalizeSongKey(result.data.key);
      if (result.data.key && !normalizedKey) {
        toast.error("Usa una tonalidad válida, por ejemplo C, F#, Bb, Do o Sol.");
        return;
      }
      setSaving(true);
      setSaveMessage("");
      const localSong = saveSong(
        {
          title: result.data.title,
          artist: result.data.artist,
          key: normalizedKey ?? "",
          sourceInstrumentName: result.data.sourceInstrumentName,
          bpm: song?.bpm ?? 80,
          visibility: result.data.visibility,
          content: result.data.content,
          contentType: result.data.contentType,
          notation: result.data.notation,
          ...(organizationId || song?.organizationId
            ? {
                organizationId: organizationId || song!.organizationId,
                visibility: "organization" as const,
              }
            : {}),
          ...(song?.favorite !== undefined ? { favorite: song.favorite } : {}),
        },
        song?.id,
      );
      if (accessMode === "authenticated" && user) {
        markSyncPending(localSong.id);
        const synced = await syncSong(localSong, user.id);
        if (synced.remoteId && !synced.error) {
          markSynced(localSong.id, synced.remoteId);
          if (localSong.organizationId)
            await queryClient.invalidateQueries({
              queryKey: ["organization-songs", localSong.organizationId],
            });
          setSaveMessage("Guardada y sincronizada.");
          toast.success("Canción guardada y sincronizada.");
        } else {
          if (song) restoreSong(song);
          else deleteSong(localSong.id);
          setSaving(false);
          const message = localSong.organizationId
            ? "No se pudo guardar en la biblioteca de la organización."
            : "No se pudo guardar la canción en tu biblioteca.";
          setSaveMessage(message);
          toast.error(synced.error ?? message);
          return;
        }
      } else {
        setSaveMessage("Guardada en este dispositivo.");
        toast.success("Canción guardada en este dispositivo.");
      }
      setSaving(false);
      setSaved(true);
      setTimeout(
        () =>
          router.replace({
            pathname: "/song/[id]",
            params: { id: localSong.id },
          }),
        650,
      );
    },
    () => toast.error("Revisa los campos obligatorios."),
  );

  const remove = async () => {
    if (!song) return;
    if (accessMode === "authenticated" && song.remoteId) {
      const error = await deleteRemoteSong(song.remoteId);
      if (error) {
        toast.error("No fue posible eliminar la canción de Supabase.");
        return;
      }
    }
    deleteSong(song.id);
    if (effectiveOrganizationId) {
      await queryClient.invalidateQueries({
        queryKey: ["organization-songs", effectiveOrganizationId],
      });
      toast.success("Canción retirada del repertorio.");
      router.replace({
        pathname: "/organization/[id]",
        params: { id: effectiveOrganizationId },
      });
    } else {
      toast.success("Canción retirada de tu biblioteca.");
      router.replace("/library");
    }
  };

  return {
    ...form,
    canDelete,
    chooseContentType,
    chooseNotation,
    contentType,
    notation,
    remove,
    saved,
    saveMessage,
    saving,
    song,
    sourceInstrumentName,
    submit,
  };
}
