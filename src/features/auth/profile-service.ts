import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/domain';

export async function ensureProfile(user: User, displayName?: string): Promise<Profile | null> {
  const fallbackName = displayName?.trim() || (typeof user.user_metadata?.display_name === 'string' ? user.user_metadata.display_name : '') || user.email?.split('@')[0] || 'Músico';
  const { data, error } = await supabase.from('profiles').upsert({
    id: user.id,
    user_id: user.id,
    display_name: fallbackName,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' }).select('id,user_id,display_name,username').single();
  if (error || !data) return null;
  return { id: String(data.id), userId: String(data.user_id), displayName: String(data.display_name), ...(data.username ? { username: String(data.username) } : {}) };
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('id,user_id,display_name,username').eq('user_id', userId).maybeSingle();
  if (error || !data) return null;
  return { id: String(data.id), userId: String(data.user_id), displayName: String(data.display_name), ...(data.username ? { username: String(data.username) } : {}) };
}
