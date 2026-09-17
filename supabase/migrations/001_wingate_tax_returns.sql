-- Wingate tax returns portal
-- Apply on Supabase when moving off the local JSON store.
-- CREATE-only. Do not DROP POLICY.

create table if not exists wingate_tax_users (
  id text primary key,
  firm_id text not null,
  email text not null,
  password_hash text not null,
  name text not null,
  role text not null check (role in ('client', 'accountant')),
  created_at timestamptz not null default now(),
  unique (firm_id, email)
);

create table if not exists wingate_tax_orders (
  id text primary key,
  firm_id text not null,
  user_id text not null references wingate_tax_users (id),
  accountant_id text references wingate_tax_users (id),
  tax_year text not null,
  plan_id text,
  status text not null,
  amount_gbp numeric not null default 0,
  payment jsonb not null default '{}',
  tax_summary jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists wingate_tax_aml_verifications (
  id text primary key,
  firm_id text not null,
  order_id text not null references wingate_tax_orders (id),
  user_id text not null,
  id_document jsonb,
  proofs_of_address jsonb not null default '[]',
  selfie jsonb,
  status text not null,
  risk_band text not null,
  staff_notes text not null default '',
  submitted_at timestamptz,
  reviewed_at timestamptz
);

create table if not exists wingate_tax_engagement_letters (
  id text primary key,
  firm_id text not null,
  order_id text not null references wingate_tax_orders (id),
  status text not null,
  pdf_file_id text,
  signer_name text,
  signature_data_url text,
  signed_at timestamptz,
  generated_at timestamptz
);

create table if not exists wingate_tax_tax_questionnaires (
  id text primary key,
  firm_id text not null,
  order_id text not null references wingate_tax_orders (id),
  answers jsonb not null default '{}',
  estimate jsonb,
  current_section text not null default 'personal',
  completed_at timestamptz
);

create table if not exists wingate_tax_tax_documents (
  id text primary key,
  firm_id text not null,
  order_id text not null references wingate_tax_orders (id),
  kind text not null,
  file_id text not null,
  file_name text not null,
  uploaded_at timestamptz not null default now(),
  requested boolean not null default false
);

create table if not exists wingate_tax_accountant_notes (
  id text primary key,
  firm_id text not null,
  order_id text not null references wingate_tax_orders (id),
  author_id text not null,
  kind text not null check (kind in ('note', 'info_request')),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists wingate_tax_portal_messages (
  id text primary key,
  firm_id text not null,
  order_id text not null references wingate_tax_orders (id),
  author_id text not null,
  author_role text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists wingate_tax_hmrc_submissions (
  id text primary key,
  firm_id text not null,
  order_id text not null references wingate_tax_orders (id),
  mode text not null,
  status text not null,
  receipt_id text,
  submitted_at timestamptz,
  sa100_file_id text,
  sa302_file_id text,
  detail text not null default ''
);

alter table wingate_tax_users enable row level security;
alter table wingate_tax_orders enable row level security;
alter table wingate_tax_aml_verifications enable row level security;
alter table wingate_tax_engagement_letters enable row level security;
alter table wingate_tax_tax_questionnaires enable row level security;
alter table wingate_tax_tax_documents enable row level security;
alter table wingate_tax_accountant_notes enable row level security;
alter table wingate_tax_portal_messages enable row level security;
alter table wingate_tax_hmrc_submissions enable row level security;

do $policy$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'wingate_tax_users_firm') then
    create policy wingate_tax_users_firm on wingate_tax_users
      for all using (firm_id = current_setting('app.firm_id', true));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'wingate_tax_orders_firm') then
    create policy wingate_tax_orders_firm on wingate_tax_orders
      for all using (firm_id = current_setting('app.firm_id', true));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'wingate_tax_aml_firm') then
    create policy wingate_tax_aml_firm on wingate_tax_aml_verifications
      for all using (firm_id = current_setting('app.firm_id', true));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'wingate_tax_letters_firm') then
    create policy wingate_tax_letters_firm on wingate_tax_engagement_letters
      for all using (firm_id = current_setting('app.firm_id', true));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'wingate_tax_questions_firm') then
    create policy wingate_tax_questions_firm on wingate_tax_tax_questionnaires
      for all using (firm_id = current_setting('app.firm_id', true));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'wingate_tax_docs_firm') then
    create policy wingate_tax_docs_firm on wingate_tax_tax_documents
      for all using (firm_id = current_setting('app.firm_id', true));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'wingate_tax_notes_firm') then
    create policy wingate_tax_notes_firm on wingate_tax_accountant_notes
      for all using (firm_id = current_setting('app.firm_id', true));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'wingate_tax_messages_firm') then
    create policy wingate_tax_messages_firm on wingate_tax_portal_messages
      for all using (firm_id = current_setting('app.firm_id', true));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'wingate_tax_hmrc_firm') then
    create policy wingate_tax_hmrc_firm on wingate_tax_hmrc_submissions
      for all using (firm_id = current_setting('app.firm_id', true));
  end if;
end
$policy$;
