-- ============================================================
-- Migration: Hardening de updates em profiles (Fase 1)
-- Data: 2026-06-14
-- Objetivo:
-- 1) Manter update do proprio profile para campos de conta
-- 2) Impedir escalada de privilegio via alteracao de role/status pelo proprio usuario
-- ============================================================

alter table public.profiles enable row level security;

-- Mantem a policy de update proprio usuario. O bloqueio de role/status
-- sera feito por trigger, pois RLS nao compara OLD vs NEW diretamente.
drop policy if exists "User update own profile" on public.profiles;

create policy "User update own profile" on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.prevent_self_profile_role_status_change()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Bloqueia somente update do proprio usuario autenticado (sessao normal).
  -- Service role (edge functions/admin backend) segue podendo atualizar.
  if auth.role() = 'authenticated' and auth.uid() is not null and auth.uid() = old.id then
    if new.role is distinct from old.role then
      raise exception 'Nao e permitido alterar role do proprio perfil.' using errcode = '42501';
    end if;

    if new.status is distinct from old.status then
      raise exception 'Nao e permitido alterar status do proprio perfil.' using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_self_profile_role_status_change on public.profiles;

create trigger prevent_self_profile_role_status_change
before update on public.profiles
for each row
execute procedure public.prevent_self_profile_role_status_change();
