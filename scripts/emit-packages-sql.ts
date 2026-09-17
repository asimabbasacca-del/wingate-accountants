#!/usr/bin/env npx tsx
/**
 * Writes supabase/migrations/003_wingate_packages_seed.sql from the TypeScript catalog.
 * Run from wingate/: npx tsx scripts/emit-packages-sql.ts
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ADD_ONS, PACKAGE_FAQS, PACKAGE_FEATURES, PACKAGE_GROUPS, PACKAGES } from "../lib/packages/data";

const FIRM = "wingate-accountants-ltd";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function lit(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return `ARRAY[${value.map((item) => lit(item)).join(", ")}]::text[]`;
  }
  const json = typeof value === "string" ? value : JSON.stringify(value);
  if (!json.includes("$wingate$")) return `$wingate$${json}$wingate$`;
  return `'${json.replace(/'/g, "''")}'`;
}

function jsonb(value: unknown): string {
  if (value === null || value === undefined) return "null";
  return `${lit(JSON.stringify(value))}::jsonb`;
}

const lines: string[] = [
  "-- Seed: Wingate packages, features, add-ons, groups, FAQs",
  "-- Generated from lib/packages/data.ts. Re-run emit-packages-sql.ts after catalog edits.",
  "-- Safe to re-run: INSERT ... ON CONFLICT updates in place. No DROP.",
  "",
  `do $policy$ begin perform set_config('app.firm_id', '${FIRM}', true); end $policy$;`,
  "",
];

lines.push("-- Groups");
PACKAGE_GROUPS.forEach((group, index) => {
  lines.push(`insert into wingate_package_groups (id, firm_id, name, summary, sort_order)
values (${lit(group.id)}, ${lit(FIRM)}, ${lit(group.name)}, ${lit(group.summary)}, ${index})
on conflict (id) do update set
  firm_id = excluded.firm_id,
  name = excluded.name,
  summary = excluded.summary,
  sort_order = excluded.sort_order;`);
});

lines.push("", "-- Features");
for (const feature of PACKAGE_FEATURES) {
  lines.push(`insert into wingate_package_features (id, name, description)
values (${lit(feature.id)}, ${lit(feature.name)}, ${lit(feature.description)})
on conflict (id) do update set name = excluded.name, description = excluded.description;`);
}

lines.push("", "-- Packages");
for (const pkg of PACKAGES) {
  lines.push(`insert into wingate_packages (
  id, firm_id, slug, name, client_type, group_id,
  monthly_price, annual_price, vat_note, price_note, billing,
  description, ideal_for, highlights, exclusions, comparison, property_bands,
  onboarding_kind, is_active, featured, updated_at
) values (
  ${lit(pkg.id)}, ${lit(FIRM)}, ${lit(pkg.slug)}, ${lit(pkg.name)}, ${lit(pkg.clientType)}, ${lit(pkg.groupId)},
  ${lit(pkg.monthlyPrice)}, ${lit(pkg.annualPrice)}, ${lit(pkg.vatNote)}, ${lit(pkg.priceNote ?? "")}, ${lit(pkg.billing)},
  ${lit(pkg.description)}, ${lit(pkg.idealFor)}, ${jsonb(pkg.highlights)}, ${jsonb(pkg.exclusions)}, ${jsonb(pkg.comparison)}, ${jsonb(pkg.propertyBands ?? null)},
  ${lit(pkg.onboardingKind)}, ${lit(pkg.isActive)}, ${lit(Boolean(pkg.featured))}, now()
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
  updated_at = now();`);
}

lines.push("", "-- Package ↔ feature links");
for (const pkg of PACKAGES) {
  pkg.featureIds.forEach((featureId, index) => {
    lines.push(`insert into wingate_package_feature_links (package_id, feature_id, sort_order)
values (${lit(pkg.id)}, ${lit(featureId)}, ${index})
on conflict (package_id, feature_id) do update set sort_order = excluded.sort_order;`);
  });
}

lines.push("", "-- Add-ons");
for (const addon of ADD_ONS) {
  lines.push(`insert into wingate_addons (
  id, firm_id, slug, name, description, price, vat_note, unit,
  applicable_package_types, is_active, source, updated_at
) values (
  ${lit(addon.id)}, ${lit(FIRM)}, ${lit(addon.slug)}, ${lit(addon.name)}, ${lit(addon.description)},
  ${lit(addon.price)}, ${lit(addon.vatNote)}, ${lit(addon.unit)},
  ${lit(addon.applicablePackageTypes)}, ${lit(addon.isActive)}, ${lit(addon.source)}, now()
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
  updated_at = now();`);
}

lines.push("", "-- FAQs");
PACKAGE_FAQS.forEach((faq, index) => {
  const id = `faq-${index + 1}`;
  lines.push(`insert into wingate_package_faqs (id, firm_id, question, answer, sort_order)
values (${lit(id)}, ${lit(FIRM)}, ${lit(faq.question)}, ${lit(faq.answer)}, ${index})
on conflict (id) do update set
  firm_id = excluded.firm_id,
  question = excluded.question,
  answer = excluded.answer,
  sort_order = excluded.sort_order;`);
});

lines.push("");

const out = join(root, "supabase/migrations/003_wingate_packages_seed.sql");
writeFileSync(out, lines.join("\n"));
console.log(`Wrote ${out}`);
