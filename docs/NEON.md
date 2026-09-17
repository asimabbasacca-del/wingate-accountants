# Apply Wingate on Neon

Neon is the live database for accountancy packages. Do not grant to Supabase `anon` / `authenticated` roles on this project.

## 1. Put the connection string in env

Copy the **pooled** connection string into `wingate/.env.local`. Use the **direct** (non-pooler) host for applying SQL.

```
DATABASE_URL=postgresql://USER:PASSWORD@ep-….pooler.…aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://USER:PASSWORD@ep-….…aws.neon.tech/neondb?sslmode=require
```

Never commit `.env.local`. If a password was pasted in chat, rotate it in the Neon console.

## 2. Apply the SQL

From `wingate/`:

```bash
python3 scripts/apply-neon.py
```

That runs `supabase/APPLY_ON_NEON.sql` (tax-return tables + packages schema + seed). Safe to run again. It does not drop tables. Every row is tagged `firm_id = wingate-accountants-ltd`.

Or paste that file into the Neon SQL Editor.

| Table | Purpose |
| --- | --- |
| `wingate_packages` | Monthly / annual packages and prices |
| `wingate_package_groups` | Client-type groups on the public page |
| `wingate_package_features` + `wingate_package_feature_links` | What’s included |
| `wingate_addons` | Bolt-ons |
| `wingate_package_faqs` | FAQ copy |
| `wingate_package_selections` | Leads from “Choose this package” |
| `wingate_tax_*` | Tax returns portal |

## 3. Connect the Wingate app

Restart `npm run dev`. Then:

- `GET /api/packages/` returns `"source": "neon"`
- `POST /api/package-selection/` writes into `wingate_package_selections`

Without `DATABASE_URL` the site still runs from `lib/packages/data.ts` and a local JSON file.

## 4. Change a price in Neon

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

## 5. Refresh the seed after catalog edits

If you edit `lib/packages/data.ts` in git and want SQL to match:

```bash
cd wingate
npm run packages:sql
```

Then re-assemble `APPLY_ON_NEON.sql` from migrations `001` + `002` (no `GRANT` to `anon`/`authenticated`) + `003`, or run `python3 scripts/apply-neon.py` after updating that file.
