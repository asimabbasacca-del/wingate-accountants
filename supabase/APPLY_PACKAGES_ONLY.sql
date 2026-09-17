-- =============================================================================
-- Wingate packages only — paste this if tax-return tables already exist into the Supabase SQL Editor
-- Dashboard → SQL Editor → New query → paste → Run
-- =============================================================================
-- Safe to run more than once (CREATE IF NOT EXISTS, ON CONFLICT updates).
-- Does not DROP tables or policies.
-- firm_id for every row: wingate-accountants-ltd
--
-- After it succeeds, add these to the Wingate app environment:
--   SUPABASE_URL=https://YOUR-PROJECT.supabase.co
--   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
-- (Project Settings → API. Use the service role key only on the server.)
-- =============================================================================

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

-- Seed: Wingate packages, features, add-ons, groups, FAQs
-- Generated from lib/packages/data.ts. Re-run emit-packages-sql.ts after catalog edits.
-- Safe to re-run: INSERT ... ON CONFLICT updates in place. No DROP.

do $policy$ begin perform set_config('app.firm_id', 'wingate-accountants-ltd', true); end $policy$;

-- Groups
insert into wingate_package_groups (id, firm_id, name, summary, sort_order)
values ($wingate$contractors-freelancers$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$Contractors & Freelancers$wingate$, $wingate$Limited companies used by contractors, consultants and independent professionals.$wingate$, 0)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  name = excluded.name,
  summary = excluded.summary,
  sort_order = excluded.sort_order;
insert into wingate_package_groups (id, firm_id, name, summary, sort_order)
values ($wingate$limited-companies$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$Limited Companies$wingate$, $wingate$Trading companies and growing SMEs that need accounts, corporation tax and payroll.$wingate$, 1)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  name = excluded.name,
  summary = excluded.summary,
  sort_order = excluded.sort_order;
insert into wingate_package_groups (id, firm_id, name, summary, sort_order)
values ($wingate$sole-traders$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$Sole Traders & Self-Employed$wingate$, $wingate$Personal businesses, MTD for Income Tax support, and standalone Self Assessment.$wingate$, 2)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  name = excluded.name,
  summary = excluded.summary,
  sort_order = excluded.sort_order;
insert into wingate_package_groups (id, firm_id, name, summary, sort_order)
values ($wingate$landlords$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$Landlords & Property Investors$wingate$, $wingate$Let property held personally or in a company, priced by how many units you hold.$wingate$, 3)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  name = excluded.name,
  summary = excluded.summary,
  sort_order = excluded.sort_order;
insert into wingate_package_groups (id, firm_id, name, summary, sort_order)
values ($wingate$medical-professional$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$Medical & Professional Services$wingate$, $wingate$Locum doctors, pharmacists, opticians and similar professional practices.$wingate$, 4)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  name = excluded.name,
  summary = excluded.summary,
  sort_order = excluded.sort_order;
insert into wingate_package_groups (id, firm_id, name, summary, sort_order)
values ($wingate$ecommerce-online$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$E-commerce & Online Businesses$wingate$, $wingate$Online shops, marketplaces and creator businesses that sell digitally.$wingate$, 5)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  name = excluded.name,
  summary = excluded.summary,
  sort_order = excluded.sort_order;

-- Features
insert into wingate_package_features (id, name, description)
values ($wingate$named-accountant$wingate$, $wingate$Named accountant$wingate$, $wingate$You work with one Wingate accountant who knows your file, not a rotating call centre.$wingate$)
on conflict (id) do update set name = excluded.name, description = excluded.description;
insert into wingate_package_features (id, name, description)
values ($wingate$same-day-reply$wingate$, $wingate$Same-day response$wingate$, $wingate$Same working-day reply if you write or call before 3pm on a weekday. After 3pm we reply the next working day. If we miss that, we credit £50 to your next invoice.$wingate$)
on conflict (id) do update set name = excluded.name, description = excluded.description;
insert into wingate_package_features (id, name, description)
values ($wingate$cloud-software$wingate$, $wingate$Cloud accounting software$wingate$, $wingate$Xero or QuickBooks is included so you and your accountant see the same live figures.$wingate$)
on conflict (id) do update set name = excluded.name, description = excluded.description;
insert into wingate_package_features (id, name, description)
values ($wingate$year-end$wingate$, $wingate$Year-end accounts$wingate$, $wingate$Statutory or self-employed accounts prepared and filed where Companies House or HMRC require them.$wingate$)
on conflict (id) do update set name = excluded.name, description = excluded.description;
insert into wingate_package_features (id, name, description)
values ($wingate$ct600$wingate$, $wingate$Corporation tax return$wingate$, $wingate$CT600 prepared and submitted, with payment dates flagged in advance.$wingate$)
on conflict (id) do update set name = excluded.name, description = excluded.description;
insert into wingate_package_features (id, name, description)
values ($wingate$self-assessment$wingate$, $wingate$Self Assessment$wingate$, $wingate$One personal SA100 (and usual supplementary pages for that package) prepared and filed.$wingate$)
on conflict (id) do update set name = excluded.name, description = excluded.description;
insert into wingate_package_features (id, name, description)
values ($wingate$vat-returns$wingate$, $wingate$VAT returns$wingate$, $wingate$VAT returns prepared from the cloud books when the business is VAT-registered.$wingate$)
on conflict (id) do update set name = excluded.name, description = excluded.description;
insert into wingate_package_features (id, name, description)
values ($wingate$payroll-two$wingate$, $wingate$Payroll (up to two people)$wingate$, $wingate$PAYE, RTI and the usual year-end payroll forms for up to two employees or directors.$wingate$)
on conflict (id) do update set name = excluded.name, description = excluded.description;
insert into wingate_package_features (id, name, description)
values ($wingate$p11d$wingate$, $wingate$P11D benefits$wingate$, $wingate$P11D preparation where benefits in kind apply.$wingate$)
on conflict (id) do update set name = excluded.name, description = excluded.description;
insert into wingate_package_features (id, name, description)
values ($wingate$bookkeeping-review$wingate$, $wingate$Quarterly bookkeeping review$wingate$, $wingate$We review the books each quarter, query gaps and keep the file ready for tax.$wingate$)
on conflict (id) do update set name = excluded.name, description = excluded.description;
insert into wingate_package_features (id, name, description)
values ($wingate$confirmation-prep$wingate$, $wingate$Confirmation statement preparation$wingate$, $wingate$We prepare the Companies House confirmation statement. Filing the statement is an add-on.$wingate$)
on conflict (id) do update set name = excluded.name, description = excluded.description;
insert into wingate_package_features (id, name, description)
values ($wingate$dividends$wingate$, $wingate$Dividends and board minutes$wingate$, $wingate$Dividend vouchers and standard board minutes for the company year.$wingate$)
on conflict (id) do update set name = excluded.name, description = excluded.description;
insert into wingate_package_features (id, name, description)
values ($wingate$reminders$wingate$, $wingate$Deadline reminders$wingate$, $wingate$HMRC, Companies House and payment date reminders so filings are not left to the last week.$wingate$)
on conflict (id) do update set name = excluded.name, description = excluded.description;
insert into wingate_package_features (id, name, description)
values ($wingate$hmrc-help$wingate$, $wingate$HMRC records support$wingate$, $wingate$Help with HMRC record checks, coding notices and routine correspondence on the file.$wingate$)
on conflict (id) do update set name = excluded.name, description = excluded.description;
insert into wingate_package_features (id, name, description)
values ($wingate$status-refs$wingate$, $wingate$Employment status references$wingate$, $wingate$Standard contractor or locum status references when an agency or client asks for them.$wingate$)
on conflict (id) do update set name = excluded.name, description = excluded.description;
insert into wingate_package_features (id, name, description)
values ($wingate$share-changes$wingate$, $wingate$Share and officer changes$wingate$, $wingate$Help with share issues or transfers and changes of company particulars.$wingate$)
on conflict (id) do update set name = excluded.name, description = excluded.description;
insert into wingate_package_features (id, name, description)
values ($wingate$mtd-software$wingate$, $wingate$MTD-ready software$wingate$, $wingate$HMRC-recognised cloud software for digital records. MTD for Income Tax bridging from this portal is in development; your accountant still manages the filings that are live today.$wingate$)
on conflict (id) do update set name = excluded.name, description = excluded.description;
insert into wingate_package_features (id, name, description)
values ($wingate$mtd-updates$wingate$, $wingate$MTD quarterly updates$wingate$, $wingate$Quarterly update support and the year-end declaration once you are in scope of MTD for Income Tax.$wingate$)
on conflict (id) do update set name = excluded.name, description = excluded.description;
insert into wingate_package_features (id, name, description)
values ($wingate$property-accounts$wingate$, $wingate$Property income accounts$wingate$, $wingate$Rental income, allowable costs and finance cost restriction prepared for the year.$wingate$)
on conflict (id) do update set name = excluded.name, description = excluded.description;
insert into wingate_package_features (id, name, description)
values ($wingate$cis$wingate$, $wingate$CIS support$wingate$, $wingate$Construction Industry Scheme filings where the package includes contractor or subcontractor CIS.$wingate$)
on conflict (id) do update set name = excluded.name, description = excluded.description;

-- Packages
insert into wingate_packages (
  id, firm_id, slug, name, client_type, group_id,
  monthly_price, annual_price, vat_note, price_note, billing,
  description, ideal_for, highlights, exclusions, comparison, property_bands,
  onboarding_kind, is_active, featured, updated_at
) values (
  $wingate$contractor-complete$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$contractor-complete$wingate$, $wingate$Contractor Complete$wingate$, $wingate$Limited company contractor$wingate$, $wingate$contractors-freelancers$wingate$,
  119, 1285, $wingate$+ VAT$wingate$, $wingate$Pay 12 months at the company year start and the annual fee is 10% lower.$wingate$, $wingate$monthly$wingate$,
  $wingate$One monthly fee for a contracting company: accounts, corporation tax, VAT, payroll for two, and your own Self Assessment.$wingate$, $wingate$IT, engineering and professional contractors who invoice through a limited company and want a named accountant on speed-dial.$wingate$, $wingate$["Year-end accounts and CT600","One director Self Assessment","VAT returns when registered","Payroll for up to two people","Xero or QuickBooks included","Named accountant","Same-day reply before 3pm","Dividend paperwork and confirmation statement preparation"]$wingate$::jsonb, $wingate$["Companies House confirmation statement filing fee (available as an add-on)","Registered office address (available as an add-on)","Self Assessment for extra directors or shareholders","Payroll beyond two people","Company formation"]$wingate$::jsonb, $wingate${"yearEndAccounts":"Included","taxReturns":"Corporation tax (CT600) plus one director Self Assessment","vatSupport":"VAT returns included when you are registered","payrollSupport":"PAYE for up to two people","bookkeeping":"Quarterly bookkeeping review","cloudSoftware":"Xero or QuickBooks included","supportLevel":"Email, phone and video, with a named accountant","responseTime":"Same working day before 3pm"}$wingate$::jsonb, null,
  $wingate$practice$wingate$, true, true, now()
)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  slug = excluded.slug,
  name = excluded.name,
  client_type = excluded.client_type,
  group_id = excluded.group_id,
  monthly_price = excluded.monthly_price,
  annual_price = excluded.annual_price,
  vat_note = excluded.vat_note,
  price_note = excluded.price_note,
  billing = excluded.billing,
  description = excluded.description,
  ideal_for = excluded.ideal_for,
  highlights = excluded.highlights,
  exclusions = excluded.exclusions,
  comparison = excluded.comparison,
  property_bands = excluded.property_bands,
  onboarding_kind = excluded.onboarding_kind,
  is_active = excluded.is_active,
  featured = excluded.featured,
  updated_at = now();
insert into wingate_packages (
  id, firm_id, slug, name, client_type, group_id,
  monthly_price, annual_price, vat_note, price_note, billing,
  description, ideal_for, highlights, exclusions, comparison, property_bands,
  onboarding_kind, is_active, featured, updated_at
) values (
  $wingate$freelancer-company$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$freelancer-company$wingate$, $wingate$Freelancer Company$wingate$, $wingate$Limited company freelancer$wingate$, $wingate$contractors-freelancers$wingate$,
  113, 1220, $wingate$+ VAT$wingate$, $wingate$Pay 12 months at the company year start and the annual fee is 10% lower.$wingate$, $wingate$monthly$wingate$,
  $wingate$Accounts and tax for freelancers who have incorporated, with the same cloud books and named accountant as our contractor work.$wingate$, $wingate$Designers, consultants, developers and other independents trading through a limited company.$wingate$, $wingate$["Year-end accounts and CT600","One director Self Assessment","VAT returns when registered","Payroll for up to two people","Xero or QuickBooks included","Named accountant","Same-day reply before 3pm","Quarterly bookkeeping review"]$wingate$::jsonb, $wingate$["Companies House confirmation statement filing fee (available as an add-on)","Registered office address (available as an add-on)","Self Assessment for extra directors or shareholders","Payroll beyond two people","Company formation"]$wingate$::jsonb, $wingate${"yearEndAccounts":"Included","taxReturns":"Corporation tax (CT600) plus one director Self Assessment","vatSupport":"VAT returns included when you are registered","payrollSupport":"PAYE for up to two people","bookkeeping":"Quarterly bookkeeping review","cloudSoftware":"Xero or QuickBooks included","supportLevel":"Email, phone and video, with a named accountant","responseTime":"Same working day before 3pm"}$wingate$::jsonb, null,
  $wingate$practice$wingate$, true, false, now()
)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  slug = excluded.slug,
  name = excluded.name,
  client_type = excluded.client_type,
  group_id = excluded.group_id,
  monthly_price = excluded.monthly_price,
  annual_price = excluded.annual_price,
  vat_note = excluded.vat_note,
  price_note = excluded.price_note,
  billing = excluded.billing,
  description = excluded.description,
  ideal_for = excluded.ideal_for,
  highlights = excluded.highlights,
  exclusions = excluded.exclusions,
  comparison = excluded.comparison,
  property_bands = excluded.property_bands,
  onboarding_kind = excluded.onboarding_kind,
  is_active = excluded.is_active,
  featured = excluded.featured,
  updated_at = now();
insert into wingate_packages (
  id, firm_id, slug, name, client_type, group_id,
  monthly_price, annual_price, vat_note, price_note, billing,
  description, ideal_for, highlights, exclusions, comparison, property_bands,
  onboarding_kind, is_active, featured, updated_at
) values (
  $wingate$small-company$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$small-company$wingate$, $wingate$Small Company$wingate$, $wingate$Limited company$wingate$, $wingate$limited-companies$wingate$,
  113, 1220, $wingate$+ VAT$wingate$, $wingate$Pay 12 months at the company year start and the annual fee is 10% lower.$wingate$, $wingate$monthly$wingate$,
  $wingate$Fixed-fee accounts, corporation tax, VAT and payroll for a straightforward trading company.$wingate$, $wingate$Owner-managed limited companies with a simple structure and up to two people on payroll.$wingate$, $wingate$["Year-end accounts and CT600","One director Self Assessment","VAT returns when registered","Payroll for up to two people","Xero or QuickBooks included","Named accountant","Same-day reply before 3pm","Deadline reminders for HMRC and Companies House"]$wingate$::jsonb, $wingate$["Companies House confirmation statement filing fee (available as an add-on)","Registered office address (available as an add-on)","Self Assessment for extra directors or shareholders","Payroll beyond two people","Company formation"]$wingate$::jsonb, $wingate${"yearEndAccounts":"Included","taxReturns":"Corporation tax (CT600) plus one director Self Assessment","vatSupport":"VAT returns included when you are registered","payrollSupport":"PAYE for up to two people","bookkeeping":"Quarterly bookkeeping review","cloudSoftware":"Xero or QuickBooks included","supportLevel":"Email, phone and video, with a named accountant","responseTime":"Same working day before 3pm"}$wingate$::jsonb, null,
  $wingate$practice$wingate$, true, false, now()
)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  slug = excluded.slug,
  name = excluded.name,
  client_type = excluded.client_type,
  group_id = excluded.group_id,
  monthly_price = excluded.monthly_price,
  annual_price = excluded.annual_price,
  vat_note = excluded.vat_note,
  price_note = excluded.price_note,
  billing = excluded.billing,
  description = excluded.description,
  ideal_for = excluded.ideal_for,
  highlights = excluded.highlights,
  exclusions = excluded.exclusions,
  comparison = excluded.comparison,
  property_bands = excluded.property_bands,
  onboarding_kind = excluded.onboarding_kind,
  is_active = excluded.is_active,
  featured = excluded.featured,
  updated_at = now();
insert into wingate_packages (
  id, firm_id, slug, name, client_type, group_id,
  monthly_price, annual_price, vat_note, price_note, billing,
  description, ideal_for, highlights, exclusions, comparison, property_bands,
  onboarding_kind, is_active, featured, updated_at
) values (
  $wingate$growing-business$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$growing-business$wingate$, $wingate$Growing Business$wingate$, $wingate$Larger SME / more complex company$wingate$, $wingate$limited-companies$wingate$,
  null, null, $wingate$$wingate$, $wingate$Fee agreed after a short scoping call.$wingate$, $wingate$quote$wingate$,
  $wingate$A scoped fee for companies that have outgrown a two-person payroll, hold more entities, or need extra management reporting.$wingate$, $wingate$SMEs with more staff, multiple companies, stock, or reporting that a standard small-company fee cannot cover.$wingate$, $wingate$["Year-end accounts and corporation tax","VAT and payroll scoped to the team you have","Cloud software of your choice","Named senior accountant","Management information as agreed","Same-day reply before 3pm","HMRC and Companies House compliance","Written fee before work starts"]$wingate$::jsonb, $wingate$["Nothing is assumed until the scoped letter is signed"]$wingate$::jsonb, $wingate${"yearEndAccounts":"Included, scoped to the company","taxReturns":"Corporation tax; personal returns quoted if needed","vatSupport":"Included as scoped","payrollSupport":"Quoted for your headcount","bookkeeping":"Review frequency agreed in the letter","cloudSoftware":"Xero or QuickBooks","supportLevel":"Email, phone and video, with a named accountant","responseTime":"Same working day before 3pm"}$wingate$::jsonb, null,
  $wingate$practice$wingate$, true, false, now()
)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  slug = excluded.slug,
  name = excluded.name,
  client_type = excluded.client_type,
  group_id = excluded.group_id,
  monthly_price = excluded.monthly_price,
  annual_price = excluded.annual_price,
  vat_note = excluded.vat_note,
  price_note = excluded.price_note,
  billing = excluded.billing,
  description = excluded.description,
  ideal_for = excluded.ideal_for,
  highlights = excluded.highlights,
  exclusions = excluded.exclusions,
  comparison = excluded.comparison,
  property_bands = excluded.property_bands,
  onboarding_kind = excluded.onboarding_kind,
  is_active = excluded.is_active,
  featured = excluded.featured,
  updated_at = now();
insert into wingate_packages (
  id, firm_id, slug, name, client_type, group_id,
  monthly_price, annual_price, vat_note, price_note, billing,
  description, ideal_for, highlights, exclusions, comparison, property_bands,
  onboarding_kind, is_active, featured, updated_at
) values (
  $wingate$self-employed-accounts$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$self-employed-accounts$wingate$, $wingate$Self-Employed Accounts$wingate$, $wingate$Sole trader$wingate$, $wingate$sole-traders$wingate$,
  59, 637, $wingate$+ VAT$wingate$, $wingate$Pay 12 months up front and the annual fee is 10% lower.$wingate$, $wingate$monthly$wingate$,
  $wingate$Bookkeeping support, VAT if you are registered, payroll for two, and Self Assessment for a sole trader.$wingate$, $wingate$Self-employed contractors and tradespeople who have not incorporated and want year-round cover, not a January scramble.$wingate$, $wingate$["Self Assessment prepared and filed","Year-end accounts for the business","VAT returns when registered","Payroll for up to two people","Xero or QuickBooks included","Named accountant","Same-day reply before 3pm","Quarterly bookkeeping review"]$wingate$::jsonb, $wingate$["Corporation tax and Companies House filings (this is not a limited company package)","Payroll beyond two people","Specialist tax enquiry defence cover (available as an add-on)"]$wingate$::jsonb, $wingate${"yearEndAccounts":"Year-end accounts for the self-employed","taxReturns":"Self Assessment (SA100 and business pages)","vatSupport":"VAT returns included when you are registered","payrollSupport":"PAYE for up to two people","bookkeeping":"Quarterly bookkeeping review","cloudSoftware":"Xero or QuickBooks included","supportLevel":"Email, phone and video, with a named accountant","responseTime":"Same working day before 3pm"}$wingate$::jsonb, null,
  $wingate$tax-return$wingate$, true, false, now()
)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  slug = excluded.slug,
  name = excluded.name,
  client_type = excluded.client_type,
  group_id = excluded.group_id,
  monthly_price = excluded.monthly_price,
  annual_price = excluded.annual_price,
  vat_note = excluded.vat_note,
  price_note = excluded.price_note,
  billing = excluded.billing,
  description = excluded.description,
  ideal_for = excluded.ideal_for,
  highlights = excluded.highlights,
  exclusions = excluded.exclusions,
  comparison = excluded.comparison,
  property_bands = excluded.property_bands,
  onboarding_kind = excluded.onboarding_kind,
  is_active = excluded.is_active,
  featured = excluded.featured,
  updated_at = now();
insert into wingate_packages (
  id, firm_id, slug, name, client_type, group_id,
  monthly_price, annual_price, vat_note, price_note, billing,
  description, ideal_for, highlights, exclusions, comparison, property_bands,
  onboarding_kind, is_active, featured, updated_at
) values (
  $wingate$mtd-essentials$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$mtd-essentials$wingate$, $wingate$MTD Essentials$wingate$, $wingate$Sole trader in scope of MTD$wingate$, $wingate$sole-traders$wingate$,
  47, 508, $wingate$+ VAT$wingate$, $wingate$Software and MTD submissions. Full accounts advice sits on MTD Full Support or Self-Employed Accounts.$wingate$, $wingate$monthly$wingate$,
  $wingate$Digital records software, MTD registration support and help with quarterly updates if you prefer to keep the books yourself.$wingate$, $wingate$Sole traders who are comfortable with their own bookkeeping and need an accountant only for MTD submissions.$wingate$, $wingate$["Xero or QuickBooks for digital records","Help registering for MTD for Income Tax","Quarterly update support","Year-end declaration support","Deadline reminders","Email support from a named accountant","Reply within one working day","Self Assessment filing for the year"]$wingate$::jsonb, $wingate$["Full quarterly bookkeeping reviews (choose MTD Full Support)","VAT and payroll unless added","Live MTD bridging from this website — that work is in development"]$wingate$::jsonb, $wingate${"yearEndAccounts":"Not a full accounts package","taxReturns":"Self Assessment plus MTD updates","vatSupport":"Not included","payrollSupport":"Not included","bookkeeping":"You keep the books; we submit","cloudSoftware":"Xero or QuickBooks included","supportLevel":"Email with a named accountant","responseTime":"Within one working day"}$wingate$::jsonb, null,
  $wingate$tax-return$wingate$, true, false, now()
)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  slug = excluded.slug,
  name = excluded.name,
  client_type = excluded.client_type,
  group_id = excluded.group_id,
  monthly_price = excluded.monthly_price,
  annual_price = excluded.annual_price,
  vat_note = excluded.vat_note,
  price_note = excluded.price_note,
  billing = excluded.billing,
  description = excluded.description,
  ideal_for = excluded.ideal_for,
  highlights = excluded.highlights,
  exclusions = excluded.exclusions,
  comparison = excluded.comparison,
  property_bands = excluded.property_bands,
  onboarding_kind = excluded.onboarding_kind,
  is_active = excluded.is_active,
  featured = excluded.featured,
  updated_at = now();
insert into wingate_packages (
  id, firm_id, slug, name, client_type, group_id,
  monthly_price, annual_price, vat_note, price_note, billing,
  description, ideal_for, highlights, exclusions, comparison, property_bands,
  onboarding_kind, is_active, featured, updated_at
) values (
  $wingate$mtd-full$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$mtd-full$wingate$, $wingate$MTD Full Support$wingate$, $wingate$Sole trader wanting accountant-led MTD$wingate$, $wingate$sole-traders$wingate$,
  75, 810, $wingate$+ VAT$wingate$, $wingate$$wingate$, $wingate$monthly$wingate$,
  $wingate$A named accountant reviews the books, supports VAT, payroll and CIS where needed, and keeps you on the MTD calendar.$wingate$, $wingate$Self-employed people who want an accountant involved all year, not only at the quarterly click.$wingate$, $wingate$["Named accountant and bookkeeping reviews","MTD quarterly updates and final declaration","Self Assessment included","VAT and payroll support when you need it","CIS support where it applies","Xero or QuickBooks included","Same-day reply before 3pm","Deadline reminders"]$wingate$::jsonb, $wingate$["Live MTD bridging from this website — that work is in development","Payroll beyond two people"]$wingate$::jsonb, $wingate${"yearEndAccounts":"Self-employed accounts included","taxReturns":"Self Assessment plus MTD updates","vatSupport":"Supported when registered","payrollSupport":"Supported for up to two people","bookkeeping":"Regular reviews by your accountant","cloudSoftware":"Xero or QuickBooks included","supportLevel":"Email, phone and video, with a named accountant","responseTime":"Same working day before 3pm"}$wingate$::jsonb, null,
  $wingate$tax-return$wingate$, true, false, now()
)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  slug = excluded.slug,
  name = excluded.name,
  client_type = excluded.client_type,
  group_id = excluded.group_id,
  monthly_price = excluded.monthly_price,
  annual_price = excluded.annual_price,
  vat_note = excluded.vat_note,
  price_note = excluded.price_note,
  billing = excluded.billing,
  description = excluded.description,
  ideal_for = excluded.ideal_for,
  highlights = excluded.highlights,
  exclusions = excluded.exclusions,
  comparison = excluded.comparison,
  property_bands = excluded.property_bands,
  onboarding_kind = excluded.onboarding_kind,
  is_active = excluded.is_active,
  featured = excluded.featured,
  updated_at = now();
insert into wingate_packages (
  id, firm_id, slug, name, client_type, group_id,
  monthly_price, annual_price, vat_note, price_note, billing,
  description, ideal_for, highlights, exclusions, comparison, property_bands,
  onboarding_kind, is_active, featured, updated_at
) values (
  $wingate$personal-self-assessment$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$personal-self-assessment$wingate$, $wingate$Personal Self Assessment$wingate$, $wingate$Individual (PAYE, savings, simple SA)$wingate$, $wingate$sole-traders$wingate$,
  null, 190, $wingate$+ VAT$wingate$, $wingate$One annual fee for a personal return. Business, property or contractor work uses a monthly package instead.$wingate$, $wingate$annual$wingate$,
  $wingate$A named accountant prepares and files one personal Self Assessment. Use this when you do not need year-round company or sole-trader cover.$wingate$, $wingate$Employees with extra income, simple investment income, or anyone who only needs the annual SA100 handled.$wingate$, $wingate$["SA100 prepared by an accountant","Filed with HMRC after you approve it","Identity checks as part of onboarding","Portal messages with your accountant","Deadline reminders","Clear fixed fee"]$wingate$::jsonb, $wingate$["Year-round bookkeeping","VAT, payroll and company filings","Complex supplementary pages may be quoted"]$wingate$::jsonb, $wingate${"yearEndAccounts":"Not included","taxReturns":"One personal Self Assessment","vatSupport":"Not included","payrollSupport":"Not included","bookkeeping":"Not included","cloudSoftware":"Not required","supportLevel":"Portal, email and phone","responseTime":"Within one working day"}$wingate$::jsonb, null,
  $wingate$tax-return$wingate$, true, false, now()
)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  slug = excluded.slug,
  name = excluded.name,
  client_type = excluded.client_type,
  group_id = excluded.group_id,
  monthly_price = excluded.monthly_price,
  annual_price = excluded.annual_price,
  vat_note = excluded.vat_note,
  price_note = excluded.price_note,
  billing = excluded.billing,
  description = excluded.description,
  ideal_for = excluded.ideal_for,
  highlights = excluded.highlights,
  exclusions = excluded.exclusions,
  comparison = excluded.comparison,
  property_bands = excluded.property_bands,
  onboarding_kind = excluded.onboarding_kind,
  is_active = excluded.is_active,
  featured = excluded.featured,
  updated_at = now();
insert into wingate_packages (
  id, firm_id, slug, name, client_type, group_id,
  monthly_price, annual_price, vat_note, price_note, billing,
  description, ideal_for, highlights, exclusions, comparison, property_bands,
  onboarding_kind, is_active, featured, updated_at
) values (
  $wingate$landlord-personal$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$landlord-personal$wingate$, $wingate$Personal Landlord$wingate$, $wingate$Individual landlord$wingate$, $wingate$landlords$wingate$,
  59, 637, $wingate$+ VAT$wingate$, $wingate$Fee follows the number of properties. Six or more is quoted.$wingate$, $wingate$monthly$wingate$,
  $wingate$Property income, allowable costs and Self Assessment for lets held in your own name, with software included.$wingate$, $wingate$Buy-to-let owners who report rental income on a personal tax return.$wingate$, $wingate$["Property income accounts","Self Assessment with property pages","Finance-cost restriction handled","Xero or QuickBooks included","Named accountant","Same-day reply before 3pm","Deadline reminders","Priced by how many properties you hold"]$wingate$::jsonb, $wingate$["Company accounts (use Property Company)","Six or more properties until quoted"]$wingate$::jsonb, $wingate${"yearEndAccounts":"Property income accounts","taxReturns":"Self Assessment with UK property pages","vatSupport":"Only if VAT-registered (uncommon)","payrollSupport":"Not included","bookkeeping":"Quarterly review of rents and costs","cloudSoftware":"Xero or QuickBooks included","supportLevel":"Email, phone and video, with a named accountant","responseTime":"Same working day before 3pm"}$wingate$::jsonb, $wingate$[{"properties":"1–2","monthlyPrice":59},{"properties":"3","monthlyPrice":59},{"properties":"4","monthlyPrice":68},{"properties":"5","monthlyPrice":78},{"properties":"6+","monthlyPrice":null}]$wingate$::jsonb,
  $wingate$tax-return$wingate$, true, false, now()
)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  slug = excluded.slug,
  name = excluded.name,
  client_type = excluded.client_type,
  group_id = excluded.group_id,
  monthly_price = excluded.monthly_price,
  annual_price = excluded.annual_price,
  vat_note = excluded.vat_note,
  price_note = excluded.price_note,
  billing = excluded.billing,
  description = excluded.description,
  ideal_for = excluded.ideal_for,
  highlights = excluded.highlights,
  exclusions = excluded.exclusions,
  comparison = excluded.comparison,
  property_bands = excluded.property_bands,
  onboarding_kind = excluded.onboarding_kind,
  is_active = excluded.is_active,
  featured = excluded.featured,
  updated_at = now();
insert into wingate_packages (
  id, firm_id, slug, name, client_type, group_id,
  monthly_price, annual_price, vat_note, price_note, billing,
  description, ideal_for, highlights, exclusions, comparison, property_bands,
  onboarding_kind, is_active, featured, updated_at
) values (
  $wingate$landlord-company$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$landlord-company$wingate$, $wingate$Property Company$wingate$, $wingate$Limited company landlord$wingate$, $wingate$landlords$wingate$,
  59, 637, $wingate$+ VAT$wingate$, $wingate$Fee follows the number of properties. Six or more is quoted.$wingate$, $wingate$monthly$wingate$,
  $wingate$Company accounts, corporation tax and property bookkeeping for lets held in a limited company.$wingate$, $wingate$Landlords who hold property in a company and need Companies House and HMRC kept in step.$wingate$, $wingate$["Year-end accounts and CT600","Property bookkeeping reviews","One director Self Assessment","Xero or QuickBooks included","Named accountant","Same-day reply before 3pm","Confirmation statement preparation","Priced by how many properties you hold"]$wingate$::jsonb, $wingate$["Companies House confirmation statement filing fee (available as an add-on)","Registered office address (available as an add-on)","Self Assessment for extra directors or shareholders","Payroll beyond two people","Company formation"]$wingate$::jsonb, $wingate${"yearEndAccounts":"Company accounts including rental activity","taxReturns":"Corporation tax (CT600) plus one director Self Assessment","vatSupport":"VAT returns included when you are registered","payrollSupport":"PAYE for up to two people","bookkeeping":"Quarterly property bookkeeping review","cloudSoftware":"Xero or QuickBooks included","supportLevel":"Email, phone and video, with a named accountant","responseTime":"Same working day before 3pm"}$wingate$::jsonb, $wingate$[{"properties":"1–2","monthlyPrice":59},{"properties":"3","monthlyPrice":78},{"properties":"4","monthlyPrice":87},{"properties":"5","monthlyPrice":97},{"properties":"6+","monthlyPrice":null}]$wingate$::jsonb,
  $wingate$practice$wingate$, true, false, now()
)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  slug = excluded.slug,
  name = excluded.name,
  client_type = excluded.client_type,
  group_id = excluded.group_id,
  monthly_price = excluded.monthly_price,
  annual_price = excluded.annual_price,
  vat_note = excluded.vat_note,
  price_note = excluded.price_note,
  billing = excluded.billing,
  description = excluded.description,
  ideal_for = excluded.ideal_for,
  highlights = excluded.highlights,
  exclusions = excluded.exclusions,
  comparison = excluded.comparison,
  property_bands = excluded.property_bands,
  onboarding_kind = excluded.onboarding_kind,
  is_active = excluded.is_active,
  featured = excluded.featured,
  updated_at = now();
insert into wingate_packages (
  id, firm_id, slug, name, client_type, group_id,
  monthly_price, annual_price, vat_note, price_note, billing,
  description, ideal_for, highlights, exclusions, comparison, property_bands,
  onboarding_kind, is_active, featured, updated_at
) values (
  $wingate$locum-medical$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$locum-medical$wingate$, $wingate$Locum & Medical$wingate$, $wingate$Locum / medical professional (limited company)$wingate$, $wingate$medical-professional$wingate$,
  119, 1285, $wingate$+ VAT$wingate$, $wingate$$wingate$, $wingate$monthly$wingate$,
  $wingate$The full company package, tuned for locum doctors, pharmacists, opticians and similar professionals who invoice through a company.$wingate$, $wingate$Medical locums and allied professionals who need status references, payroll and a named accountant who has seen this work before.$wingate$, $wingate$["Year-end accounts and CT600","One director Self Assessment","VAT returns when registered","Payroll for up to two people","Status references for agencies","Xero or QuickBooks included","Named accountant","Same-day reply before 3pm"]$wingate$::jsonb, $wingate$["Companies House confirmation statement filing fee (available as an add-on)","Registered office address (available as an add-on)","Self Assessment for extra directors or shareholders","Payroll beyond two people","Company formation"]$wingate$::jsonb, $wingate${"yearEndAccounts":"Included","taxReturns":"Corporation tax (CT600) plus one director Self Assessment","vatSupport":"VAT returns included when you are registered","payrollSupport":"PAYE for up to two people","bookkeeping":"Quarterly bookkeeping review","cloudSoftware":"Xero or QuickBooks included","supportLevel":"Email, phone and video, with a named accountant","responseTime":"Same working day before 3pm"}$wingate$::jsonb, null,
  $wingate$practice$wingate$, true, false, now()
)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  slug = excluded.slug,
  name = excluded.name,
  client_type = excluded.client_type,
  group_id = excluded.group_id,
  monthly_price = excluded.monthly_price,
  annual_price = excluded.annual_price,
  vat_note = excluded.vat_note,
  price_note = excluded.price_note,
  billing = excluded.billing,
  description = excluded.description,
  ideal_for = excluded.ideal_for,
  highlights = excluded.highlights,
  exclusions = excluded.exclusions,
  comparison = excluded.comparison,
  property_bands = excluded.property_bands,
  onboarding_kind = excluded.onboarding_kind,
  is_active = excluded.is_active,
  featured = excluded.featured,
  updated_at = now();
insert into wingate_packages (
  id, firm_id, slug, name, client_type, group_id,
  monthly_price, annual_price, vat_note, price_note, billing,
  description, ideal_for, highlights, exclusions, comparison, property_bands,
  onboarding_kind, is_active, featured, updated_at
) values (
  $wingate$ecommerce-company$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$ecommerce-company$wingate$, $wingate$Online Retail Company$wingate$, $wingate$E-commerce limited company$wingate$, $wingate$ecommerce-online$wingate$,
  113, 1220, $wingate$+ VAT$wingate$, $wingate$$wingate$, $wingate$monthly$wingate$,
  $wingate$Company accounts and VAT-ready books for shops that sell online, including marketplace sellers who have incorporated.$wingate$, $wingate$Shopify, Amazon and similar sellers trading through a UK limited company with standard volumes.$wingate$, $wingate$["Year-end accounts and CT600","VAT returns when registered","One director Self Assessment","Payroll for up to two people","Xero or QuickBooks included","Named accountant","Same-day reply before 3pm","Quarterly bookkeeping review"]$wingate$::jsonb, $wingate$["Companies House confirmation statement filing fee (available as an add-on)","Registered office address (available as an add-on)","Self Assessment for extra directors or shareholders","Payroll beyond two people","Company formation","High-volume multi-channel bookkeeping may be quoted as Growing Business"]$wingate$::jsonb, $wingate${"yearEndAccounts":"Included","taxReturns":"Corporation tax (CT600) plus one director Self Assessment","vatSupport":"VAT returns included when you are registered","payrollSupport":"PAYE for up to two people","bookkeeping":"Quarterly bookkeeping review","cloudSoftware":"Xero or QuickBooks included","supportLevel":"Email, phone and video, with a named accountant","responseTime":"Same working day before 3pm"}$wingate$::jsonb, null,
  $wingate$practice$wingate$, true, false, now()
)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  slug = excluded.slug,
  name = excluded.name,
  client_type = excluded.client_type,
  group_id = excluded.group_id,
  monthly_price = excluded.monthly_price,
  annual_price = excluded.annual_price,
  vat_note = excluded.vat_note,
  price_note = excluded.price_note,
  billing = excluded.billing,
  description = excluded.description,
  ideal_for = excluded.ideal_for,
  highlights = excluded.highlights,
  exclusions = excluded.exclusions,
  comparison = excluded.comparison,
  property_bands = excluded.property_bands,
  onboarding_kind = excluded.onboarding_kind,
  is_active = excluded.is_active,
  featured = excluded.featured,
  updated_at = now();
insert into wingate_packages (
  id, firm_id, slug, name, client_type, group_id,
  monthly_price, annual_price, vat_note, price_note, billing,
  description, ideal_for, highlights, exclusions, comparison, property_bands,
  onboarding_kind, is_active, featured, updated_at
) values (
  $wingate$creator-influencer$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$creator-influencer$wingate$, $wingate$Creator & Influencer$wingate$, $wingate$Creator / influencer (limited company)$wingate$, $wingate$ecommerce-online$wingate$,
  119, 1285, $wingate$+ VAT$wingate$, $wingate$$wingate$, $wingate$monthly$wingate$,
  $wingate$Company accounts for creators who invoice brands, take platform income and need drawings, VAT and a personal return kept tidy.$wingate$, $wingate$Social media, YouTube and similar creators who have incorporated or are about to.$wingate$, $wingate$["Year-end accounts and CT600","One director Self Assessment","VAT returns when registered","Payroll for up to two people","Xero or QuickBooks included","Named accountant","Same-day reply before 3pm","Help claiming genuine business costs"]$wingate$::jsonb, $wingate$["Companies House confirmation statement filing fee (available as an add-on)","Registered office address (available as an add-on)","Self Assessment for extra directors or shareholders","Payroll beyond two people","Company formation"]$wingate$::jsonb, $wingate${"yearEndAccounts":"Included","taxReturns":"Corporation tax (CT600) plus one director Self Assessment","vatSupport":"VAT returns included when you are registered","payrollSupport":"PAYE for up to two people","bookkeeping":"Quarterly bookkeeping review","cloudSoftware":"Xero or QuickBooks included","supportLevel":"Email, phone and video, with a named accountant","responseTime":"Same working day before 3pm"}$wingate$::jsonb, null,
  $wingate$practice$wingate$, true, false, now()
)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  slug = excluded.slug,
  name = excluded.name,
  client_type = excluded.client_type,
  group_id = excluded.group_id,
  monthly_price = excluded.monthly_price,
  annual_price = excluded.annual_price,
  vat_note = excluded.vat_note,
  price_note = excluded.price_note,
  billing = excluded.billing,
  description = excluded.description,
  ideal_for = excluded.ideal_for,
  highlights = excluded.highlights,
  exclusions = excluded.exclusions,
  comparison = excluded.comparison,
  property_bands = excluded.property_bands,
  onboarding_kind = excluded.onboarding_kind,
  is_active = excluded.is_active,
  featured = excluded.featured,
  updated_at = now();

-- Package ↔ feature links
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$contractor-complete$wingate$, $wingate$named-accountant$wingate$, 0)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$contractor-complete$wingate$, $wingate$same-day-reply$wingate$, 1)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$contractor-complete$wingate$, $wingate$cloud-software$wingate$, 2)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$contractor-complete$wingate$, $wingate$year-end$wingate$, 3)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$contractor-complete$wingate$, $wingate$ct600$wingate$, 4)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$contractor-complete$wingate$, $wingate$self-assessment$wingate$, 5)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$contractor-complete$wingate$, $wingate$vat-returns$wingate$, 6)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$contractor-complete$wingate$, $wingate$payroll-two$wingate$, 7)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$contractor-complete$wingate$, $wingate$p11d$wingate$, 8)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$contractor-complete$wingate$, $wingate$bookkeeping-review$wingate$, 9)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$contractor-complete$wingate$, $wingate$confirmation-prep$wingate$, 10)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$contractor-complete$wingate$, $wingate$dividends$wingate$, 11)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$contractor-complete$wingate$, $wingate$reminders$wingate$, 12)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$contractor-complete$wingate$, $wingate$hmrc-help$wingate$, 13)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$contractor-complete$wingate$, $wingate$status-refs$wingate$, 14)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$contractor-complete$wingate$, $wingate$share-changes$wingate$, 15)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$contractor-complete$wingate$, $wingate$mtd-software$wingate$, 16)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$freelancer-company$wingate$, $wingate$named-accountant$wingate$, 0)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$freelancer-company$wingate$, $wingate$same-day-reply$wingate$, 1)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$freelancer-company$wingate$, $wingate$cloud-software$wingate$, 2)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$freelancer-company$wingate$, $wingate$year-end$wingate$, 3)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$freelancer-company$wingate$, $wingate$ct600$wingate$, 4)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$freelancer-company$wingate$, $wingate$self-assessment$wingate$, 5)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$freelancer-company$wingate$, $wingate$vat-returns$wingate$, 6)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$freelancer-company$wingate$, $wingate$payroll-two$wingate$, 7)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$freelancer-company$wingate$, $wingate$p11d$wingate$, 8)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$freelancer-company$wingate$, $wingate$bookkeeping-review$wingate$, 9)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$freelancer-company$wingate$, $wingate$confirmation-prep$wingate$, 10)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$freelancer-company$wingate$, $wingate$dividends$wingate$, 11)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$freelancer-company$wingate$, $wingate$reminders$wingate$, 12)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$freelancer-company$wingate$, $wingate$hmrc-help$wingate$, 13)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$freelancer-company$wingate$, $wingate$status-refs$wingate$, 14)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$freelancer-company$wingate$, $wingate$share-changes$wingate$, 15)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$freelancer-company$wingate$, $wingate$mtd-software$wingate$, 16)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$small-company$wingate$, $wingate$named-accountant$wingate$, 0)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$small-company$wingate$, $wingate$same-day-reply$wingate$, 1)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$small-company$wingate$, $wingate$cloud-software$wingate$, 2)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$small-company$wingate$, $wingate$year-end$wingate$, 3)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$small-company$wingate$, $wingate$ct600$wingate$, 4)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$small-company$wingate$, $wingate$self-assessment$wingate$, 5)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$small-company$wingate$, $wingate$vat-returns$wingate$, 6)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$small-company$wingate$, $wingate$payroll-two$wingate$, 7)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$small-company$wingate$, $wingate$p11d$wingate$, 8)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$small-company$wingate$, $wingate$bookkeeping-review$wingate$, 9)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$small-company$wingate$, $wingate$confirmation-prep$wingate$, 10)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$small-company$wingate$, $wingate$dividends$wingate$, 11)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$small-company$wingate$, $wingate$reminders$wingate$, 12)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$small-company$wingate$, $wingate$hmrc-help$wingate$, 13)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$small-company$wingate$, $wingate$status-refs$wingate$, 14)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$small-company$wingate$, $wingate$share-changes$wingate$, 15)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$small-company$wingate$, $wingate$mtd-software$wingate$, 16)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$growing-business$wingate$, $wingate$named-accountant$wingate$, 0)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$growing-business$wingate$, $wingate$same-day-reply$wingate$, 1)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$growing-business$wingate$, $wingate$cloud-software$wingate$, 2)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$growing-business$wingate$, $wingate$year-end$wingate$, 3)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$growing-business$wingate$, $wingate$ct600$wingate$, 4)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$growing-business$wingate$, $wingate$vat-returns$wingate$, 5)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$growing-business$wingate$, $wingate$bookkeeping-review$wingate$, 6)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$growing-business$wingate$, $wingate$reminders$wingate$, 7)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$growing-business$wingate$, $wingate$hmrc-help$wingate$, 8)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$self-employed-accounts$wingate$, $wingate$named-accountant$wingate$, 0)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$self-employed-accounts$wingate$, $wingate$same-day-reply$wingate$, 1)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$self-employed-accounts$wingate$, $wingate$cloud-software$wingate$, 2)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$self-employed-accounts$wingate$, $wingate$year-end$wingate$, 3)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$self-employed-accounts$wingate$, $wingate$self-assessment$wingate$, 4)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$self-employed-accounts$wingate$, $wingate$vat-returns$wingate$, 5)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$self-employed-accounts$wingate$, $wingate$payroll-two$wingate$, 6)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$self-employed-accounts$wingate$, $wingate$bookkeeping-review$wingate$, 7)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$self-employed-accounts$wingate$, $wingate$reminders$wingate$, 8)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$self-employed-accounts$wingate$, $wingate$hmrc-help$wingate$, 9)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$self-employed-accounts$wingate$, $wingate$mtd-software$wingate$, 10)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$mtd-essentials$wingate$, $wingate$named-accountant$wingate$, 0)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$mtd-essentials$wingate$, $wingate$cloud-software$wingate$, 1)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$mtd-essentials$wingate$, $wingate$mtd-software$wingate$, 2)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$mtd-essentials$wingate$, $wingate$mtd-updates$wingate$, 3)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$mtd-essentials$wingate$, $wingate$self-assessment$wingate$, 4)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$mtd-essentials$wingate$, $wingate$reminders$wingate$, 5)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$mtd-full$wingate$, $wingate$named-accountant$wingate$, 0)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$mtd-full$wingate$, $wingate$same-day-reply$wingate$, 1)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$mtd-full$wingate$, $wingate$cloud-software$wingate$, 2)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$mtd-full$wingate$, $wingate$year-end$wingate$, 3)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$mtd-full$wingate$, $wingate$self-assessment$wingate$, 4)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$mtd-full$wingate$, $wingate$vat-returns$wingate$, 5)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$mtd-full$wingate$, $wingate$payroll-two$wingate$, 6)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$mtd-full$wingate$, $wingate$bookkeeping-review$wingate$, 7)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$mtd-full$wingate$, $wingate$reminders$wingate$, 8)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$mtd-full$wingate$, $wingate$hmrc-help$wingate$, 9)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$mtd-full$wingate$, $wingate$mtd-software$wingate$, 10)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$mtd-full$wingate$, $wingate$mtd-updates$wingate$, 11)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$mtd-full$wingate$, $wingate$cis$wingate$, 12)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$personal-self-assessment$wingate$, $wingate$named-accountant$wingate$, 0)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$personal-self-assessment$wingate$, $wingate$self-assessment$wingate$, 1)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$personal-self-assessment$wingate$, $wingate$reminders$wingate$, 2)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$personal-self-assessment$wingate$, $wingate$hmrc-help$wingate$, 3)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-personal$wingate$, $wingate$named-accountant$wingate$, 0)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-personal$wingate$, $wingate$same-day-reply$wingate$, 1)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-personal$wingate$, $wingate$cloud-software$wingate$, 2)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-personal$wingate$, $wingate$property-accounts$wingate$, 3)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-personal$wingate$, $wingate$self-assessment$wingate$, 4)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-personal$wingate$, $wingate$bookkeeping-review$wingate$, 5)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-personal$wingate$, $wingate$reminders$wingate$, 6)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-personal$wingate$, $wingate$hmrc-help$wingate$, 7)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-personal$wingate$, $wingate$mtd-software$wingate$, 8)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-company$wingate$, $wingate$named-accountant$wingate$, 0)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-company$wingate$, $wingate$same-day-reply$wingate$, 1)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-company$wingate$, $wingate$cloud-software$wingate$, 2)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-company$wingate$, $wingate$year-end$wingate$, 3)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-company$wingate$, $wingate$ct600$wingate$, 4)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-company$wingate$, $wingate$self-assessment$wingate$, 5)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-company$wingate$, $wingate$vat-returns$wingate$, 6)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-company$wingate$, $wingate$payroll-two$wingate$, 7)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-company$wingate$, $wingate$p11d$wingate$, 8)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-company$wingate$, $wingate$bookkeeping-review$wingate$, 9)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-company$wingate$, $wingate$confirmation-prep$wingate$, 10)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-company$wingate$, $wingate$dividends$wingate$, 11)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-company$wingate$, $wingate$reminders$wingate$, 12)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-company$wingate$, $wingate$hmrc-help$wingate$, 13)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-company$wingate$, $wingate$status-refs$wingate$, 14)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-company$wingate$, $wingate$share-changes$wingate$, 15)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-company$wingate$, $wingate$mtd-software$wingate$, 16)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$landlord-company$wingate$, $wingate$property-accounts$wingate$, 17)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$locum-medical$wingate$, $wingate$named-accountant$wingate$, 0)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$locum-medical$wingate$, $wingate$same-day-reply$wingate$, 1)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$locum-medical$wingate$, $wingate$cloud-software$wingate$, 2)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$locum-medical$wingate$, $wingate$year-end$wingate$, 3)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$locum-medical$wingate$, $wingate$ct600$wingate$, 4)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$locum-medical$wingate$, $wingate$self-assessment$wingate$, 5)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$locum-medical$wingate$, $wingate$vat-returns$wingate$, 6)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$locum-medical$wingate$, $wingate$payroll-two$wingate$, 7)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$locum-medical$wingate$, $wingate$p11d$wingate$, 8)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$locum-medical$wingate$, $wingate$bookkeeping-review$wingate$, 9)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$locum-medical$wingate$, $wingate$confirmation-prep$wingate$, 10)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$locum-medical$wingate$, $wingate$dividends$wingate$, 11)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$locum-medical$wingate$, $wingate$reminders$wingate$, 12)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$locum-medical$wingate$, $wingate$hmrc-help$wingate$, 13)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$locum-medical$wingate$, $wingate$status-refs$wingate$, 14)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$locum-medical$wingate$, $wingate$share-changes$wingate$, 15)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$locum-medical$wingate$, $wingate$mtd-software$wingate$, 16)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$ecommerce-company$wingate$, $wingate$named-accountant$wingate$, 0)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$ecommerce-company$wingate$, $wingate$same-day-reply$wingate$, 1)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$ecommerce-company$wingate$, $wingate$cloud-software$wingate$, 2)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$ecommerce-company$wingate$, $wingate$year-end$wingate$, 3)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$ecommerce-company$wingate$, $wingate$ct600$wingate$, 4)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$ecommerce-company$wingate$, $wingate$self-assessment$wingate$, 5)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$ecommerce-company$wingate$, $wingate$vat-returns$wingate$, 6)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$ecommerce-company$wingate$, $wingate$payroll-two$wingate$, 7)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$ecommerce-company$wingate$, $wingate$p11d$wingate$, 8)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$ecommerce-company$wingate$, $wingate$bookkeeping-review$wingate$, 9)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$ecommerce-company$wingate$, $wingate$confirmation-prep$wingate$, 10)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$ecommerce-company$wingate$, $wingate$dividends$wingate$, 11)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$ecommerce-company$wingate$, $wingate$reminders$wingate$, 12)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$ecommerce-company$wingate$, $wingate$hmrc-help$wingate$, 13)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$ecommerce-company$wingate$, $wingate$status-refs$wingate$, 14)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$ecommerce-company$wingate$, $wingate$share-changes$wingate$, 15)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$ecommerce-company$wingate$, $wingate$mtd-software$wingate$, 16)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$creator-influencer$wingate$, $wingate$named-accountant$wingate$, 0)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$creator-influencer$wingate$, $wingate$same-day-reply$wingate$, 1)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$creator-influencer$wingate$, $wingate$cloud-software$wingate$, 2)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$creator-influencer$wingate$, $wingate$year-end$wingate$, 3)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$creator-influencer$wingate$, $wingate$ct600$wingate$, 4)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$creator-influencer$wingate$, $wingate$self-assessment$wingate$, 5)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$creator-influencer$wingate$, $wingate$vat-returns$wingate$, 6)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$creator-influencer$wingate$, $wingate$payroll-two$wingate$, 7)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$creator-influencer$wingate$, $wingate$p11d$wingate$, 8)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$creator-influencer$wingate$, $wingate$bookkeeping-review$wingate$, 9)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$creator-influencer$wingate$, $wingate$confirmation-prep$wingate$, 10)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$creator-influencer$wingate$, $wingate$dividends$wingate$, 11)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$creator-influencer$wingate$, $wingate$reminders$wingate$, 12)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$creator-influencer$wingate$, $wingate$hmrc-help$wingate$, 13)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$creator-influencer$wingate$, $wingate$status-refs$wingate$, 14)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$creator-influencer$wingate$, $wingate$share-changes$wingate$, 15)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;
insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values ($wingate$creator-influencer$wingate$, $wingate$mtd-software$wingate$, 16)
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;

-- Add-ons
insert into wingate_addons (
  id, firm_id, slug, name, description, price, vat_note, unit,
  applicable_package_types, is_active, source, updated_at
) values (
  $wingate$company-formation$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$company-formation$wingate$, $wingate$Company formation$wingate$, $wingate$We incorporate the company at Companies House, issue the first documents and hand you a company ready to bank and trade.$wingate$,
  152, $wingate$inc VAT$wingate$, $wingate$one-off$wingate$,
  ARRAY[$wingate$limited-companies$wingate$, $wingate$contractors-freelancers$wingate$, $wingate$medical-professional$wingate$, $wingate$ecommerce-online$wingate$, $wingate$landlords$wingate$]::text[], true, $wingate$mapped$wingate$, now()
)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  vat_note = excluded.vat_note,
  unit = excluded.unit,
  applicable_package_types = excluded.applicable_package_types,
  is_active = excluded.is_active,
  source = excluded.source,
  updated_at = now();
insert into wingate_addons (
  id, firm_id, slug, name, description, price, vat_note, unit,
  applicable_package_types, is_active, source, updated_at
) values (
  $wingate$registered-office$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$registered-office$wingate$, $wingate$Registered office$wingate$, $wingate$Use Wingate as the company’s registered office. We scan and pass on Companies House and statutory mail.$wingate$,
  9.5, $wingate$+ VAT$wingate$, $wingate$per month$wingate$,
  ARRAY[$wingate$limited-companies$wingate$, $wingate$contractors-freelancers$wingate$, $wingate$medical-professional$wingate$, $wingate$ecommerce-online$wingate$, $wingate$landlords$wingate$]::text[], true, $wingate$mapped$wingate$, now()
)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  vat_note = excluded.vat_note,
  unit = excluded.unit,
  applicable_package_types = excluded.applicable_package_types,
  is_active = excluded.is_active,
  source = excluded.source,
  updated_at = now();
insert into wingate_addons (
  id, firm_id, slug, name, description, price, vat_note, unit,
  applicable_package_types, is_active, source, updated_at
) values (
  $wingate$extra-director-sa$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$extra-director-sa$wingate$, $wingate$Extra director Self Assessment$wingate$, $wingate$A further personal tax return for an additional director or shareholder. Extra pages may be quoted if the return is complex.$wingate$,
  143, $wingate$+ VAT$wingate$, $wingate$per return$wingate$,
  ARRAY[$wingate$limited-companies$wingate$, $wingate$contractors-freelancers$wingate$, $wingate$medical-professional$wingate$, $wingate$ecommerce-online$wingate$, $wingate$landlords$wingate$]::text[], true, $wingate$mapped$wingate$, now()
)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  vat_note = excluded.vat_note,
  unit = excluded.unit,
  applicable_package_types = excluded.applicable_package_types,
  is_active = excluded.is_active,
  source = excluded.source,
  updated_at = now();
insert into wingate_addons (
  id, firm_id, slug, name, description, price, vat_note, unit,
  applicable_package_types, is_active, source, updated_at
) values (
  $wingate$confirmation-filing$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$confirmation-filing$wingate$, $wingate$Confirmation statement filing$wingate$, $wingate$We submit the confirmation statement to Companies House. Preparation is already in company packages; this covers the filing itself.$wingate$,
  48, $wingate$+ VAT$wingate$, $wingate$per filing$wingate$,
  ARRAY[$wingate$limited-companies$wingate$, $wingate$contractors-freelancers$wingate$, $wingate$medical-professional$wingate$, $wingate$ecommerce-online$wingate$, $wingate$landlords$wingate$]::text[], true, $wingate$mapped$wingate$, now()
)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  vat_note = excluded.vat_note,
  unit = excluded.unit,
  applicable_package_types = excluded.applicable_package_types,
  is_active = excluded.is_active,
  source = excluded.source,
  updated_at = now();
insert into wingate_addons (
  id, firm_id, slug, name, description, price, vat_note, unit,
  applicable_package_types, is_active, source, updated_at
) values (
  $wingate$additional-company$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$additional-company$wingate$, $wingate$Additional company$wingate$, $wingate$A second UK company on the same ownership, with accounts and corporation tax at a reduced extra-entity fee.$wingate$,
  95, $wingate$+ VAT$wingate$, $wingate$per month$wingate$,
  ARRAY[$wingate$limited-companies$wingate$, $wingate$contractors-freelancers$wingate$, $wingate$ecommerce-online$wingate$, $wingate$landlords$wingate$]::text[], true, $wingate$wingate$wingate$, now()
)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  vat_note = excluded.vat_note,
  unit = excluded.unit,
  applicable_package_types = excluded.applicable_package_types,
  is_active = excluded.is_active,
  source = excluded.source,
  updated_at = now();
insert into wingate_addons (
  id, firm_id, slug, name, description, price, vat_note, unit,
  applicable_package_types, is_active, source, updated_at
) values (
  $wingate$extra-payroll$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$extra-payroll$wingate$, $wingate$Extra payroll person$wingate$, $wingate$PAYE for each employee or director beyond the two already included in standard monthly packages.$wingate$,
  8, $wingate$+ VAT$wingate$, $wingate$per person / month$wingate$,
  ARRAY[$wingate$limited-companies$wingate$, $wingate$contractors-freelancers$wingate$, $wingate$sole-traders$wingate$, $wingate$medical-professional$wingate$, $wingate$ecommerce-online$wingate$]::text[], true, $wingate$wingate$wingate$, now()
)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  vat_note = excluded.vat_note,
  unit = excluded.unit,
  applicable_package_types = excluded.applicable_package_types,
  is_active = excluded.is_active,
  source = excluded.source,
  updated_at = now();
insert into wingate_addons (
  id, firm_id, slug, name, description, price, vat_note, unit,
  applicable_package_types, is_active, source, updated_at
) values (
  $wingate$tax-enquiry-cover$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$tax-enquiry-cover$wingate$, $wingate$Tax enquiry cover$wingate$, $wingate$Insurance-backed help if HMRC opens a routine enquiry into a return we have prepared. Terms are confirmed at engagement.$wingate$,
  15, $wingate$+ VAT$wingate$, $wingate$per month, from$wingate$,
  ARRAY[$wingate$limited-companies$wingate$, $wingate$contractors-freelancers$wingate$, $wingate$sole-traders$wingate$, $wingate$landlords$wingate$, $wingate$medical-professional$wingate$, $wingate$ecommerce-online$wingate$]::text[], true, $wingate$wingate$wingate$, now()
)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  vat_note = excluded.vat_note,
  unit = excluded.unit,
  applicable_package_types = excluded.applicable_package_types,
  is_active = excluded.is_active,
  source = excluded.source,
  updated_at = now();
insert into wingate_addons (
  id, firm_id, slug, name, description, price, vat_note, unit,
  applicable_package_types, is_active, source, updated_at
) values (
  $wingate$advisory-session$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$advisory-session$wingate$, $wingate$Specialist advisory session$wingate$, $wingate$A booked video session on a defined topic — incorporation, property structuring, or a one-off planning question.$wingate$,
  95, $wingate$+ VAT$wingate$, $wingate$per session$wingate$,
  ARRAY[$wingate$limited-companies$wingate$, $wingate$contractors-freelancers$wingate$, $wingate$sole-traders$wingate$, $wingate$landlords$wingate$, $wingate$medical-professional$wingate$, $wingate$ecommerce-online$wingate$]::text[], true, $wingate$wingate$wingate$, now()
)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  vat_note = excluded.vat_note,
  unit = excluded.unit,
  applicable_package_types = excluded.applicable_package_types,
  is_active = excluded.is_active,
  source = excluded.source,
  updated_at = now();

-- FAQs
insert into wingate_package_faqs (id, firm_id, question, answer, sort_order)
values ($wingate$faq-1$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$Who are these packages for?$wingate$, $wingate$They are for UK contractors, freelancers, sole traders, landlords, locums, online sellers and small limited companies who want a published monthly fee and a named accountant. Larger or unusual structures use Growing Business, where we quote after a short call.$wingate$, 0)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  question = excluded.question,
  answer = excluded.answer,
  sort_order = excluded.sort_order;
insert into wingate_package_faqs (id, firm_id, question, answer, sort_order)
values ($wingate$faq-2$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$Can I switch from my current accountant?$wingate$, $wingate$Yes. Once you choose a package we collect identity documents, then we write to the outgoing accountant for the records. You do not need to chase the handover yourself unless they ask you to confirm authority.$wingate$, 1)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  question = excluded.question,
  answer = excluded.answer,
  sort_order = excluded.sort_order;
insert into wingate_package_faqs (id, firm_id, question, answer, sort_order)
values ($wingate$faq-3$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$What’s included in the monthly fee?$wingate$, $wingate$The fee covers the work listed on that package: typically accounts, the matching tax return, software, a named accountant and the response promise. Each card also lists what sits outside the fee so you can add it if you need it.$wingate$, 2)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  question = excluded.question,
  answer = excluded.answer,
  sort_order = excluded.sort_order;
insert into wingate_package_faqs (id, firm_id, question, answer, sort_order)
values ($wingate$faq-4$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$Are there any hidden charges?$wingate$, $wingate$No surprise extras for the listed work. Confirmation statement filing, a registered office, extra payroll people, extra personal returns and formation are priced as add-ons. If a job falls outside the package we tell you the fee before we start.$wingate$, 3)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  question = excluded.question,
  answer = excluded.answer,
  sort_order = excluded.sort_order;
insert into wingate_package_faqs (id, firm_id, question, answer, sort_order)
values ($wingate$faq-5$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$How do I cancel?$wingate$, $wingate$Write to us and we will stop the monthly fee at the next month-end after statutory work already in progress is finished or handed back. We will not trap you in a multi-year contract. Companies House and HMRC filings already started are completed or transferred with your records.$wingate$, 4)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  question = excluded.question,
  answer = excluded.answer,
  sort_order = excluded.sort_order;
insert into wingate_package_faqs (id, firm_id, question, answer, sort_order)
values ($wingate$faq-6$wingate$, $wingate$wingate-accountants-ltd$wingate$, $wingate$Do you work with clients outside Manchester?$wingate$, $wingate$Yes. Wingate Accountants Limited is registered in London and we work with clients across the UK. Meetings are by video as standard; we can meet in person in London or Manchester by arrangement.$wingate$, 5)
on conflict (id) do update set
  firm_id = excluded.firm_id,
  question = excluded.question,
  answer = excluded.answer,
  sort_order = excluded.sort_order;
