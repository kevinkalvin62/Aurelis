import { supabase } from '@/lib/supabase';

export async function createRemoteSetlist(input: { organizationId: string; title: string; serviceDate?: string; notes?: string; sourceText?: string; songs: { remoteId: string; key: string }[] }): Promise<{ id?: string; error?: string }> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { error: 'Tu sesión expiró. Inicia sesión nuevamente.' };
  const sourceText = [input.sourceText, input.notes].filter(Boolean).join('\n\n') || null;
  const { data, error } = await supabase.from('setlists').insert({ organization_id: input.organizationId, title: input.title, service_date: input.serviceDate || null, source_text: sourceText, created_by: userData.user.id }).select('id').single();
  if (error || !data) return { error: error?.message ?? 'No fue posible crear el programa.' };

  const id = String(data.id);
  if (input.songs.length) {
    const { error: itemsError } = await supabase.from('setlist_items').insert(input.songs.map((song, position) => ({ setlist_id: id, song_id: song.remoteId, position, selected_key: song.key, notes: null })));
    if (itemsError) {
      await supabase.from('setlists').delete().eq('id', id);
      return { error: itemsError.message };
    }
  }
  return { id };
}

export async function deleteRemoteSetlist(id: string): Promise<string | null> {
  const { error } = await supabase.from('setlists').delete().eq('id', id);
  return error?.message ?? null;
}
