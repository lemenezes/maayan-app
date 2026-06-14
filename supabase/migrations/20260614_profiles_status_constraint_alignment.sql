-- ============================================================
-- Migration: Alinhar constraint de profiles.status
-- Data: 2026-06-14
-- Objetivo:
-- Permitir os estados efetivamente usados na aplicacao e no hardening RLS.
-- ============================================================

alter table public.profiles
drop constraint if exists profiles_status_check;

alter table public.profiles
add constraint profiles_status_check
check (status in ('pending', 'approved', 'rejected', 'suspended'));
