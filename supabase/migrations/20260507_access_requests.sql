-- ============================================================
-- Migration: Sistema de convite por aprovação manual
-- Data: 2026-05-07
-- ============================================================

-- ─── 1. Atualizar tabela profiles ──────────────────────────────────────────
-- Adicionar colunas de perfil completo
alter table public.profiles
add column if not exists full_name text,
add column if not exists email text,
add column if not exists block text,
add column if not exists apartment text,
add column if not exists status text not null default 'approved' check (
    status in ('approved', 'suspended')
);

-- Ampliar constraint de role para incluir 'resident' (mantém 'user' p/ retrocompat)
alter table public.profiles
drop constraint if exists profiles_role_check;

alter table public.profiles
add constraint profiles_role_check check (
    role in ('user', 'resident', 'admin')
);

-- ─── 2. Tabela access_requests ─────────────────────────────────────────────
create table if not exists public.access_requests (
    id uuid primary key default gen_random_uuid (),
    full_name text not null,
    email text not null,
    block text not null,
    apartment text not null,
    message text,
    status text not null default 'pending' check (
        status in (
            'pending',
            'approved',
            'rejected'
        )
    ),
    created_at timestamptz not null default now(),
    reviewed_at timestamptz,
    reviewed_by uuid references auth.users (id)
);

create index if not exists access_requests_status_idx on public.access_requests (status);

create index if not exists access_requests_email_idx on public.access_requests (email);

alter table public.access_requests enable row level security;

-- Qualquer pessoa (inclusive anônima) pode enviar uma solicitação
create policy "Anyone can request access" on public.access_requests for insert
with
    check (true);

-- Admin lê todas as solicitações
create policy "Admin read access requests" on public.access_requests for
select to authenticated using (
        exists (
            select 1
            from public.profiles
            where
                id = auth.uid ()
                and role = 'admin'
        )
    );

-- Admin atualiza status das solicitações
create policy "Admin update access requests" on public.access_requests
for update
    to authenticated using (
        exists (
            select 1
            from public.profiles
            where
                id = auth.uid ()
                and role = 'admin'
        )
    );

-- ─── 3. Atualizar RLS de listings ─────────────────────────────────────────
-- Apenas moradores com perfil aprovado veem anúncios ativos
drop policy if exists "Authenticated read active listings" on public.listings;

create policy "Approved residents read active listings" on public.listings for
select to authenticated using (
        status = 'active'
        and exists (
            select 1
            from public.profiles
            where
                id = auth.uid ()
                and status = 'approved'
        )
    );

-- Dono vê os próprios anúncios (qualquer status) — requer perfil aprovado
drop policy if exists "Owner read own listings" on public.listings;

create policy "Owner read own listings" on public.listings for
select to authenticated using (
        auth.uid () = user_id
        and exists (
            select 1
            from public.profiles
            where
                id = auth.uid ()
                and status = 'approved'
        )
    );

-- ─── COMO APLICAR ──────────────────────────────────────────────────────────
-- Supabase Dashboard > SQL Editor > colar e executar
-- ───────────────────────────────────────────────────────────────────────────