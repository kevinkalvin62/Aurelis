-- Shared catalog available to every authenticated user through the existing RLS policy.
with defaults(name, tuning, transposition_key, written_offset) as (
  values
    ('Voz', array[]::text[], 'C', 0),
    ('Piano', array[]::text[], 'C', 0),
    ('Teclado', array[]::text[], 'C', 0),
    ('Guitarra acústica', array['E2', 'A2', 'D3', 'G3', 'B3', 'E4'], 'C', 0),
    ('Guitarra eléctrica', array['E2', 'A2', 'D3', 'G3', 'B3', 'E4'], 'C', 0),
    ('Bajo', array['E1', 'A1', 'D2', 'G2'], 'C', 0),
    ('Batería', array[]::text[], 'C', 0),
    ('Violín', array['G3', 'D4', 'A4', 'E5'], 'C', 0),
    ('Viola', array['C3', 'G3', 'D4', 'A4'], 'C', 0),
    ('Violonchelo', array['C2', 'G2', 'D3', 'A3'], 'C', 0),
    ('Flauta', array[]::text[], 'C', 0),
    ('Clarinete', array[]::text[], 'Bb', 2),
    ('Trompeta', array[]::text[], 'Bb', 2),
    ('Saxofón soprano', array[]::text[], 'Bb', 2),
    ('Saxofón alto', array[]::text[], 'Eb', 9),
    ('Saxofón tenor', array[]::text[], 'Bb', 2),
    ('Saxofón barítono', array[]::text[], 'Eb', 9),
    ('Corno francés', array[]::text[], 'F', 7),
    ('Trombón', array[]::text[], 'C', 0),
    ('Tuba', array[]::text[], 'C', 0)
)
insert into public.instruments (user_id, name, tuning, transposition_key, written_offset, is_default)
select null, defaults.name, defaults.tuning, defaults.transposition_key, defaults.written_offset, true
from defaults
where not exists (
  select 1
  from public.instruments existing
  where existing.user_id is null
    and lower(existing.name) = lower(defaults.name)
);
