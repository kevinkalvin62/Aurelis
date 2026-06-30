insert into public.instruments (user_id, name, tuning, transposition_key, written_offset, is_default)
select null, 'Otro', array[]::text[], 'C', 0, true
where not exists (
  select 1
  from public.instruments
  where user_id is null
    and lower(name) = 'otro'
);
