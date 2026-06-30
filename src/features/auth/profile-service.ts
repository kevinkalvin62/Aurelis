import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Instrument, PersonalInstrument, Profile } from "@/types/domain";

export async function ensureProfile(
  user: User,
  displayName?: string,
): Promise<Profile | null> {
  const fallbackName =
    displayName?.trim() ||
    (typeof user.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name
      : "") ||
    user.email?.split("@")[0] ||
    "Músico";
  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(
      {
        user_id: user.id,
        display_name: fallbackName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select("id,user_id,display_name,username")
    .single();
  if (error || !data) return null;
  return {
    id: String(data.id),
    userId: String(data.user_id),
    displayName: String(data.display_name),
    ...(data.username ? { username: String(data.username) } : {}),
  };
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id,user_id,display_name,username")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: String(data.id),
    userId: String(data.user_id),
    displayName: String(data.display_name),
    ...(data.username ? { username: String(data.username) } : {}),
  };
}

export async function listPersonalInstruments(
  userId: string,
): Promise<PersonalInstrument[]> {
  const { data, error } = await supabase
    .from("user_instruments")
    .select("id,user_id,instrument_name,transpose_offset,is_primary")
    .eq("user_id", userId)
    .order("is_primary", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any) => ({
    id: String(row.id),
    userId: String(row.user_id),
    instrumentId: String(row.id),
    instrumentName: String(row.instrument_name),
    isPrimary: Boolean(row.is_primary),
    writtenOffset: Number(row.transpose_offset ?? 0),
  }));
}

export async function savePersonalInstruments(
  userId: string,
  selected: Instrument[],
  primaryInstrumentId?: string,
): Promise<string | null> {
  const { data: existing, error: readError } = await supabase
    .from("user_instruments")
    .select("instrument_name")
    .eq("user_id", userId);
  if (readError) return readError.message;
  const { error: clearPrimaryError } = await supabase
    .from("user_instruments")
    .update({ is_primary: false })
    .eq("user_id", userId);
  if (clearPrimaryError) return clearPrimaryError.message;
  if (selected.length) {
    const { error } = await supabase.from("user_instruments").upsert(
      selected.map((instrument) => ({
        user_id: userId,
        instrument_name: instrument.name,
        transpose_offset: instrument.writtenOffset,
        is_primary: instrument.id === primaryInstrumentId,
      })),
      { onConflict: "user_id,instrument_name" },
    );
    if (error) return error.message;
  }
  const removed = (existing ?? [])
    .map((row: any) => String(row.instrument_name))
    .filter((name) => !selected.some((instrument) => instrument.name === name));
  if (removed.length) {
    const { error } = await supabase
      .from("user_instruments")
      .delete()
      .eq("user_id", userId)
      .in("instrument_name", removed);
    if (error) return error.message;
  }
  return null;
}
