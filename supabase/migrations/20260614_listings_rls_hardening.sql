-- ============================================================
-- Migration: Hardening RLS de leitura em listings (Fase 1)
-- Data: 2026-06-14
-- Objetivo:
-- 1) Eliminar conflitos entre policies de leitura
-- 2) Garantir que apenas perfis approved (ou admin approved) leiam dados
-- ============================================================

alter table public.listings enable row level security;

-- Remove variacoes historicas que podem abrir leitura para qualquer authenticated.
drop policy if exists "Public read active listings" on public.listings;
drop policy if exists "Authenticated read active listings" on public.listings;
drop policy if exists "Approved residents read active listings" on public.listings;
drop policy if exists "Owner read own listings" on public.listings;
drop policy if exists "Admin read all listings" on public.listings;

-- Leitura de anuncios ativos apenas para moradores aprovados.
create policy "Approved residents read active listings" on public.listings
for select
to authenticated
using (
  status = 'active'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.status = 'approved'
  )
);

-- Dono so le os proprios anuncios quando o proprio perfil esta aprovado.
create policy "Owner read own listings" on public.listings
for select
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.status = 'approved'
  )
);

-- Admin le todos os anuncios, desde que seu perfil esteja approved.
create policy "Admin read all listings" on public.listings
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.status = 'approved'
  )
);
