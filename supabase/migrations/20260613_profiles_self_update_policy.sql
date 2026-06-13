-- ============================================================
-- Migration: Permitir usuário atualizar o próprio perfil
-- Data: 2026-06-13
-- ============================================================

alter table public.profiles enable row level security;

-- Garante idempotência

drop policy if exists "User update own profile" on public.profiles;

create policy "User update own profile" on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
