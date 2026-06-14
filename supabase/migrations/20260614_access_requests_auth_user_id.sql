-- ============================================================
-- Migration: Vincular access_requests ao usuário do Auth
-- Data: 2026-06-14
-- Objetivo:
-- Suportar novo onboarding com senha no cadastro inicial.
-- ============================================================

alter table public.access_requests
add column if not exists auth_user_id uuid references auth.users (id) on delete set null;

create index if not exists access_requests_auth_user_id_idx
on public.access_requests (auth_user_id);
