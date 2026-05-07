-- ============================================================
-- Migration: Restringir leitura de listings apenas a authenticated
-- Data: 2026-05-07
-- Objetivo: Apenas usuários logados podem ver anúncios (privacidade)
-- ============================================================

-- Remove a policy pública atual que permitia leitura anônima
drop policy if exists "Public read active listings" on public.listings;

-- Nova policy: apenas usuários autenticados veem anúncios active
create policy "Authenticated read active listings" on public.listings for
select to authenticated using (status = 'active');

-- Donos do anúncio veem os próprios (pending, inactive, rejected também)
-- Nota: esta policy se soma à anterior via OR interno do Postgres RLS
create policy "Owner read own listings" on public.listings for
select to authenticated using (auth.uid () = user_id);

-- ============================================================
-- COMO APLICAR:
-- 1. Acesse o Supabase Dashboard > SQL Editor
-- 2. Cole e execute este script
-- OU via CLI:
--   supabase db push  (se usando migrations locais)
-- ============================================================