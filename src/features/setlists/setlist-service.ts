import { supabase } from '@/lib/supabase';

export async function createRemoteSetlist(input: { organizationId: string; title: string; serviceDate?: string; notes?: string; sourceText?: string; songs: { remoteId: string; key: string }[] }): Promise<{ id?: string; error?: string }> {
  const { data, error } = await supabase.rpc('create_setlist_with_items', {
    org_id: input.organizationId,
    program_title: input.title,
    program_date: input.serviceDate || null,
    program_notes: input.notes || null,
    program_source: input.sourceText || null,
    program_items: input.songs.map((song) => ({ song_id: song.remoteId, selected_key: song.key })),
  });
  if (error) return { error: error.message };
  return data ? { id: String(data) } : { error: 'No fue posible crear el programa.' };
}

export async function deleteRemoteSetlist(id: string): Promise<string | null> {
  const { error } = await supabase.from('setlists').delete().eq('id', id);
  return error?.message ?? null;
}
