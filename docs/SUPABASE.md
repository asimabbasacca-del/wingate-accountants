# Apply Wingate on Supabase

**This is the launch path.** Follow `docs/LAUNCH.md` for the full checklist (SQL, env, Vercel).

You do not need the CLI. Copy one file into the SQL Editor.

## 1. Paste the SQL

1. Open [Supabase](https://supabase.com/dashboard) → your project → **SQL Editor** → **New query**.
2. Open this file on disk:
   - **First-time / full backend:** `supabase/APPLY_IN_SUPABASE.sql`
   - **Packages tables only** (if tax-return tables are already there): `supabase/APPLY_PACKAGES_ONLY.sql`
3. Select all → copy → paste into the editor → **Run**.

The script is safe to run again. It does not drop tables or policies. Every row is tagged `firm_id = wingate-accountants-ltd`.

What it creates:

| Table | Purpose |
| --- | --- |
| `wingate_packages` | Monthly / annual packages and prices |
| `wingate_package_groups` | Client-type groups on the public page |
| `wingate_package_features` + `wingate_package_feature_links` | What’s included |
| `wingate_addons` | Bolt-ons |
| `wingate_package_faqs` | FAQ copy |
| `wingate_package_selections` | Leads from “Choose this package” |
| `wingate_tax_*` | Tax returns portal (full apply file only) |

## 2. Connect the Wingate app

In **Project Settings → API** copy the project URL and the **service role** key (server only, never the browser).

Put them in `wingate/.env.local` (or the host’s environment):

```
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Restart `npm run dev`. Then:

- `GET /api/packages/` returns `"source": "supabase"`
- `POST /api/package-selection/` writes into `wingate_package_selections`

Without those env vars the site still runs from `lib/packages/data.ts` and a local JSON file.

## 3. Change a price in Supabase

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

## 4. Refresh the paste file after catalog edits

If you edit `lib/packages/data.ts` in git and want SQL to match:

```bash
cd wingate
npm run packages:sql
```

That rewrites `migrations/003_wingate_packages_seed.sql`. Re-assemble the apply files by running the same emit, or copy 002 + 003 into the SQL Editor.
