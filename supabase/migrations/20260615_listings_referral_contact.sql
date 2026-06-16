alter table public.listings
  add column if not exists referral_name text,
  add column if not exists referral_whatsapp text,
  add column if not exists referral_notes text;