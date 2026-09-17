-- Wingate practice OS: CMS, Stripe, CRM, AML extra, deadlines, audit.
-- CREATE-only. Do not DROP. Safe to re-run.

create table if not exists wingate_practice_json_store (
  firm_id text primary key,
  dump jsonb not null,
  updated_at timestamptz not null default now()
);

alter table wingate_practice_json_store enable row level security;

do $policy$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'wingate_practice_json_store_firm') then
    create policy wingate_practice_json_store_firm on wingate_practice_json_store
      for all using (firm_id = current_setting('app.firm_id', true));
  end if;
end
$policy$;

alter table wingate_packages add column if not exists archived boolean not null default false;
alter table wingate_packages add column if not exists stripe_price_id text;
alter table wingate_addons add column if not exists archived boolean not null default false;
