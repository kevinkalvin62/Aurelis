import { supabase } from "@/lib/supabase";
import {
  mapRemoteSong,
  REMOTE_SONG_SELECT,
  type RemoteSongRow,
} from "@/features/songs/song-mapper";
import { decodeSetlistSource } from "@/features/setlists/setlist-source";
import { formatFriendlyDate } from "@/lib/dates";
import { adaptInstrumentMaterial } from "@/features/organizations/instrument-material";
import type {
  Instrument,
  InstrumentMaterial,
  MemberInstrument,
  Organization,
  OrganizationMember,
  OrganizationRole,
  OrganizationType,
  Setlist,
  Song,
} from "@/types/domain";

type ServiceResult<T> = { data?: T; error?: string };

export async function listMyOrganizations(): Promise<Organization[]> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw new Error(authError.message);
  if (!authData.user) return [];
  const { data, error } = await supabase
    .from("organization_members")
    .select("role, organizations!inner(id,name,slug,type,owner_id)")
    .eq("user_id", authData.user.id)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  const organizations = (data ?? []).flatMap((row: any): Organization[] => {
    const org = row.organizations;
    const ownerId = String(org?.owner_id ?? "");
    return org
      ? [
          {
            id: String(org.id),
            name: String(org.name),
            slug: String(org.slug),
            type: org.type as OrganizationType,
            ownerId,
            role: ownerId === authData.user.id ? "owner" : (row.role as OrganizationRole),
          },
        ]
      : [];
  });
  return [
    ...new Map(organizations.map((organization) => [organization.id, organization])).values(),
  ];
}

export async function createOrganization(
  name: string,
  slug: string,
  type: OrganizationType,
): Promise<ServiceResult<Organization>> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return { error: "Tu sesión expiró. Inicia sesión nuevamente." };
  const userId = authData.user.id;
  const { data, error } = await supabase
    .from("organizations")
    .insert({ name, slug, type, owner_id: userId })
    .select("id,name,slug,type,owner_id")
    .single();
  if (error || !data)
    return {
      error: friendlyOrgError(error?.message ?? "No fue posible crear la organización."),
    };
  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({ organization_id: data.id, user_id: userId, role: "owner" });
  if (memberError) {
    const { error: rollbackError } = await supabase
      .from("organizations")
      .delete()
      .eq("id", data.id);
    const rollbackMessage = rollbackError
      ? " Además, no fue posible revertir la organización incompleta."
      : "";
    return {
      error: `La organización se creó, pero no se pudo registrar al owner.${rollbackMessage}`,
    };
  }
  return {
    data: {
      id: String(data.id),
      name: String(data.name),
      slug: String(data.slug),
      type: data.type as OrganizationType,
      ownerId: String(data.owner_id),
      role: "owner",
    },
  };
}

export async function listInstruments(): Promise<Instrument[]> {
  const { data, error } = await supabase
    .from("instruments")
    .select("id,name,transposition_key,written_offset")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any) => ({
    id: String(row.id),
    name: String(row.name),
    ...(row.transposition_key ? { transpositionKey: String(row.transposition_key) } : {}),
    writtenOffset: Number(row.written_offset ?? 0),
  }));
}

export async function listOrganizationMembers(
  organizationId: string,
): Promise<OrganizationMember[]> {
  const [{ data, error }, memberInstruments, instruments] = await Promise.all([
    supabase.rpc("get_organization_members", { target_org: organizationId }),
    supabase
      .from("member_instruments")
      .select(
        "id,organization_member_id,instrument_id,transposition_key,is_primary,organization_members!inner(organization_id)",
      )
      .eq("organization_members.organization_id", organizationId),
    listInstruments(),
  ]);
  if (error) throw new Error(error.message);
  if (memberInstruments.error) throw new Error(memberInstruments.error.message);
  const catalog = new Map(instruments.map((instrument) => [instrument.id, instrument]));
  const assignments = (memberInstruments.data ?? []).map((row: any): MemberInstrument => ({
    id: String(row.id),
    organizationMemberId: String(row.organization_member_id),
    instrumentId: String(row.instrument_id),
    instrumentName: catalog.get(String(row.instrument_id))?.name ?? "Instrumento",
    ...(row.transposition_key ? { transpositionKey: String(row.transposition_key) } : {}),
    isPrimary: Boolean(row.is_primary),
    writtenOffset: catalog.get(String(row.instrument_id))?.writtenOffset ?? 0,
  }));
  return (data ?? []).map((row: any): OrganizationMember => ({
    id: String(row.member_id),
    organizationId,
    userId: String(row.user_id),
    role: row.role as OrganizationRole,
    displayName: String(row.display_name),
    ...(row.email ? { email: String(row.email) } : {}),
    instruments: assignments.filter(
      (instrument) => instrument.organizationMemberId === String(row.member_id),
    ),
  }));
}

export async function addOrganizationMember(
  organizationId: string,
  email: string,
): Promise<string | null> {
  const { error } = await supabase.rpc("add_organization_member_by_email", {
    target_org: organizationId,
    target_email: email.trim(),
  });
  return error ? friendlyOrgError(error.message) : null;
}

export async function changeOrganizationRole(
  memberId: string,
  role: Exclude<OrganizationRole, "owner" | "guest">,
): Promise<string | null> {
  const { error } = await supabase.rpc("set_organization_member_role", {
    target_member: memberId,
    target_role: role,
  });
  return error ? friendlyOrgError(error.message) : null;
}

export async function saveMemberInstruments(
  memberId: string,
  selected: Instrument[],
  primaryInstrumentId?: string,
): Promise<string | null> {
  const { data: existing, error: existingError } = await supabase
    .from("member_instruments")
    .select("instrument_id")
    .eq("organization_member_id", memberId);
  if (existingError) return existingError.message;
  if (selected.length) {
    const { error } = await supabase.from("member_instruments").upsert(
      selected.map((instrument) => ({
        organization_member_id: memberId,
        instrument_id: instrument.id,
        transposition_key: instrument.transpositionKey || null,
        is_primary: instrument.id === primaryInstrumentId,
      })),
      { onConflict: "organization_member_id,instrument_id" },
    );
    if (error) return error.message;
  }
  const selectedIds = new Set(selected.map((instrument) => instrument.id));
  const removedIds = (existing ?? [])
    .map((row: any) => String(row.instrument_id))
    .filter((instrumentId) => !selectedIds.has(instrumentId));
  if (removedIds.length) {
    const { error } = await supabase
      .from("member_instruments")
      .delete()
      .eq("organization_member_id", memberId)
      .in("instrument_id", removedIds);
    if (error) return error.message;
  }
  return null;
}

export async function removeOrganizationMember(memberId: string): Promise<string | null> {
  const { error } = await supabase.from("organization_members").delete().eq("id", memberId);
  return error ? friendlyOrgError(error.message) : null;
}

export async function listOrganizationSongs(organizationId: string): Promise<Song[]> {
  const { data, error } = await supabase
    .from("songs")
    .select(REMOTE_SONG_SELECT)
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data as RemoteSongRow[]) ?? []).map(mapRemoteSong);
}

export async function listOrganizationSetlists(organizationId: string): Promise<Setlist[]> {
  const { data, error } = await supabase
    .from("setlists")
    .select(
      "id,organization_id,title,service_date,source_text,created_by,setlist_items(id,song_id,title_snapshot,position,selected_key,notes)",
    )
    .eq("organization_id", organizationId)
    .order("service_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any) => mapRemoteSetlist(row));
}

export async function listMyOrganizationSetlists(): Promise<Setlist[]> {
  const { data, error } = await supabase
    .from("setlists")
    .select(
      "id,organization_id,title,service_date,source_text,created_by,organizations!inner(name),setlist_items(id,song_id,title_snapshot,position,selected_key,notes)",
    )
    .order("service_date", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any) =>
    mapRemoteSetlist(row, String(row.organizations?.name ?? "Organización")),
  );
}

export async function listMyInstruments(
  userId: string,
): Promise<(MemberInstrument & { organizationName: string })[]> {
  const [{ data, error }, catalog] = await Promise.all([
    supabase
      .from("organization_members")
      .select(
        "id,organizations!inner(name),member_instruments(id,organization_member_id,instrument_id,transposition_key,is_primary)",
      )
      .eq("user_id", userId),
    listInstruments(),
  ]);
  if (error) throw new Error(error.message);
  const instruments = new Map(catalog.map((instrument) => [instrument.id, instrument]));
  return (data ?? []).flatMap((row: any) =>
    (row.member_instruments ?? []).map((instrument: any) => ({
      id: String(instrument.id),
      organizationMemberId: String(row.id),
      instrumentId: String(instrument.instrument_id),
      instrumentName: instruments.get(String(instrument.instrument_id))?.name ?? "Instrumento",
      ...(instrument.transposition_key
        ? { transpositionKey: String(instrument.transposition_key) }
        : {}),
      isPrimary: Boolean(instrument.is_primary),
      writtenOffset: instruments.get(String(instrument.instrument_id))?.writtenOffset ?? 0,
      organizationName: String(row.organizations.name),
    })),
  );
}

export async function listInstrumentMaterials(
  songRemoteIds: string[],
  instrumentId?: string,
): Promise<InstrumentMaterial[]> {
  if (!songRemoteIds.length || !instrumentId) return [];
  const [{ data, error }, catalog] = await Promise.all([
    supabase
      .from("song_instrument_parts")
      .select("id,song_id,instrument_id,key,content_raw,notes")
      .in("song_id", songRemoteIds),
    listInstruments(),
  ]);
  if (error) throw new Error(error.message);
  const target = catalog.find((instrument) => instrument.id === instrumentId);
  if (!target) return [];
  const instruments = new Map(catalog.map((instrument) => [instrument.id, instrument]));
  return songRemoteIds.flatMap((songId): InstrumentMaterial[] => {
    const songParts = (data ?? []).filter((row: any) => String(row.song_id) === songId);
    const row =
      songParts.find((part: any) => String(part.instrument_id) === instrumentId) ?? songParts[0];
    if (!row) return [];
    const source = instruments.get(String(row.instrument_id));
    if (!source) return [];
    const material: InstrumentMaterial = {
      id: String(row.id),
      songId: `remote-${row.song_id}`,
      instrumentId: source.id,
      instrumentName: source.name,
      ...(row.key ? { key: String(row.key) } : {}),
      ...(row.content_raw ? { contentRaw: String(row.content_raw) } : {}),
      ...(row.notes ? { notes: String(row.notes) } : {}),
    };
    return [adaptInstrumentMaterial(material, source, target)];
  });
}

export async function saveInstrumentMaterial(input: {
  songId: string;
  instrumentId: string;
  key?: string;
  contentRaw?: string;
  notes?: string;
}): Promise<string | null> {
  const { error } = await supabase.from("song_instrument_parts").upsert(
    {
      song_id: input.songId,
      instrument_id: input.instrumentId,
      key: input.key || null,
      content_raw: input.contentRaw ?? "",
      notes: input.notes ?? "",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "song_id,instrument_id" },
  );
  return error?.message ?? null;
}

function mapRemoteSetlist(row: any, organizationName?: string): Setlist {
  const items = [...(row.setlist_items ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((item: any) => ({
      id: String(item.id),
      setlistId: String(row.id),
      titleSnapshot: String(item.title_snapshot),
      ...(item.song_id ? { songId: `remote-${item.song_id}` } : {}),
      position: Number(item.position),
      ...(item.selected_key ? { selectedKey: String(item.selected_key) } : {}),
      ...(item.notes ? { notes: String(item.notes) } : {}),
    }));
  const source = decodeSetlistSource(row.source_text);
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    ...(organizationName ? { organizationName } : {}),
    title: String(row.title),
    dateLabel: formatFriendlyDate(row.service_date ? String(row.service_date) : undefined),
    ...(row.service_date ? { serviceDate: String(row.service_date) } : {}),
    time: "Por definir",
    location: organizationName ?? "",
    songIds: items.flatMap((item) => (item.songId ? [item.songId] : [])),
    peopleCount: 0,
    ...source,
    createdBy: String(row.created_by),
    items,
    syncStatus: "synced",
  };
}

function friendlyOrgError(message: string): string {
  const text = message.toLowerCase();
  if (text.includes("profile not found")) return "No existe una cuenta registrada con ese correo.";
  if (text.includes("duplicate") || text.includes("unique"))
    return "Ese nombre o slug ya está en uso.";
  if (text.includes("permission")) return "No tienes permisos para realizar esta acción.";
  return message;
}

export function slugifyOrganization(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
