# Launch Wingate on Supabase + Vercel

This folder is the **Wingate Accountants** website only. Use it as the Vercel root. Do not deploy the repository root.

## What goes where

| Piece | Lives in | After launch |
| --- | --- | --- |
| Pages, blog, tax investigations | files in this folder | Vercel |
| Accountancy packages + lead form | Postgres tables `wingate_packages*` | Supabase |
| Tax portal accounts, messages, documents | `wingate_tax_json_store` + `wingate_tax_file_blobs` | Supabase |
| Uploaded PDFs / images | `wingate_tax_file_blobs` | Supabase |

Without env vars the site still runs from `lib/packages/data.ts` and a local `data/` JSON file. That local file **does not survive** a Vercel deploy. Set the database before you publish.

## 1. Create a Supabase project

1. Open [supabase.com/dashboard](https://supabase.com/dashboard) and create a project (any region; UK `eu-west-2` is a good fit).
2. Wait until the database is ready.

## 2. Paste the SQL

1. In Supabase: **SQL Editor → New query**.
2. Open `supabase/APPLY_IN_SUPABASE.sql` in this folder (the full file: tax tables, packages schema, seed prices, and the tax portal dump tables).
3. Select all → copy → paste → **Run**.

It is safe to run again. It does not drop tables. Every catalog row is tagged `firm_id = wingate-accountants-ltd`.

From this machine you can also apply it if `wingate/.env.local` already has a connection string:

```bash
cd wingate
python3 scripts/apply-supabase.py
```

## 3. Copy keys into `.env.local`

In Supabase:

- **Project Settings → API**
  - Project URL
  - `service_role` key (server only — never put this in the browser)
- **Project Settings → Database**
  - **Connection string → URI**
  - Prefer the **Session pooler** (port `5432`) for this Next.js app
  - Direct (non-pooler) URI is best for `python3 scripts/apply-supabase.py`

Create `wingate/.env.local` (gitignored):

```
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role...

DATABASE_URL=postgresql://postgres.YOUR-REF:PASSWORD@HOST.pooler.supabase.com:5432/postgres?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://postgres.YOUR-REF:PASSWORD@HOST.db.supabase.co:5432/postgres?sslmode=require

WINGATE_TAX_APP_URL=http://127.0.0.1:43191
WINGATE_TAX_SESSION_SECRET=replace-with-a-long-random-string-at-least-32-chars
# Local only (never set in Vercel production):
# WINGATE_MAIL_PREVIEW=1
# STRIPE_ALLOW_UNSIGNED_WEBHOOK=1
```

Restart `npm run dev`, then:

```bash
curl -s http://127.0.0.1:43191/api/packages/ | python3 -c 'import sys,json; print(json.load(sys.stdin)["source"])'
```

You want `"supabase"` (or `"neon"` if you pointed `DATABASE_URL` at Neon instead). Then `POST /api/package-selection/` writes into `wingate_package_selections`.

Demo tax portal (seeded on first request if the dump is empty):

- Client: `client@wingateaccountants.co.uk` / `WingateClient2026`
- Accountant: `accountant@wingateaccountants.co.uk` / `WingateStaff2026`

## 4. Publish on Vercel

1. Import the git repository into Vercel.
2. Set **Root Directory** to `wingate`. Leave the framework as Next.js.
3. Add the same env vars for **Production** and **Preview**:
   - `DATABASE_URL` — Supabase **session pooler** URI (`sslmode=require`)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `WINGATE_TAX_APP_URL` — the live URL, e.g. `https://www.wingateaccountants.co.uk`
   - `WINGATE_TAX_SESSION_SECRET` — at least 32 random characters (not a placeholder)
   - Do **not** set `WINGATE_MAIL_PREVIEW=1` or `STRIPE_ALLOW_UNSIGNED_WEBHOOK=1` in production
4. Optional: `STRIPE_SECRET_KEY` for live card checkout. Empty = test payment in onboarding.
5. Deploy.

Do **not** set Root Directory to `/`. This website lives in `wingate/`.

After deploy, open:

- `/` — Wingate homepage
- `/accountancy-packages/` — prices from Supabase
- `/online-tax-return-preparation-service/` — tax return sales page
- `/sign-up/` / `/sign-in/` — client accounts (stored in Supabase)

## 5. Change a price after launch

SQL Editor:

```sql
update wingate_packages
set monthly_price = 119, annual_price = 1285, updated_at = now()
where id = 'contractor-complete';
```

Add-ons:

```sql
update wingate_addons
set price = 9.50, updated_at = now()
where id = 'registered-office';
```

Keep `is_active = true` for anything that should appear on `/accountancy-packages/`.

## Optional Stripe and HMRC

- `STRIPE_SECRET_KEY` — live Checkout. Without it, onboarding confirms a test card. Mock checkout is disabled in production when this key is set.
- `STRIPE_WEBHOOK_SECRET` — required to accept Stripe webhooks in production. Unsigned JSON is refused unless you are not in production **and** `STRIPE_ALLOW_UNSIGNED_WEBHOOK=1`.
- `HMRC_CLIENT_ID` / `HMRC_CLIENT_SECRET` — do not retry sandbox OAuth (`invalid_client`). MTD for Income Tax bridging is **in development**.

Google and Microsoft login buttons stay disabled until you add OAuth credentials.

## Files in this pack

| File | Use |
| --- | --- |
| `supabase/APPLY_IN_SUPABASE.sql` | Paste into Supabase SQL Editor (everything) |
| `supabase/APPLY_PACKAGES_ONLY.sql` | Packages only, if tax tables already exist |
| `supabase/migrations/` | Same SQL split into 001–004 |
| `scripts/apply-supabase.py` | Apply the full file from the CLI |
| `env.example` | Copy to `.env.local` and fill in |
| `docs/SUPABASE.md` | Extra notes for the SQL Editor path |
| `docs/TAX_RETURNS_PORTAL.md` | Client portal behaviour |
| `backup/` | GitHub-safe schema + demo tax-portal dump (no secrets) |
