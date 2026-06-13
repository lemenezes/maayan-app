-- filepath: /Users/lmiglioli/dev/maayan-app/supabase/migrations/20260613_drop_listing_apartment.sql
alter table public.listings
drop column if exists apartment;