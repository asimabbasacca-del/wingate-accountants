-- Wingate accountancy packages catalog (schema)
-- CREATE-only. Do not DROP POLICY / DROP TABLE.
-- Safe to re-run: IF NOT EXISTS + additive columns.

create table if not exists wingate_package_groups (
  id text primary key,
  firm_id text not null,
  name text not null,
  summary text not null,
  sort_order int not null default 0
);

create table if not exists wingate_packages (
  id text primary key,
  firm_id text not null,
  slug text not null unique,
  name text not null,
  client_type text not null,
  group_id text not null,
  monthly_price numeric,
  annual_price numeric,
  vat_note text not null default '+ VAT',
  price_note text not null default '',
  billing text not null check (billing in ('monthly', 'annual', 'quote')),
  description text not null,
  ideal_for text not null,
  highlights jsonb not null default '[]',
  exclusions jsonb not null default '[]',
  comparison jsonb not null default '{}',
  property_bands jsonb,
  onboarding_kind text not null check (onboarding_kind in ('tax-return', 'practice')),
  is_active boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table wingate_packages add column if not exists price_note text not null default '';

create table if not exists wingate_package_features (
  id text primary key,
  name text not null,
  description text not null
);

create table if not exists wingate_package_feature_links (
  package_id text not null references wingate_packages (id),
  feature_id text not null references wingate_package_features (id),
  sort_order int not null default 0,
  primary key (package_id, feature_id)
);

create table if not exists wingate_addons (
  id text primary key,
  firm_id text not null,
  slug text not null unique,
  name text not null,
  description text not null,
  price numeric not null,
  vat_note text not null default '+ VAT',
  unit text not null,
  applicable_package_types text[] not null default '{}',
  is_active boolean not null default true,
  source text not null default 'wingate',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists wingate_package_faqs (
  id text primary key,
  firm_id text not null,
  question text not null,
  answer text not null,
  sort_order int not null default 0
);

create table if not exists wingate_package_selections (
  id text primary key,
  firm_id text not null,
  package_id text not null references wingate_packages (id),
  addon_ids text[] not null default '{}',
  name text not null,
  email text not null,
  phone text not null default '',
  company_name text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists wingate_packages_firm_idx on wingate_packages (firm_id);
create index if not exists wingate_packages_group_idx on wingate_packages (group_id);
create index if not exists wingate_addons_firm_idx on wingate_addons (firm_id);
create index if not exists wingate_package_selections_firm_idx on wingate_package_selections (firm_id);
create index if not exists wingate_package_selections_email_idx on wingate_package_selections (firm_id, email);

alter table wingate_package_groups enable row level security;
alter table wingate_packages enable row level security;
alter table wingate_package_features enable row level security;
alter table wingate_package_feature_links enable row level security;
alter table wingate_addons enable row level security;
alter table wingate_package_faqs enable row level security;
alter table wingate_package_selections enable row level security;

do $policy$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'wingate_package_groups_read') then
    create policy wingate_package_groups_read on wingate_package_groups for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'wingate_packages_read') then
    create policy wingate_packages_read on wingate_packages for select using (is_active = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'wingate_package_features_read') then
    create policy wingate_package_features_read on wingate_package_features for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'wingate_package_feature_links_read') then
    create policy wingate_package_feature_links_read on wingate_package_feature_links for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'wingate_addons_read') then
    create policy wingate_addons_read on wingate_addons for select using (is_active = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'wingate_package_faqs_read') then
    create policy wingate_package_faqs_read on wingate_package_faqs for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'wingate_package_selections_insert') then
    create policy wingate_package_selections_insert on wingate_package_selections
      for insert with check (firm_id = 'wingate-accountants-ltd');
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'wingate_package_selections_firm_read') then
    create policy wingate_package_selections_firm_read on wingate_package_selections
      for select using (firm_id = current_setting('app.firm_id', true));
  end if;
end
$policy$;

grant select on wingate_package_groups, wingate_packages, wingate_package_features, wingate_package_feature_links, wingate_addons, wingate_package_faqs
  to anon, authenticated;
grant insert on wingate_package_selections to anon, authenticated;
