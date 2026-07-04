import { supabase } from "@/lib/supabase";
import type { SetlistDraftItem } from "@/types/domain";
import { isISODate } from "@/lib/dates";
import { encodeSetlistSource } from "./setlist-source";
import { normalizeSetlistSelectedKey } from "./setlist-key";

export async function createRemoteSetlist(input: {
  organizationId: string;
  title: string;
  serviceDate?: string;
  notes?: string;
  sourceText?: string;
  items: SetlistDraftItem[];
}): Promise<{ id?: string; error?: string }> {
  if (input.serviceDate && !isISODate(input.serviceDate))
    return { error: "La fecha no es válida." };
  if (!input.serviceDate) return { error: "Selecciona una fecha para el programa." };
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { error: "Tu sesión expiró. Inicia sesión nuevamente." };
  const sourceText = encodeSetlistSource(input.sourceText, input.notes);
  const { data, error } = await supabase
    .from("setlists")
    .insert({
      organization_id: input.organizationId,
      title: input.title,
      service_date: input.serviceDate,
      source_text: sourceText ?? "",
      created_by: userData.user.id,
    })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message ?? "No fue posible crear el programa." };

  const id = String(data.id);
  if (input.items.length) {
    const rows = input.items.map((item, position) => ({
      setlist_id: id,
      song_id: item.songId || null,
      source_title: item.titleSnapshot,
      title_snapshot: item.titleSnapshot,
      position,
      selected_key: normalizeSetlistSelectedKey(item.selectedKey),
      notes: item.notes || "",
    }));
    const { error: itemsError } = await supabase.from("setlist_items").insert(rows);
    if (itemsError) {
      await supabase.from("setlists").delete().eq("id", id);
      return { error: itemsError.message };
    }
  }
  return { id };
}

export async function deleteRemoteSetlist(id: string): Promise<string | null> {
  const { error } = await supabase.from("setlists").delete().eq("id", id);
  return error?.message ?? null;
}

export async function linkRemoteSetlistItem(
  itemId: string,
  songId: string,
): Promise<string | null> {
  const { error } = await supabase
    .from("setlist_items")
    .update({ song_id: songId })
    .eq("id", itemId);
  return error?.message ?? null;
}
