# Paste this to go live (Supabase → GitHub → Vercel)

Do these three steps in order. The website code lives in the `wingate/` folder. Vercel **Root Directory must be `wingate`**. Do not deploy the repository root.

---

## 1. Supabase — paste the SQL

1. Open [supabase.com/dashboard](https://supabase.com/dashboard) → **New project** (region `eu-west-2` London is a good fit).
2. Wait until the database is ready.
3. **SQL Editor → New query**.
4. Open `wingate/supabase/APPLY_IN_SUPABASE.sql` (the whole file).
5. Select all → copy → paste → **Run**.

It is safe to run again. It does not drop tables. Every catalog row uses `firm_id = wingate-accountants-ltd`.

If tax-return tables already exist and you only need packages: paste `wingate/supabase/APPLY_PACKAGES_ONLY.sql` instead.

### Then copy these from Supabase

**Project Settings → API**

- Project URL → `SUPABASE_URL`
- `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY` (server only — never the `anon` key, never the browser)

**Project Settings → Database → Connect → URI**

- **Session pooler** (port `5432`) → `DATABASE_URL`  
  Add `?sslmode=require` if it is not already there.
- Direct (non-pooler) URI → `DATABASE_URL_UNPOOLED` (only needed if you apply SQL from a laptop)

---

## 2. GitHub — put the code in a repo

This project does not have a GitHub repository yet. Click **Create repo** in this chat, then GitHub has the code.

Suggested GitHub values (paste these in the create-repo form):

```
Name: wingate-accountants
Description: Wingate Accountants website — tax, accountancy packages, Self Assessment and MTD. Deploy the wingate/ folder on Vercel.
Visibility: Private
```

Do **not** commit `.env.local` or any API keys.

If you already have a GitHub repo you want to use, copy this whole project into it (or push this branch), still keeping the `wingate/` folder.

---

## 3. Vercel — publish the website

1. Click **Publish** in this chat (or Import the GitHub repo at [vercel.com/new](https://vercel.com/new)).
2. Set **Root Directory** to `wingate`. Framework: Next.js.
3. Paste these environment variables for **Production** and **Preview**:

```
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=paste-the-service-role-secret
DATABASE_URL=postgresql://postgres.YOUR-REF:YOUR-PASSWORD@HOST.pooler.supabase.com:5432/postgres?sslmode=require
WINGATE_TAX_APP_URL=https://www.wingateaccountants.co.uk
WINGATE_TAX_SESSION_SECRET=paste-a-random-string-at-least-32-characters
```

4. Generate the session secret once (do not reuse the local placeholder):

```bash
openssl rand -hex 32
```

5. Deploy.
6. After the first live URL exists, set `WINGATE_TAX_APP_URL` to that URL (or `https://www.wingateaccountants.co.uk` once DNS is switched) and redeploy.

### Do not set in production

```
WINGATE_MAIL_PREVIEW
STRIPE_ALLOW_UNSIGNED_WEBHOOK
```

### Optional later

```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

Empty Stripe keys = test-card checkout. Live card payments need both Stripe keys plus a webhook pointing at `/api/stripe/webhook/`.

MTD bridging is in development. Do not add HMRC sandbox keys.

---

## After it is live, open

- `/` — homepage
- `/accountancy-packages/` — prices from Supabase
- `/self-assessment-tax-returns/` — Self Assessment
- `/company-formation/` — formation at £150
- `/contact-us/` — enquiry form
- `/sign-in/` — client portal

Demo portal logins (change these in production):

- Client: `client@wingateaccountants.co.uk` / `WingateClient2026`
- Accountant: `accountant@wingateaccountants.co.uk` / `WingateStaff2026`

---

## Change a price after launch

Supabase SQL Editor:

```sql
update wingate_packages
set monthly_price = 119, annual_price = 1285, updated_at = now()
where id = 'contractor-complete';

update wingate_addons
set price = 150, vat_note = '', updated_at = now()
where id = 'company-formation';
```
