-- ============================================================
-- Migration: adiciona telefone/WhatsApp no perfil
-- Data: 2026-06-13
-- ============================================================

alter table public.profiles
add column if not exists whatsapp text;
