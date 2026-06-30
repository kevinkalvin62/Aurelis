alter table public.songs
  add column if not exists deleted_at timestamptz;

create index if not exists songs_active_organization_idx
  on public.songs (organization_id, updated_at desc)
  where deleted_at is null;

create or replace function public.soft_delete_song(target_song uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  song_row public.songs;
begin
  select * into song_row
  from public.songs
  where id = target_song
    and deleted_at is null;

  if song_row.id is null then
    raise exception 'song not found';
  end if;

  if song_row.organization_id is null then
    if song_row.user_id <> auth.uid() then
      raise exception 'insufficient permissions';
    end if;
  elsif not public.has_org_role(
    song_row.organization_id,
    array['owner', 'admin']::public.organization_role[]
  ) then
    raise exception 'insufficient permissions';
  end if;

  update public.songs
  set deleted_at = now(), updated_at = now()
  where id = target_song;
end;
$$;

revoke execute on function public.soft_delete_song(uuid) from public, anon;
grant execute on function public.soft_delete_song(uuid) to authenticated;

drop policy if exists "songs authorized insert" on public.songs;
create policy "songs authorized insert"
on public.songs
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    organization_id is null
    or public.is_org_member(organization_id)
  )
  and deleted_at is null
);

-- Song deletion is performed only through soft_delete_song.
drop policy if exists "songs authorized delete" on public.songs;

drop policy if exists "songs permitted select" on public.songs;
create policy "songs permitted select"
on public.songs
for select
to authenticated
using (
  deleted_at is null
  and (
    user_id = auth.uid()
    or visibility = 'public'::public.content_visibility
    or (organization_id is not null and public.is_org_member(organization_id))
  )
);

notify pgrst, 'reload schema';
