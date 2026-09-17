# Wingate backup (GitHub)

This folder is the Git-safe backup of the **Wingate Accountants** website pack. Commit it to the connected GitHub repository so schema, package prices, and the demo tax portal can be restored without the local machine.

## What is in Git

| File | What it is |
| --- | --- |
| `APPLY_IN_SUPABASE.sql` | Full Supabase schema + package/add-on prices (`firm_id = wingate-accountants-ltd`). Same as `../supabase/APPLY_IN_SUPABASE.sql`. |
| `tax-portal-seed.json` | Demo tax portal dump (accountant + one paid client). |
| `RESTORE_TAX_PORTAL.sql` | Paste into the Supabase SQL Editor to load that dump into `wingate_tax_json_store`. |

Demo logins in the seed:

- Client: `client@wingateaccountants.co.uk` / `WingateClient2026`
- Accountant: `accountant@wingateaccountants.co.uk` / `WingateStaff2026`

## What is not in Git (on purpose)

- `.env.local`, `DATABASE_URL`, Supabase service-role keys, Stripe or HMRC secrets
- Runtime `data/tax-returns.json` (gitignored; may contain extra test accounts)
- Password-reset tokens, mail logs, or uploaded PDF/image blobs
- Any client other than the Jordan Hale demo

## Restore on a new machine or a new Supabase project

1. In Supabase **SQL Editor**, paste and run `APPLY_IN_SUPABASE.sql` (skip if you already ran it).
2. Paste and run `RESTORE_TAX_PORTAL.sql`.
3. Copy `../env.example` to `../.env.local` and fill the keys (never commit that file).
4. On Vercel, set **Root Directory** to `wingate` and the same env vars. Full checklist: `../docs/LAUNCH.md`.

To restore the demo dump locally without Postgres:

```bash
mkdir -p wingate/data
cp wingate/backup/tax-portal-seed.json wingate/data/tax-returns.json
```

Then `cd wingate && npm run dev`.
