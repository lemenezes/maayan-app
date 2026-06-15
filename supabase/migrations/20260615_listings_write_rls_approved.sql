-- Migration: exigir perfil approved para escrita em listings

alter table public.listings enable row level security;

drop policy if exists "Authenticated insert own listings" on public.listings;
drop policy if exists "Approved insert own listings" on public.listings;
create policy "Approved insert own listings" on public.listings
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.status = 'approved'
  )
);

drop policy if exists "Owner update own listings" on public.listings;
drop policy if exists "Approved owner update own listings" on public.listings;
create policy "Approved owner update own listings" on public.listings
for update
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.status = 'approved'
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.status = 'approved'
  )
);

drop policy if exists "Owner delete own listings" on public.listings;
drop policy if exists "Approved owner delete own listings" on public.listings;
create policy "Approved owner delete own listings" on public.listings
for delete
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

drop policy if exists "Admin update any listing" on public.listings;
create policy "Admin update any listing" on public.listings
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.status = 'approved'
  )
)
with check (true);

drop policy if exists "Admin delete any listing" on public.listings;
create policy "Admin delete any listing" on public.listings
for delete
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
