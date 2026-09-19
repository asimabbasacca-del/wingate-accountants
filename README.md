# Wingate Accountants

Replacement website for **[wingateaccountants.co.uk](https://www.wingateaccountants.co.uk)**. This folder is only Wingate Accountants Ltd.

The rebuild keeps the live site’s public URLs, titles and copy so SEO can transfer when DNS is switched. Extra tax guides (from a separate briefing site’s topics, rewritten for Wingate) are added as **new** URLs and do not replace existing posts.

## Accountancy packages

Fixed-fee specialist packages (contractors, landlords, sole traders, locums, e-commerce and limited companies):

- Public: http://127.0.0.1:43191/accountancy-packages/
- Onboarding: `/accountancy-packages/start/`
- APIs: `/api/packages/`, `/api/addons/`, `POST /api/package-selection/`

Edit fees and copy in `lib/packages/data.ts`. Live catalog is Postgres: apply `supabase/APPLY_IN_SUPABASE.sql` and set `DATABASE_URL` — see `docs/LAUNCH.md`.

## Tax investigations and compliance

Hub: http://127.0.0.1:43191/tax-investigations/

Side pages (HMRC enquiry, personal/company/VAT/PAYE, COP8/COP9, disclosure, tribunal and others) live under `/tax-investigations/<topic>/`. Copy is original Wingate wording covering the same investigation topics as a specialist enquiry practice. Edit `lib/investigations/data.ts`.

## Company formation

Dedicated page: http://127.0.0.1:43191/company-formation/

UK limited company incorporation is **£150**. Checkout uses `/accountancy-packages/start/?package=small-company&addon=company-formation`.

## Online Tax Return Preparation Service

Primary Self Assessment onboarding on the same Wingate website (header, branding and navigation):

- Sales page: http://127.0.0.1:43191/online-tax-return-preparation-service/
- Sign up: `/sign-up/` · Sign in: `/sign-in/`
- Client portal: `/portal/tax-returns/`
- Accountant: `/portal/accountant/`

Demo accountant: `accountant@wingateaccountants.co.uk` / `WingateStaff2026`  
Demo client: `client@wingateaccountants.co.uk` / `WingateClient2026`  
Demo Super Admin: `super@wingateaccountants.co.uk` / `WingateSuper2026`  
Demo Admin: `admin@wingateaccountants.co.uk` / `WingateAdmin2026`  
Demo Marketing: `marketing@wingateaccountants.co.uk` / `WingateMarketing2026`  
Demo Developer: `developer@wingateaccountants.co.uk` / `WingateDev2026`

Practice OS (RBAC, CMS, Stripe checkout, CRM, AML, HMRC deadlines): `/portal/os/` after sign-in.

See `docs/TAX_RETURNS_PORTAL.md`.

Apply `supabase/APPLY_IN_SUPABASE.sql` (or `python3 scripts/apply-supabase.py`) to create the backend tables. Full launch steps: `docs/LAUNCH.md`. Security assessment and post-fix status: `docs/OWASP_REPORT.md`.

GitHub-safe backup of schema and the demo tax portal: `backup/` (no `.env.local`, no live client files). Restore with `backup/RESTORE_TAX_PORTAL.sql` after the schema SQL.

## Run locally

```bash
cd wingate
npm install
npm run dev
```

Open http://127.0.0.1:43191

## Publish on Vercel

This folder is the website. In Vercel set **Root Directory** to `wingate` (do not deploy the repo root).

Copy-paste checklist (Supabase SQL, GitHub, Vercel env): `docs/GO_LIVE.md`. Full notes: `docs/LAUNCH.md`.

Environment variables (Production + Preview):

- `DATABASE_URL` — Supabase **session pooler** URI (`sslmode=require`)
- `SUPABASE_URL` — `https://YOUR-PROJECT.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (server only)
- `WINGATE_TAX_APP_URL` — the live site URL, e.g. `https://www.wingateaccountants.co.uk`
- `WINGATE_TAX_SESSION_SECRET` — a long random string of at least 32 characters (not the local placeholder)

Without `DATABASE_URL`, packages fall back to `lib/packages/data.ts` and the tax portal uses a local JSON file that Vercel will not keep. Stripe is optional; tax onboarding uses a test card if `STRIPE_SECRET_KEY` is empty.

## Content

- `content/live-pages.json` and `content/live-posts.json` — imported from the current WordPress site.
- `lib/guides.ts` — extra original guides.
- Refresh live JSON: `python3 scripts/import-live.py` (needs a prior dump in `/tmp/wingate-live`).
