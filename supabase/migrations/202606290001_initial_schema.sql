create extension if not exists pgcrypto;

create type public.organization_role as enum ('owner', 'admin', 'director', 'musician', 'guest');
create type public.song_visibility as enum ('private', 'organization', 'public');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  owner_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.organization_role not null default 'musician',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.songs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  organization_id uuid references public.organizations(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  artist text not null default '',
  original_key text not null,
  bpm smallint check (bpm between 20 and 400),
  content_plain text not null default '',
  content_structured jsonb not null default '{"version":1,"lines":[]}'::jsonb,
  content_type text not null default 'lyrics_chords' check (content_type in ('lyrics_chords', 'chords_only', 'wind_notes')),
  notation text not null default 'american' check (notation in ('american', 'latin')),
  visibility public.song_visibility not null default 'private',
  source_song_id uuid references public.songs(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_visibility_requires_org check (visibility <> 'organization' or organization_id is not null)
);

create table public.instruments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  family text not null,
  transposition smallint not null default 0 check (transposition between -11 and 11),
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.setlists (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  title text not null,
  starts_at timestamptz,
  location text,
  created_at timestamptz not null default now()
);

create table public.setlist_songs (
  setlist_id uuid not null references public.setlists(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete restrict,
  position integer not null check (position >= 0),
  key_override text,
  notes text,
  primary key (setlist_id, song_id),
  unique (setlist_id, position)
);

create index songs_owner_idx on public.songs(owner_id, updated_at desc);
create index songs_organization_idx on public.songs(organization_id, updated_at desc);
create index organization_members_user_idx on public.organization_members(user_id);
create index setlists_organization_idx on public.setlists(organization_id, starts_at);

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.songs enable row level security;
alter table public.instruments enable row level security;
alter table public.setlists enable row level security;
alter table public.setlist_songs enable row level security;

create function public.is_org_member(org_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.organization_members m where m.organization_id = org_id and m.user_id = auth.uid());
$$;

create function public.has_org_role(org_id uuid, allowed public.organization_role[])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.organization_members m where m.organization_id = org_id and m.user_id = auth.uid() and m.role = any(allowed));
$$;

create policy "profiles readable by self and teammates" on public.profiles for select using (
  id = auth.uid() or exists (
    select 1 from public.organization_members mine
    join public.organization_members theirs on theirs.organization_id = mine.organization_id
    where mine.user_id = auth.uid() and theirs.user_id = profiles.id
  )
);
create policy "profiles self insert" on public.profiles for insert with check (id = auth.uid());
create policy "profiles self update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "organizations visible to members" on public.organizations for select using (public.is_org_member(id));
create policy "authenticated users create organizations" on public.organizations for insert to authenticated with check (owner_id = auth.uid());
create policy "owners update organizations" on public.organizations for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "memberships visible to members" on public.organization_members for select using (public.is_org_member(organization_id));
create policy "admins manage memberships" on public.organization_members for all using (public.has_org_role(organization_id, array['owner','admin']::public.organization_role[])) with check (public.has_org_role(organization_id, array['owner','admin']::public.organization_role[]));

create policy "songs visible by scope" on public.songs for select using (
  visibility = 'public' or owner_id = auth.uid() or (organization_id is not null and public.is_org_member(organization_id))
);
create policy "users create owned songs" on public.songs for insert to authenticated with check (
  owner_id = auth.uid() and (organization_id is null or public.has_org_role(organization_id, array['owner','admin','director','musician']::public.organization_role[]))
);
create policy "owners and directors update songs" on public.songs for update using (
  owner_id = auth.uid() or (organization_id is not null and public.has_org_role(organization_id, array['owner','admin','director']::public.organization_role[]))
) with check (owner_id = auth.uid() or (organization_id is not null and public.has_org_role(organization_id, array['owner','admin','director']::public.organization_role[])));
create policy "owners and admins delete songs" on public.songs for delete using (owner_id = auth.uid() or (organization_id is not null and public.has_org_role(organization_id, array['owner','admin']::public.organization_role[])));

create policy "instruments are private" on public.instruments for select using (user_id = auth.uid());
create policy "users manage own instruments" on public.instruments for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "setlists visible to members" on public.setlists for select using (public.is_org_member(organization_id));
create policy "leaders manage setlists" on public.setlists for all using (public.has_org_role(organization_id, array['owner','admin','director']::public.organization_role[])) with check (public.has_org_role(organization_id, array['owner','admin','director']::public.organization_role[]));
create policy "setlist songs visible to members" on public.setlist_songs for select using (exists(select 1 from public.setlists s where s.id = setlist_id and public.is_org_member(s.organization_id)));
create policy "leaders manage setlist songs" on public.setlist_songs for all using (exists(select 1 from public.setlists s where s.id = setlist_id and public.has_org_role(s.organization_id, array['owner','admin','director']::public.organization_role[]))) with check (exists(select 1 from public.setlists s where s.id = setlist_id and public.has_org_role(s.organization_id, array['owner','admin','director']::public.organization_role[])));

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
