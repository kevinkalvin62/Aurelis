create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  username text unique check (username is null or username ~ '^[a-z0-9_]{3,30}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  type text not null default 'church' check (type in ('church')),
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'musician' check (role in ('owner','admin','director','musician')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.member_instruments (
  id uuid primary key default gen_random_uuid(),
  organization_member_id uuid not null references public.organization_members(id) on delete cascade,
  instrument_name text not null check (char_length(instrument_name) between 2 and 80),
  transposition_key text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (organization_member_id, instrument_name)
);

create table public.songs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  artist text,
  original_key text,
  current_key text,
  content_raw text not null default '',
  content_structured jsonb not null default '{"version":1}'::jsonb,
  content_type text not null default 'lyrics_chords' check (content_type in ('lyrics_chords','chords_only','wind_notes')),
  notation text not null default 'american' check (notation in ('american','latin')),
  bpm smallint check (bpm between 20 and 400),
  visibility text not null default 'private' check (visibility in ('private','organization','public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((organization_id is null and visibility <> 'organization') or organization_id is not null)
);

create table public.setlists (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  service_date date,
  notes text,
  source_text text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.setlist_items (
  id uuid primary key default gen_random_uuid(),
  setlist_id uuid not null references public.setlists(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete restrict,
  position integer not null check (position >= 0),
  selected_key text,
  notes text,
  created_at timestamptz not null default now(),
  unique (setlist_id, position)
);

create table public.instrument_materials (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songs(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  instrument_name text not null,
  key text,
  content_raw text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (song_id, instrument_name)
);

create index profiles_user_idx on public.profiles(user_id);
create index members_user_idx on public.organization_members(user_id);
create index members_org_idx on public.organization_members(organization_id);
create index songs_owner_idx on public.songs(owner_user_id, updated_at desc);
create index songs_org_idx on public.songs(organization_id, updated_at desc);
create index setlists_org_idx on public.setlists(organization_id, service_date desc);
create index setlist_items_list_idx on public.setlist_items(setlist_id, position);

create or replace function public.is_org_member(org_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.organization_members where organization_id = org_id and user_id = auth.uid());
$$;

create or replace function public.org_role(org_id uuid)
returns text language sql stable security definer set search_path = '' as $$
  select role from public.organization_members where organization_id = org_id and user_id = auth.uid() limit 1;
$$;

create or replace function public.can_direct(org_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(public.org_role(org_id) in ('owner','admin','director'), false);
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.member_instruments enable row level security;
alter table public.songs enable row level security;
alter table public.setlists enable row level security;
alter table public.setlist_items enable row level security;
alter table public.instrument_materials enable row level security;

create policy profiles_self_select on public.profiles for select using (user_id = auth.uid());
create policy profiles_self_insert on public.profiles for insert with check (user_id = auth.uid());
create policy profiles_self_update on public.profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy organizations_member_select on public.organizations for select using (public.is_org_member(id));
create policy organizations_authenticated_insert on public.organizations for insert to authenticated with check (owner_id = auth.uid());
create policy organizations_owner_update on public.organizations for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy organizations_owner_delete on public.organizations for delete using (owner_id = auth.uid());

create policy members_org_select on public.organization_members for select using (public.is_org_member(organization_id));
create policy members_leader_insert on public.organization_members for insert with check (
  public.can_direct(organization_id) or exists(select 1 from public.organizations o where o.id = organization_id and o.owner_id = auth.uid() and user_id = auth.uid())
);
create policy members_admin_update on public.organization_members for update using (public.org_role(organization_id) in ('owner','admin')) with check (public.org_role(organization_id) in ('owner','admin'));
create policy members_owner_delete on public.organization_members for delete using (public.org_role(organization_id) = 'owner' and role <> 'owner');

create policy instruments_member_select on public.member_instruments for select using (exists(select 1 from public.organization_members m where m.id = organization_member_id and public.is_org_member(m.organization_id)));
create policy instruments_leader_insert on public.member_instruments for insert with check (exists(select 1 from public.organization_members m where m.id = organization_member_id and public.can_direct(m.organization_id)));
create policy instruments_leader_update on public.member_instruments for update using (exists(select 1 from public.organization_members m where m.id = organization_member_id and public.can_direct(m.organization_id)));
create policy instruments_leader_delete on public.member_instruments for delete using (exists(select 1 from public.organization_members m where m.id = organization_member_id and public.can_direct(m.organization_id)));

create policy songs_scope_select on public.songs for select using (
  owner_user_id = auth.uid() or (organization_id is not null and public.is_org_member(organization_id)) or (visibility = 'public' and auth.uid() is not null)
);
create policy songs_create on public.songs for insert with check (
  owner_user_id = auth.uid() and ((organization_id is null and visibility <> 'organization') or (organization_id is not null and public.can_direct(organization_id)))
);
create policy songs_update on public.songs for update using (
  (organization_id is null and owner_user_id = auth.uid()) or (organization_id is not null and public.can_direct(organization_id))
) with check ((organization_id is null and owner_user_id = auth.uid()) or (organization_id is not null and public.can_direct(organization_id)));
create policy songs_delete on public.songs for delete using (
  (organization_id is null and owner_user_id = auth.uid()) or (organization_id is not null and public.can_direct(organization_id))
);

create policy setlists_member_select on public.setlists for select using (public.is_org_member(organization_id));
create policy setlists_leader_insert on public.setlists for insert with check (created_by = auth.uid() and public.can_direct(organization_id));
create policy setlists_leader_update on public.setlists for update using (public.can_direct(organization_id)) with check (public.can_direct(organization_id));
create policy setlists_leader_delete on public.setlists for delete using (public.can_direct(organization_id));

create policy setlist_items_member_select on public.setlist_items for select using (exists(select 1 from public.setlists s where s.id = setlist_id and public.is_org_member(s.organization_id)));
create policy setlist_items_leader_insert on public.setlist_items for insert with check (exists(select 1 from public.setlists s where s.id = setlist_id and public.can_direct(s.organization_id)));
create policy setlist_items_leader_update on public.setlist_items for update using (exists(select 1 from public.setlists s where s.id = setlist_id and public.can_direct(s.organization_id)));
create policy setlist_items_leader_delete on public.setlist_items for delete using (exists(select 1 from public.setlists s where s.id = setlist_id and public.can_direct(s.organization_id)));

create policy materials_member_select on public.instrument_materials for select using (
  organization_id is not null and public.is_org_member(organization_id)
);
create policy materials_leader_insert on public.instrument_materials for insert with check (organization_id is not null and public.can_direct(organization_id));
create policy materials_leader_update on public.instrument_materials for update using (organization_id is not null and public.can_direct(organization_id));
create policy materials_leader_delete on public.instrument_materials for delete using (organization_id is not null and public.can_direct(organization_id));

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, user_id, display_name)
  values (new.id, new.id, coalesce(nullif(new.raw_user_meta_data ->> 'display_name',''), split_part(new.email,'@',1), 'Músico'))
  on conflict (user_id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.create_organization(org_name text, org_slug text)
returns public.organizations language plpgsql security definer set search_path = '' as $$
declare created public.organizations;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  insert into public.organizations(name, slug, type, owner_id) values (trim(org_name), lower(trim(org_slug)), 'church', auth.uid()) returning * into created;
  insert into public.organization_members(organization_id, user_id, role) values (created.id, auth.uid(), 'owner');
  return created;
end;
$$;

create or replace function public.add_organization_member_by_email(org_id uuid, member_email text)
returns public.organization_members language plpgsql security definer set search_path = '' as $$
declare target_user uuid; created public.organization_members;
begin
  if not public.can_direct(org_id) then raise exception 'insufficient permissions'; end if;
  select id into target_user from auth.users where lower(email) = lower(trim(member_email)) limit 1;
  if target_user is null then raise exception 'profile not found'; end if;
  insert into public.organization_members(organization_id,user_id,role) values(org_id,target_user,'musician')
  on conflict (organization_id,user_id) do update set user_id = excluded.user_id returning * into created;
  return created;
end;
$$;

create or replace function public.set_organization_member_role(member_id uuid, next_role text)
returns void language plpgsql security definer set search_path = '' as $$
declare target public.organization_members; caller_role text;
begin
  select * into target from public.organization_members where id = member_id;
  caller_role := public.org_role(target.organization_id);
  if caller_role not in ('owner','admin') then raise exception 'insufficient permissions'; end if;
  if next_role not in ('admin','director','musician') then raise exception 'invalid role'; end if;
  if target.role = 'owner' then raise exception 'owner role cannot be changed'; end if;
  update public.organization_members set role = next_role where id = member_id;
end;
$$;

create or replace function public.get_organization_members(org_id uuid)
returns table(id uuid, user_id uuid, role text, display_name text, email text)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_org_member(org_id) then raise exception 'insufficient permissions'; end if;
  return query
    select m.id, m.user_id, m.role, p.display_name, u.email::text
    from public.organization_members m
    join public.profiles p on p.user_id = m.user_id
    join auth.users u on u.id = m.user_id
    where m.organization_id = org_id
    order by case m.role when 'owner' then 0 when 'admin' then 1 when 'director' then 2 else 3 end, p.display_name;
end;
$$;

create or replace function public.create_setlist_with_items(
  org_id uuid, program_title text, program_date date, program_notes text, program_source text, program_items jsonb
) returns uuid language plpgsql security definer set search_path = '' as $$
declare new_id uuid; item jsonb; item_song uuid; item_position integer := 0;
begin
  if not public.can_direct(org_id) then raise exception 'insufficient permissions'; end if;
  insert into public.setlists(organization_id,title,service_date,notes,source_text,created_by)
  values(org_id,trim(program_title),program_date,nullif(program_notes,''),nullif(program_source,''),auth.uid()) returning id into new_id;
  for item in select * from jsonb_array_elements(coalesce(program_items,'[]'::jsonb)) loop
    item_song := (item ->> 'song_id')::uuid;
    if not exists(select 1 from public.songs where id = item_song and organization_id = org_id) then raise exception 'song does not belong to organization'; end if;
    insert into public.setlist_items(setlist_id,song_id,position,selected_key,notes)
    values(new_id,item_song,item_position,nullif(item ->> 'selected_key',''),nullif(item ->> 'notes',''));
    item_position := item_position + 1;
  end loop;
  return new_id;
end;
$$;

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_touch before update on public.profiles for each row execute procedure public.touch_updated_at();
create trigger organizations_touch before update on public.organizations for each row execute procedure public.touch_updated_at();
create trigger songs_touch before update on public.songs for each row execute procedure public.touch_updated_at();
create trigger setlists_touch before update on public.setlists for each row execute procedure public.touch_updated_at();
create trigger materials_touch before update on public.instrument_materials for each row execute procedure public.touch_updated_at();
