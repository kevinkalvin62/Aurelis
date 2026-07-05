-- Incremental, data-preserving support for version source instruments and minor keys.
alter table public.song_versions
  add column if not exists source_instrument_name text not null default 'Concert';

update public.song_versions set source_instrument_name = 'Concert'
where source_instrument_name is null or btrim(source_instrument_name) = '';

alter table public.song_versions alter column source_instrument_name set default 'Concert';
alter table public.song_versions alter column source_instrument_name set not null;

-- Replace only CHECK constraints that validate key columns; preserve every other constraint.
do $$
declare constraint_row record;
begin
  for constraint_row in
    select c.conname, c.conrelid::regclass as table_name
    from pg_constraint c
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
    where c.contype = 'c'
      and c.conrelid in ('public.songs'::regclass, 'public.song_versions'::regclass)
      and a.attname in ('original_key', 'current_key', 'key')
  loop
    execute format('alter table %s drop constraint %I', constraint_row.table_name, constraint_row.conname);
  end loop;
end $$;

alter table public.songs add constraint songs_original_key_supported
  check (original_key is null or original_key ~ '^[A-G](#|b)?m?$');
alter table public.songs add constraint songs_current_key_supported
  check (current_key is null or current_key ~ '^[A-G](#|b)?m?$');
alter table public.song_versions add constraint song_versions_key_supported
  check (key is null or key ~ '^[A-G](#|b)?m?$');

create table if not exists public.user_instruments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  instrument_name text not null,
  transpose_offset integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique(user_id, instrument_name)
);

alter table public.user_instruments enable row level security;
create index if not exists user_instruments_user_idx on public.user_instruments(user_id);

drop policy if exists user_instruments_select_own on public.user_instruments;
drop policy if exists user_instruments_own_rows on public.user_instruments;
drop policy if exists user_instruments_insert_own on public.user_instruments;
drop policy if exists user_instruments_update_own on public.user_instruments;
drop policy if exists user_instruments_delete_own on public.user_instruments;
create policy user_instruments_select_own on public.user_instruments for select to authenticated using (user_id = auth.uid());
create policy user_instruments_insert_own on public.user_instruments for insert to authenticated with check (user_id = auth.uid());
create policy user_instruments_update_own on public.user_instruments for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy user_instruments_delete_own on public.user_instruments for delete to authenticated using (user_id = auth.uid());

create unique index if not exists user_instruments_one_primary
  on public.user_instruments(user_id) where is_primary;

notify pgrst, 'reload schema';
