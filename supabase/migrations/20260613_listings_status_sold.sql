-- ============================================================
-- Migration: Modelo de status real para anúncios
-- Data: 2026-06-13
-- Objetivo:
--   - status: active | sold | archived
--   - sold_at: timestamptz nullable
-- ============================================================

alter table public.listings
add column if not exists sold_at timestamptz;

-- Normaliza status legado para o novo modelo.
update public.listings
set status = case
    when status = 'sold' then 'sold'
    when status = 'active' then 'active'
    else 'archived'
end;

alter table public.listings
drop constraint if exists listings_status_check;

alter table public.listings
add constraint listings_status_check
check (status in ('active', 'sold', 'archived'));

alter table public.listings
alter column status set default 'active';

-- sold_at só deve existir quando status = sold.
update public.listings
set sold_at = null
where status <> 'sold';

alter table public.listings
drop constraint if exists listings_sold_at_consistency_check;

alter table public.listings
add constraint listings_sold_at_consistency_check
check (
    (status = 'sold' and sold_at is not null)
    or (status in ('active', 'archived') and sold_at is null)
);

create index if not exists listings_sold_at_idx on public.listings (sold_at);