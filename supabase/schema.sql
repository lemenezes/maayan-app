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
            'doacao',
            'imoveis'
        )
    ),
    price numeric(10, 2),
    whatsapp text not null,
    image_url text,
    author_name text not null,
    apartment text,
    status text not null default 'pending' check (
        status in (
            'pending',
            'active',
            'inactive',
            'rejected'
        )
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

-- Users can update only their own listings (status excluded – only admin can change status)
create policy "Owner update own listings" on public.listings
for update
    to authenticated using (auth.uid () = user_id)
with
    check (auth.uid () = user_id);

-- Users can delete only their own listings
create policy "Owner delete own listings" on public.listings for delete to authenticated using (auth.uid () = user_id);

-- Admin can read ALL listings (pending, rejected, etc.)
create policy "Admin read all listings" on public.listings for
select using (
        exists (
            select 1
            from public.profiles
            where
                id = auth.uid ()
                and role = 'admin'
        )
    );

-- Admin can update any listing (e.g. change status)
create policy "Admin update any listing" on public.listings
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

-- Admin can delete any listing
create policy "Admin delete any listing" on public.listings for delete to authenticated using (
    exists (
        select 1
        from public.profiles
        where
            id = auth.uid ()
            and role = 'admin'
    )
);

-- ============================================================
-- 3. Profiles table (user roles)
-- ============================================================
create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    role text not null default 'user' check (role in ('user', 'admin')),
    created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "User read own profile" on public.profiles for
select using (auth.uid () = id);

-- Only service role / admin can update roles (no RLS policy for user update)
-- To grant admin: run manually in SQL Editor:
--   update public.profiles set role = 'admin' where id = '<user-uuid>';

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
    insert into public.profiles (id)
    values (new.id)
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

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