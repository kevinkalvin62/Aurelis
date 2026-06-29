import { supabase } from '@/lib/supabase';
import type { InstrumentMaterial, MemberInstrument, Organization, OrganizationMember, OrganizationRole, Setlist, Song } from '@/types/domain';

type ServiceResult<T> = { data?: T; error?: string };

export async function listMyOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase.from('organization_members').select('role, organizations!inner(id,name,slug,type,owner_id)').order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).flatMap((row: any): Organization[] => {
    const org = row.organizations;
    return org ? [{ id: String(org.id), name: String(org.name), slug: String(org.slug), type: 'church', ownerId: String(org.owner_id), role: row.role as OrganizationRole }] : [];
  });
}

export async function createOrganization(name: string, slug: string): Promise<ServiceResult<Organization>> {
  const { data, error } = await supabase.rpc('create_organization', { org_name: name, org_slug: slug }).single();
  if (error || !data) return { error: friendlyOrgError(error?.message ?? 'No fue posible crear la iglesia.') };
  const row = data as any;
  return { data: { id: String(row.id), name: String(row.name), slug: String(row.slug), type: 'church', ownerId: String(row.owner_id), role: 'owner' } };
}

export async function listOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  const [{ data, error }, instrumentsResult] = await Promise.all([
    supabase.rpc('get_organization_members', { org_id: organizationId }),
    supabase.from('member_instruments').select('id,organization_member_id,instrument_name,transposition_key,is_primary,organization_members!inner(organization_id)').eq('organization_members.organization_id', organizationId),
  ]);
  if (error) throw new Error(error.message);
  const instruments = (instrumentsResult.data ?? []).map((row: any): MemberInstrument => ({ id: String(row.id), organizationMemberId: String(row.organization_member_id), instrumentName: String(row.instrument_name), ...(row.transposition_key ? { transpositionKey: String(row.transposition_key) } : {}), isPrimary: Boolean(row.is_primary) }));
  return (data ?? []).map((row: any): OrganizationMember => ({
    id: String(row.id), organizationId, userId: String(row.user_id), role: row.role as OrganizationRole,
    displayName: String(row.display_name), ...(row.email ? { email: String(row.email) } : {}),
    instruments: instruments.filter((instrument) => instrument.organizationMemberId === String(row.id)),
  }));
}

export async function addOrganizationMember(organizationId: string, email: string): Promise<string | null> {
  const { error } = await supabase.rpc('add_organization_member_by_email', { org_id: organizationId, member_email: email.trim() });
  return error ? friendlyOrgError(error.message) : null;
}

export async function changeOrganizationRole(memberId: string, role: Exclude<OrganizationRole, 'owner' | 'guest'>): Promise<string | null> {
  const { error } = await supabase.rpc('set_organization_member_role', { member_id: memberId, next_role: role });
  return error ? friendlyOrgError(error.message) : null;
}

export async function assignMemberInstrument(memberId: string, instrumentName: string, transpositionKey: string, isPrimary = false): Promise<string | null> {
  const { error } = await supabase.from('member_instruments').upsert({ organization_member_id: memberId, instrument_name: instrumentName, transposition_key: transpositionKey, is_primary: isPrimary }, { onConflict: 'organization_member_id,instrument_name' });
  return error?.message ?? null;
}

export async function removeOrganizationMember(memberId: string): Promise<string | null> {
  const { error } = await supabase.from('organization_members').delete().eq('id', memberId);
  return error ? friendlyOrgError(error.message) : null;
}

export async function listOrganizationSongs(organizationId: string): Promise<Song[]> {
  const { data, error } = await supabase.from('songs').select('id,owner_user_id,organization_id,title,artist,original_key,current_key,bpm,content_raw,content_type,notation,visibility,updated_at').eq('organization_id', organizationId).order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any): Song => ({ id: `remote-${row.id}`, remoteId: String(row.id), ownerUserId: String(row.owner_user_id), organizationId: String(row.organization_id), title: String(row.title), artist: row.artist ? String(row.artist) : '', key: row.original_key ? String(row.original_key) : 'C', ...(row.current_key ? { currentKey: String(row.current_key) } : {}), bpm: Number(row.bpm ?? 80), content: String(row.content_raw), contentType: row.content_type, notation: row.notation, visibility: row.visibility, updatedAt: new Date(row.updated_at).toLocaleDateString(), syncStatus: 'synced' }));
}

export async function listOrganizationSetlists(organizationId: string): Promise<Setlist[]> {
  const { data, error } = await supabase.from('setlists').select('id,organization_id,title,service_date,notes,source_text,created_by,setlist_items(id,song_id,position,selected_key,notes)').eq('organization_id', organizationId).order('service_date', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any): Setlist => {
    const items = [...(row.setlist_items ?? [])].sort((a, b) => a.position - b.position).map((item: any) => ({ id: String(item.id), setlistId: String(row.id), songId: `remote-${item.song_id}`, position: Number(item.position), ...(item.selected_key ? { selectedKey: String(item.selected_key) } : {}), ...(item.notes ? { notes: String(item.notes) } : {}) }));
    return { id: String(row.id), organizationId: String(row.organization_id), title: String(row.title), dateLabel: row.service_date ? String(row.service_date) : 'SIN FECHA', ...(row.service_date ? { serviceDate: String(row.service_date) } : {}), time: 'Por definir', location: '', songIds: items.map((item) => item.songId), peopleCount: 0, ...(row.notes ? { notes: String(row.notes) } : {}), ...(row.source_text ? { sourceText: String(row.source_text) } : {}), createdBy: String(row.created_by), items, syncStatus: 'synced' };
  });
}

export async function listMyInstruments(userId: string): Promise<(MemberInstrument & { organizationName: string })[]> {
  const { data, error } = await supabase.from('organization_members').select('id,organizations!inner(name),member_instruments(id,organization_member_id,instrument_name,transposition_key,is_primary)').eq('user_id', userId);
  if (error) throw new Error(error.message);
  return (data ?? []).flatMap((row: any) => (row.member_instruments ?? []).map((instrument: any) => ({ id: String(instrument.id), organizationMemberId: String(row.id), instrumentName: String(instrument.instrument_name), ...(instrument.transposition_key ? { transpositionKey: String(instrument.transposition_key) } : {}), isPrimary: Boolean(instrument.is_primary), organizationName: String(row.organizations.name) })));
}

export async function listInstrumentMaterials(organizationId: string, songRemoteIds: string[], instrumentName?: string): Promise<InstrumentMaterial[]> {
  if (!songRemoteIds.length || !instrumentName) return [];
  const { data, error } = await supabase.from('instrument_materials').select('id,song_id,organization_id,instrument_name,key,content_raw,notes').eq('organization_id', organizationId).eq('instrument_name', instrumentName).in('song_id', songRemoteIds);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any): InstrumentMaterial => ({ id: String(row.id), songId: `remote-${row.song_id}`, organizationId: String(row.organization_id), instrumentName: String(row.instrument_name), ...(row.key ? { key: String(row.key) } : {}), ...(row.content_raw ? { contentRaw: String(row.content_raw) } : {}), ...(row.notes ? { notes: String(row.notes) } : {}) }));
}

export async function saveInstrumentMaterial(input: { organizationId: string; songId: string; instrumentName: string; key?: string; contentRaw?: string; notes?: string }): Promise<string | null> {
  const { error } = await supabase.from('instrument_materials').upsert({ organization_id: input.organizationId, song_id: input.songId, instrument_name: input.instrumentName, key: input.key || null, content_raw: input.contentRaw || null, notes: input.notes || null }, { onConflict: 'song_id,instrument_name' });
  return error?.message ?? null;
}

function friendlyOrgError(message: string): string {
  const text = message.toLowerCase();
  if (text.includes('profile not found')) return 'No existe una cuenta registrada con ese correo.';
  if (text.includes('duplicate') || text.includes('unique')) return 'Ese nombre o slug ya está en uso.';
  if (text.includes('permission')) return 'No tienes permisos para realizar esta acción.';
  return message;
}

export function slugifyOrganization(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
