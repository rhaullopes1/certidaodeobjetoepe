create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

create or replace function private.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function private.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin'::public.app_role,'equipe'::public.app_role))
$$;

revoke all on function private.has_role(uuid, public.app_role) from public, anon;
revoke all on function private.is_staff(uuid) from public, anon;
grant execute on function private.has_role(uuid, public.app_role) to authenticated, service_role;
grant execute on function private.is_staff(uuid) to authenticated, service_role;

drop policy "Usuario ve os proprios papeis" on public.user_roles;
create policy "Usuario ve os proprios papeis" on public.user_roles for select to authenticated
  using ((user_id = auth.uid()) or private.has_role(auth.uid(), 'admin'));

drop policy "Admin gerencia papeis" on public.user_roles;
create policy "Admin gerencia papeis" on public.user_roles for all to authenticated
  using (private.has_role(auth.uid(), 'admin')) with check (private.has_role(auth.uid(), 'admin'));

drop policy "Equipe le andamentos" on public.pedido_andamentos;
create policy "Equipe le andamentos" on public.pedido_andamentos for select to authenticated
  using (private.is_staff(auth.uid()));

drop policy "Equipe registra andamentos" on public.pedido_andamentos;
create policy "Equipe registra andamentos" on public.pedido_andamentos for insert to authenticated
  with check (private.is_staff(auth.uid()));

drop policy "Admin remove andamentos" on public.pedido_andamentos;
create policy "Admin remove andamentos" on public.pedido_andamentos for delete to authenticated
  using (private.has_role(auth.uid(), 'admin'));

drop policy "Equipe le anexos" on public.pedido_anexos;
create policy "Equipe le anexos" on public.pedido_anexos for select to authenticated
  using (private.is_staff(auth.uid()));

drop policy "Equipe anexa arquivos" on public.pedido_anexos;
create policy "Equipe anexa arquivos" on public.pedido_anexos for insert to authenticated
  with check (private.is_staff(auth.uid()));

drop policy "Equipe remove anexos" on public.pedido_anexos;
create policy "Equipe remove anexos" on public.pedido_anexos for delete to authenticated
  using (private.is_staff(auth.uid()));

drop policy "Equipe consulta pedidos" on public.pedidos;
create policy "Equipe consulta pedidos" on public.pedidos for select to authenticated
  using (private.is_staff(auth.uid()));

drop policy "Equipe atualiza pedidos" on public.pedidos;
create policy "Equipe atualiza pedidos" on public.pedidos for update to authenticated
  using (private.is_staff(auth.uid())) with check (private.is_staff(auth.uid()));

drop policy "Usuario ve o proprio perfil" on public.profiles;
create policy "Usuario ve o proprio perfil" on public.profiles for select to authenticated
  using ((id = auth.uid()) or private.has_role(auth.uid(), 'admin'));

drop policy "Equipe le anexos storage" on storage.objects;
create policy "Equipe le anexos storage" on storage.objects for select to authenticated
  using (bucket_id = 'pedido-anexos' and private.is_staff(auth.uid()));

drop policy "Equipe envia anexos storage" on storage.objects;
create policy "Equipe envia anexos storage" on storage.objects for insert to authenticated
  with check (bucket_id = 'pedido-anexos' and private.is_staff(auth.uid()));

drop policy "Equipe remove anexos storage" on storage.objects;
create policy "Equipe remove anexos storage" on storage.objects for delete to authenticated
  using (bucket_id = 'pedido-anexos' and private.is_staff(auth.uid()));

drop function if exists public.has_role(uuid, public.app_role);
drop function if exists public.is_staff(uuid);