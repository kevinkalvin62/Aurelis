-- Incremental migration: programs may contain free-text items without library resources.
-- Safe for the existing Aurelis schema. It does not recreate or drop tables.

alter table public.setlist_items
  alter column song_id drop not null;

alter table public.setlist_items
  add column if not exists title_snapshot text;

update public.setlist_items item
set title_snapshot = coalesce(
  nullif(trim(item.source_title), ''),
  (select song.title from public.songs song where song.id = item.song_id),
  'Canción'
)
where nullif(trim(item.title_snapshot), '') is null;

update public.setlist_items
set title_snapshot = 'Canción'
where nullif(trim(title_snapshot), '') is null;

alter table public.setlist_items
  alter column title_snapshot set not null;

notify pgrst, 'reload schema';
