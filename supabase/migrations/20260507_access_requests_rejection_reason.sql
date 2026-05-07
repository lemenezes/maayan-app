-- ============================================================
-- Migration: Adicionar rejection_reason à access_requests
-- Data: 2026-05-07
-- ============================================================

alter table public.access_requests
add column if not exists rejection_reason text;

-- ─── COMO APLICAR ──────────────────────────────────────────────────────────
-- Supabase Dashboard > SQL Editor > colar e executar
-- ───────────────────────────────────────────────────────────────────────────