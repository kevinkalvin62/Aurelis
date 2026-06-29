-- Incremental migration for the existing Aurelis schema.
-- Creates workflow functions only. It does not create, drop, or alter tables.

create or replace function public.add_organization_member_by_email(
  target_org uuid,
  target_email text
) returns public.organization_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user uuid;
  created public.organization_members;
begin
  if not exists(
    select 1 from public.organization_members
    where organization_id = target_org
      and user_id = auth.uid()
      and role in ('owner', 'admin', 'director')
  ) then raise exception 'insufficient permissions'; end if;

  select id into target_user from auth.users
  where lower(email) = lower(trim(target_email)) limit 1;
  if target_user is null then raise exception 'profile not found'; end if;

  insert into public.organization_members(organization_id, user_id, role)
  values(target_org, target_user, 'musician')
  on conflict (organization_id, user_id) do update set user_id = excluded.user_id
  returning * into created;
  return created;
end;
$$;

create or replace function public.set_organization_member_role(
  target_member uuid,
  target_role text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  member_row public.organization_members;
  caller_role text;
begin
  select * into member_row from public.organization_members where id = target_member;
  select role into caller_role from public.organization_members
  where organization_id = member_row.organization_id and user_id = auth.uid();
  if caller_role not in ('owner', 'admin') then raise exception 'insufficient permissions'; end if;
  if target_role not in ('admin', 'director', 'musician') then raise exception 'invalid role'; end if;
  if member_row.role = 'owner' then raise exception 'owner role cannot be changed'; end if;
  update public.organization_members set role = target_role where id = target_member;
end;
$$;

create or replace function public.get_organization_members(target_org uuid)
returns table(member_id uuid, user_id uuid, role text, display_name text, email text)
language sql
security definer
set search_path = ''
as $$
  select om.id, om.user_id, om.role::text,
    coalesce(up.display_name, split_part(au.email, '@', 1), 'Músico'),
    au.email::text
  from public.organization_members om
  left join public.user_profiles up on up.user_id = om.user_id
  left join auth.users au on au.id = om.user_id
  where om.organization_id = target_org
    and public.is_org_member(target_org)
  order by om.created_at;
$$;

revoke execute on function public.add_organization_member_by_email(uuid, text) from public, anon;
revoke execute on function public.set_organization_member_role(uuid, text) from public, anon;
revoke execute on function public.get_organization_members(uuid) from public, anon;

grant execute on function public.add_organization_member_by_email(uuid, text) to authenticated;
grant execute on function public.set_organization_member_role(uuid, text) to authenticated;
grant execute on function public.get_organization_members(uuid) to authenticated;
