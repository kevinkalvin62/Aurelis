-- Field Test 01 instrument catalog refinement.
-- Forward-only and non-destructive: preserve historical assignments/materials,
-- while ensuring new default catalogs use the approved product nomenclature.

update public.instruments
set
  name = 'Flauta traversa',
  transposition_key = 'C',
  written_offset = 0,
  is_default = true
where user_id is null
  and lower(name) in ('flauta', 'flauta transversal')
  and not exists (
    select 1
    from public.instruments existing
    where existing.user_id is null
      and lower(existing.name) = 'flauta traversa'
  );

insert into public.instruments (user_id, name, tuning, transposition_key, written_offset, is_default)
select null, 'Flauta traversa', array[]::text[], 'C', 0, true
where not exists (
  select 1
  from public.instruments existing
  where existing.user_id is null
    and lower(existing.name) = 'flauta traversa'
);
