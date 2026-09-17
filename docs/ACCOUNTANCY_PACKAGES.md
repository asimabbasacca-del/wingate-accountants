# Accountancy packages

Public page: `/accountancy-packages/`  
Onboarding form: `/accountancy-packages/start/`  
APIs: `GET /api/packages/`, `GET /api/addons/`, `POST /api/package-selection/`

Catalog lives in `lib/packages/data.ts` for local preview. For production, apply `supabase/APPLY_ON_NEON.sql` (see `docs/NEON.md`). With `DATABASE_URL` set, `/accountancy-packages/` and the APIs read Neon, and selections write to Neon.

## How to edit packages

**Local / git:** open `lib/packages/data.ts`, then `npm run packages:sql` if you also need the seed file updated.

**Live on Neon:** `update wingate_packages set monthly_price = … where id = '…';` (full examples in `docs/NEON.md`).

1. Open `lib/packages/data.ts`.
2. Change the object in `PACKAGES` (name, copy, `highlights`, `exclusions`, `comparison`, `featureIds`).
3. Keep `isActive: true` for anything that should appear on the page and in `GET /api/packages/`.
4. `groupId` must match an id in `PACKAGE_GROUPS`. New groups: add an entry to `PACKAGE_GROUPS` then set `groupId` on the package.
5. Shared inclusions live in `PACKAGE_FEATURES`. Add a feature object, then reference its `id` from `featureIds`.

The page, comparison table and APIs all read this file. You do not need a CMS publish step.

## How to change prices

Monthly fees are `monthlyPrice` (number, pounds, excluding VAT unless `vatNote` says otherwise).

Annual pay-up-front fees are `annualPrice`. For monthly packages that offer 12 months with 10% off, use:

```ts
import { annualFromMonthly } from "./data";
annualPrice: annualFromMonthly(119),
```

That is `Math.round(monthly * 12 * 0.9)`.

- Quote-only packages: `billing: "quote"`, `monthlyPrice: null`, `annualPrice: null`.
- Annual-only (Personal Self Assessment): `billing: "annual"`, `monthlyPrice: null`, `annualPrice: 190`.
- Landlord bands: edit `propertyBands`. `monthlyPrice: null` means “quote”.
- Add-ons: edit `ADD_ONS` (`price`, `vatNote`, `unit`).

Pricing rule used for the first catalog: published specialist-competitor fees minus about 5%, then rounded to a clean UK figure. Document the competitor source in git history, not on the public page.

| Competitor published (+ VAT unless noted) | Wingate |
| --- | --- |
| £125 / month (contractor limited company) | £119 |
| £119 / month (freelancer / small company) | £113 |
| £62 / month (sole trader / landlord 1–2) | £59 |
| £72 / month (personal landlord, 4 properties) | £68 |
| £82 / month (personal 5 / company 3) | £78 |
| £92 / month (company landlord, 4) | £87 |
| £102 / month (company landlord, 5) | £97 |
| £49 / month (MTD software-led) | £47 |
| £79 / month (MTD accountant-led) | £75 |
| £200 + VAT (standalone Self Assessment) | £190 |
| £160 inc VAT (formation) | £152 inc VAT |
| £10 + VAT / month (registered office) | £9.50 |
| £150 + VAT (extra director SA) | £143 |
| £50 + VAT (confirmation statement filing) | £48 |

Add-ons marked `source: "wingate"` (extra payroll person, additional company, tax enquiry cover, advisory session) were not published as a competitor fee; they are Wingate rates.

## How to add a new package type

1. Add a group in `PACKAGE_GROUPS` if the client type is new.
2. Add a `Package` in `PACKAGES` with a unique `id` / `slug`.
3. Set `onboardingKind`:
   - `tax-return` — after the start form, the API sends people to `/tax-returns/start/` (sole traders, personal landlords, Self Assessment, MTD).
   - `practice` — limited companies go to `/contact-us/?package=…` so the practice team opens the file.
4. Fill `comparison` so the table stays complete.
5. Run `npm run packages:sql` and re-apply the seed, or insert the row in Neon.

## APIs

Always call with a trailing slash (`trailingSlash` is on):

- `GET /api/packages/` → `{ packages, groups, features, source }`
- `GET /api/addons/` → `{ addons, source }`
- `POST /api/package-selection/` JSON `{ packageId, addonIds, name, email, phone, companyName, notes }`

`source` is `"neon"` when `DATABASE_URL` is connected, `"supabase"` if only Supabase keys are set, otherwise `"local"`. Selections go to `wingate_package_selections` on Neon, or `data/package-selections.json` locally.

## UI components

- `PackageCard`
- `PackageGroupSection`
- `AddOnCard`
- `ComparisonTable`
- `FAQAccordion`

Copy on this page is original Wingate wording. Do not paste competitor marketing text.
