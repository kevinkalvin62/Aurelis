-- Incremental support for major/minor selected keys in program items.
-- The existing constraint only accepts a narrower key set.
alter table public.setlist_items
  drop constraint if exists setlist_items_selected_key_check;

alter table public.setlist_items
  add constraint setlist_items_selected_key_check
  check (selected_key is null or selected_key ~ '^[A-G](#|b)?m?$');

notify pgrst, 'reload schema';
