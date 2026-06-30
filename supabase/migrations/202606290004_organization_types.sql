-- Incremental migration: organizations may represent more than churches.
-- Expands an enum when present and replaces only checks that constrain organizations.type.

do $$
declare
  enum_schema text;
  enum_name text;
  check_name text;
  value text;
begin
  select n.nspname, t.typname into enum_schema, enum_name
  from pg_attribute a
  join pg_class c on c.oid = a.attrelid
  join pg_namespace cn on cn.oid = c.relnamespace
  join pg_type t on t.oid = a.atttypid
  join pg_namespace n on n.oid = t.typnamespace
  where cn.nspname = 'public' and c.relname = 'organizations' and a.attname = 'type';

  if enum_name is not null and exists(select 1 from pg_type where typname = enum_name and typtype = 'e') then
    foreach value in array array['church', 'band', 'school', 'choir', 'group', 'personal'] loop
      execute format('alter type %I.%I add value if not exists %L', enum_schema, enum_name, value);
    end loop;
  else
    for check_name in
      select con.conname
      from pg_constraint con
      where con.conrelid = 'public.organizations'::regclass
        and con.contype = 'c'
        and pg_get_constraintdef(con.oid) ~* '\mtype\M'
    loop
      execute format('alter table public.organizations drop constraint %I', check_name);
    end loop;

    alter table public.organizations
      add constraint organizations_type_check
      check (type in ('church', 'band', 'school', 'choir', 'group', 'personal')) not valid;
    alter table public.organizations validate constraint organizations_type_check;
  end if;
end;
$$;

notify pgrst, 'reload schema';
