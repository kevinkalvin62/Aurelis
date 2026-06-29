import { supabase } from '@/lib/supabase';
import { mapRemoteSong, REMOTE_SONG_SELECT, type RemoteSongRow } from '@/features/songs/song-mapper';
import type { Instrument, InstrumentMaterial, MemberInstrument, Organization, OrganizationMember, OrganizationRole, Setlist, Song } from '@/types/domain';

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
  const { data, error } = await supabase.rpc('create_organization_with_owner', { org_name: name, org_slug: slug, org_type: 'church' }).single();
  if (error || !data) return { error: friendlyOrgError(error?.message ?? 'No fue posible crear la iglesia.') };
  const row = data as any;
  return { data: { id: String(row.id), name: String(row.name), slug: String(row.slug), type: 'church', ownerId: String(row.owner_id), role: 'owner' } };
}

export async function listInstruments(): Promise<Instrument[]> {
  const { data, error } = await supabase.from('instruments').select('id,name,transposition_key').order('name');
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any) => ({ id: String(row.id), name: String(row.name), ...(row.transposition_key ? { transpositionKey: String(row.transposition_key) } : {}) }));
}

export async function listOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  const [{ data, error }, memberInstruments, instruments] = await Promise.all([
    supabase.rpc('get_organization_members', { target_org: organizationId }),
    supabase.from('member_instruments').select('id,organization_member_id,instrument_id,transposition_key,is_primary,organization_members!inner(organization_id)').eq('organization_members.organization_id', organizationId),
    listInstruments(),
  ]);
  if (error) throw new Error(error.message);
  if (memberInstruments.error) throw new Error(memberInstruments.error.message);
  const names = new Map(instruments.map((instrument) => [instrument.id, instrument.name]));
  const assignments = (memberInstruments.data ?? []).map((row: any): MemberInstrument => ({
    id: String(row.id),
    organizationMemberId: String(row.organization_member_id),
    instrumentId: String(row.instrument_id),
    instrumentName: names.get(String(row.instrument_id)) ?? 'Instrumento',
    ...(row.transposition_key ? { transpositionKey: String(row.transposition_key) } : {}),
    isPrimary: Boolean(row.is_primary),
  }));
  return (data ?? []).map((row: any): OrganizationMember => ({
    id: String(row.member_id),
    organizationId,
    userId: String(row.user_id),
    role: row.role as OrganizationRole,
    displayName: String(row.display_name),
    ...(row.email ? { email: String(row.email) } : {}),
    instruments: assignments.filter((instrument) => instrument.organizationMemberId === String(row.member_id)),
  }));
}

export async function addOrganizationMember(organizationId: string, email: string): Promise<string | null> {
  const { error } = await supabase.rpc('add_organization_member_by_email', { target_org: organizationId, target_email: email.trim() });
  return error ? friendlyOrgError(error.message) : null;
}

export async function changeOrganizationRole(memberId: string, role: Exclude<OrganizationRole, 'owner' | 'guest'>): Promise<string | null> {
  const { error } = await supabase.rpc('set_organization_member_role', { target_member: memberId, target_role: role });
  return error ? friendlyOrgError(error.message) : null;
}

export async function assignMemberInstrument(memberId: string, instrumentId: string, transpositionKey?: string, isPrimary = false): Promise<string | null> {
  const { error } = await supabase.from('member_instruments').upsert({ organization_member_id: memberId, instrument_id: instrumentId, transposition_key: transpositionKey || null, is_primary: isPrimary }, { onConflict: 'organization_member_id,instrument_id' });
  return error?.message ?? null;
}

export async function removeOrganizationMember(memberId: string): Promise<string | null> {
  const { error } = await supabase.from('organization_members').delete().eq('id', memberId);
  return error ? friendlyOrgError(error.message) : null;
}

export async function listOrganizationSongs(organizationId: string): Promise<Song[]> {
  const { data, error } = await supabase.from('songs').select(REMOTE_SONG_SELECT).eq('organization_id', organizationId).order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as RemoteSongRow[] ?? []).map(mapRemoteSong);
}

export async function listOrganizationSetlists(organizationId: string): Promise<Setlist[]> {
  const { data, error } = await supabase.from('setlists').select('id,organization_id,title,service_date,source_text,created_by,setlist_items(id,song_id,position,selected_key,notes)').eq('organization_id', organizationId).order('service_date', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any): Setlist => {
    const items = [...(row.setlist_items ?? [])].sort((a, b) => a.position - b.position).map((item: any) => ({ id: String(item.id), setlistId: String(row.id), songId: `remote-${item.song_id}`, position: Number(item.position), ...(item.selected_key ? { selectedKey: String(item.selected_key) } : {}), ...(item.notes ? { notes: String(item.notes) } : {}) }));
    return { id: String(row.id), organizationId: String(row.organization_id), title: String(row.title), dateLabel: row.service_date ? String(row.service_date) : 'SIN FECHA', ...(row.service_date ? { serviceDate: String(row.service_date) } : {}), time: 'Por definir', location: '', songIds: items.map((item) => item.songId), peopleCount: 0, ...(row.source_text ? { sourceText: String(row.source_text) } : {}), createdBy: String(row.created_by), items, syncStatus: 'synced' };
  });
}

export async function listMyInstruments(userId: string): Promise<(MemberInstrument & { organizationName: string })[]> {
  const [{ data, error }, catalog] = await Promise.all([
    supabase.from('organization_members').select('id,organizations!inner(name),member_instruments(id,organization_member_id,instrument_id,transposition_key,is_primary)').eq('user_id', userId),
    listInstruments(),
  ]);
  if (error) throw new Error(error.message);
  const names = new Map(catalog.map((instrument) => [instrument.id, instrument.name]));
  return (data ?? []).flatMap((row: any) => (row.member_instruments ?? []).map((instrument: any) => ({ id: String(instrument.id), organizationMemberId: String(row.id), instrumentId: String(instrument.instrument_id), instrumentName: names.get(String(instrument.instrument_id)) ?? 'Instrumento', ...(instrument.transposition_key ? { transpositionKey: String(instrument.transposition_key) } : {}), isPrimary: Boolean(instrument.is_primary), organizationName: String(row.organizations.name) })));
}

export async function listInstrumentMaterials(songRemoteIds: string[], instrumentId?: string): Promise<InstrumentMaterial[]> {
  if (!songRemoteIds.length || !instrumentId) return [];
  const [{ data, error }, catalog] = await Promise.all([
    supabase.from('song_instrument_parts').select('id,song_id,instrument_id,key,content_raw,notes').eq('instrument_id', instrumentId).in('song_id', songRemoteIds),
    listInstruments(),
  ]);
  if (error) throw new Error(error.message);
  const instrumentName = catalog.find((instrument) => instrument.id === instrumentId)?.name ?? 'Instrumento';
  return (data ?? []).map((row: any): InstrumentMaterial => ({ id: String(row.id), songId: `remote-${row.song_id}`, instrumentId: String(row.instrument_id), instrumentName, ...(row.key ? { key: String(row.key) } : {}), ...(row.content_raw ? { contentRaw: String(row.content_raw) } : {}), ...(row.notes ? { notes: String(row.notes) } : {}) }));
}

export async function saveInstrumentMaterial(input: { songId: string; instrumentId: string; key?: string; contentRaw?: string; notes?: string }): Promise<string | null> {
  const { error } = await supabase.from('song_instrument_parts').upsert({ song_id: input.songId, instrument_id: input.instrumentId, key: input.key || null, content_raw: input.contentRaw || null, notes: input.notes || null, updated_at: new Date().toISOString() }, { onConflict: 'song_id,instrument_id' });
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
