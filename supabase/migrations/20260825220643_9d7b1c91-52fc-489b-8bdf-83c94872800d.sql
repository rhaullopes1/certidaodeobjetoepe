create or replace function public.grant_first_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_grant_first_admin on auth.users;
create trigger on_auth_user_created_grant_first_admin
after insert on auth.users
for each row execute function public.grant_first_admin();