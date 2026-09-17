-- Wingate tax portal JSON store + file blobs for launch (Supabase / Neon).
-- CREATE-only. Do not DROP. Safe to re-run.
-- The website still uses the in-app tax engine; this table is the durable dump
-- so Vercel serverless instances share the same client portal data.

create table if not exists wingate_tax_json_store (
  firm_id text primary key,
  dump jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists wingate_tax_file_blobs (
  id text primary key,
  firm_id text not null,
  mime_type text not null default 'application/octet-stream',
  bytes bytea not null,
  created_at timestamptz not null default now()
);

create index if not exists wingate_tax_file_blobs_firm_idx on wingate_tax_file_blobs (firm_id);

alter table wingate_tax_json_store enable row level security;
alter table wingate_tax_file_blobs enable row level security;

do $policy$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'wingate_tax_json_store_firm') then
    create policy wingate_tax_json_store_firm on wingate_tax_json_store
      for all using (firm_id = current_setting('app.firm_id', true));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'wingate_tax_file_blobs_firm') then
    create policy wingate_tax_file_blobs_firm on wingate_tax_file_blobs
      for all using (firm_id = current_setting('app.firm_id', true));
  end if;
end
$policy$;
