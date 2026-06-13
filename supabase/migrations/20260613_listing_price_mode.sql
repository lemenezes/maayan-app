alter table public.listings
add column if not exists price_mode text not null default 'fixed';

update public.listings
set price_mode = case
    when category = 'servicos' then 'hour'
    when category = 'imoveis' then 'sale'
    when category = 'doacao' then 'free'
    else 'fixed'
end
where price_mode is null;

alter table public.listings
add constraint listings_price_mode_check check (
    price_mode in (
        'fixed',
        'hour',
        'day',
        'project',
        'quote',
        'sale',
        'monthly',
        'season',
        'free'
    )
);