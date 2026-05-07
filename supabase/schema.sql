-- ============================================================
-- Maayan App – Supabase Schema
-- Execute no SQL Editor do Supabase (painel > SQL Editor)
-- ============================================================

-- 1. Tabela listings
-- ============================================================
create table if not exists public.listings (
    id uuid primary key default gen_random_uuid (),
    user_id uuid not null references auth.users (id) on delete cascade,
    title text not null,
    description text not null,
    category text not null check (
        category in (
            'venda',
            'servicos',
            'indicacoes',
            'doacao'
        )
    ),
    price numeric(10, 2),
    whatsapp text not null,
    image_url text,
    author_name text not null,
    apartment text,
    status text not null default 'active' check (
        status in ('active', 'inactive')
    ),
    created_at timestamptz not null default now()
);

-- Index for common filter
create index if not exists listings_category_idx on public.listings (category);

create index if not exists listings_status_idx on public.listings (status);

create index if not exists listings_user_id_idx on public.listings (user_id);

-- ============================================================
-- 2. Row Level Security
-- ============================================================
alter table public.listings enable row level security;

-- Anyone can read active listings
create policy "Public read active listings" on public.listings for
select using (status = 'active');

-- Authenticated users can insert their own listings
create policy "Authenticated insert own listings" on public.listings for insert to authenticated
with
    check (auth.uid () = user_id);

-- Users can update only their own listings
create policy "Owner update own listings" on public.listings
for update
    to authenticated using (auth.uid () = user_id)
with
    check (auth.uid () = user_id);

-- Users can delete only their own listings
create policy "Owner delete own listings" on public.listings for delete to authenticated using (auth.uid () = user_id);

-- ============================================================
-- 3. Storage bucket for listing images
-- ============================================================
-- Run this in the Supabase dashboard: Storage > New Bucket
-- Name: listings
-- Public: true (images are public by URL)
--
-- Or via SQL (requires storage extension):
insert into
    storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload
create policy "Auth users upload listing images" on storage.objects for insert to authenticated
with
    check (
        bucket_id = 'listings'
        and auth.uid ()::text = (storage.foldername (name)) [1]
    );

-- Allow public read of listing images
create policy "Public read listing images" on storage.objects for
select using (bucket_id = 'listings');

-- Allow owner to delete their own images
create policy "Owner delete listing images" on storage.objects for delete to authenticated using (
    bucket_id = 'listings'
    and auth.uid ()::text = (storage.foldername (name)) [1]
);