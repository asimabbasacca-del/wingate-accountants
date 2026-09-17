import { randomUUID } from "node:crypto";
import { FIRM_ID } from "@/lib/tax-returns/types";
import type { AddOn, Package, PackageFeature, PackageGroup, PackageSelection } from "./types";
import { ADD_ONS, PACKAGE_FEATURES, PACKAGE_GROUPS, PACKAGES } from "./data";
import { getPool, isNeonConfigured } from "./db";
import { packageSelectionStore } from "./store";

type RestCfg = { url: string; key: string };

function restConfig(): RestCfg | null {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(".supabase.co")) return null;
  } catch {
    return null;
  }
  return { url, key };
}

export function isSupabaseConfigured(): boolean {
  return restConfig() !== null;
}

async function rest<T>(pathAndQuery: string, init?: RequestInit): Promise<T> {
  const cfg = restConfig();
  if (!cfg) throw new Error("Supabase is not configured");
  if (pathAndQuery.includes("://") || pathAndQuery.startsWith("//") || pathAndQuery.includes("..")) {
    throw new Error("Invalid Supabase path");
  }
  const response = await fetch(`${cfg.url}/rest/v1/${pathAndQuery}`, {
    ...init,
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init?.headers ?? {}),
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `Supabase ${response.status}`);
  }
  return (text ? JSON.parse(text) : null) as T;
}

type PackageRow = {
  id: string;
  slug: string;
  name: string;
  client_type: string;
  group_id: string;
  monthly_price: number | string | null;
  annual_price: number | string | null;
  vat_note: string;
  price_note: string | null;
  billing: Package["billing"];
  description: string;
  ideal_for: string;
  highlights: string[];
  exclusions: string[];
  comparison: Package["comparison"];
  property_bands: Package["propertyBands"];
  onboarding_kind: Package["onboardingKind"];
  is_active: boolean;
  featured: boolean;
};

function money(value: number | string | null): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function mapPackage(row: PackageRow, featureIds: string[]): Package {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    clientType: row.client_type,
    groupId: row.group_id,
    monthlyPrice: money(row.monthly_price),
    annualPrice: money(row.annual_price),
    vatNote: row.vat_note,
    priceNote: row.price_note || undefined,
    billing: row.billing,
    description: row.description,
    idealFor: row.ideal_for,
    highlights: row.highlights ?? [],
    featureIds,
    exclusions: row.exclusions ?? [],
    comparison: row.comparison,
    propertyBands: row.property_bands ?? undefined,
    onboardingKind: row.onboarding_kind,
    isActive: row.is_active,
    featured: row.featured,
  };
}

type Catalog = {
  packages: Package[];
  groups: PackageGroup[];
  features: PackageFeature[];
  addons: AddOn[];
};

function assembleCatalog(
  packages: PackageRow[],
  groups: PackageGroup[],
  features: PackageFeature[],
  links: { package_id: string; feature_id: string }[],
  addons: {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number | string;
    vat_note: string;
    unit: string;
    applicable_package_types: string[];
    is_active: boolean;
    source: AddOn["source"];
  }[],
): Catalog {
  const byPackage = new Map<string, string[]>();
  for (const link of links) {
    const list = byPackage.get(link.package_id) ?? [];
    list.push(link.feature_id);
    byPackage.set(link.package_id, list);
  }

  return {
    packages: packages.map((row) => mapPackage(row, byPackage.get(row.id) ?? [])),
    groups,
    features,
    addons: addons.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      price: money(row.price) ?? 0,
      vatNote: row.vat_note,
      unit: row.unit,
      applicablePackageTypes: row.applicable_package_types ?? [],
      isActive: row.is_active,
      source: row.source,
    })),
  };
}

export async function loadCatalogFromNeon(): Promise<Catalog | null> {
  if (!isNeonConfigured()) return null;
  try {
    const pool = getPool();
    const [packages, groups, features, links, addons] = await Promise.all([
      pool.query<PackageRow>(
        `select id, slug, name, client_type, group_id, monthly_price, annual_price, vat_note, price_note,
                billing, description, ideal_for, highlights, exclusions, comparison, property_bands,
                onboarding_kind, is_active, featured
           from wingate_packages
          where firm_id = $1 and is_active = true
          order by name asc`,
        [FIRM_ID],
      ),
      pool.query<PackageGroup>(
        `select id, name, summary from wingate_package_groups where firm_id = $1 order by sort_order asc`,
        [FIRM_ID],
      ),
      pool.query<PackageFeature>(`select id, name, description from wingate_package_features order by name asc`),
      pool.query<{ package_id: string; feature_id: string }>(
        `select package_id, feature_id from wingate_package_feature_links order by sort_order asc`,
      ),
      pool.query<{
        id: string;
        slug: string;
        name: string;
        description: string;
        price: number | string;
        vat_note: string;
        unit: string;
        applicable_package_types: string[];
        is_active: boolean;
        source: AddOn["source"];
      }>(
        `select id, slug, name, description, price, vat_note, unit, applicable_package_types, is_active, source
           from wingate_addons
          where firm_id = $1 and is_active = true
          order by name asc`,
        [FIRM_ID],
      ),
    ]);

    return assembleCatalog(packages.rows, groups.rows, features.rows, links.rows, addons.rows);
  } catch (error) {
    console.warn("Wingate packages: Neon catalog unavailable, trying fallback.", error);
    return null;
  }
}

export async function loadCatalogFromSupabase(): Promise<Catalog | null> {
  if (!restConfig()) return null;
  try {
    const [packages, groups, features, links, addons] = await Promise.all([
      rest<PackageRow[]>(`wingate_packages?firm_id=eq.${FIRM_ID}&is_active=eq.true&order=name.asc`),
      rest<PackageGroup[]>(`wingate_package_groups?firm_id=eq.${FIRM_ID}&select=id,name,summary&order=sort_order.asc`),
      rest<PackageFeature[]>(`wingate_package_features?select=id,name,description&order=name.asc`),
      rest<{ package_id: string; feature_id: string; sort_order: number }[]>(
        `wingate_package_feature_links?select=package_id,feature_id,sort_order&order=sort_order.asc`,
      ),
      rest<
        {
          id: string;
          slug: string;
          name: string;
          description: string;
          price: number | string;
          vat_note: string;
          unit: string;
          applicable_package_types: string[];
          is_active: boolean;
          source: AddOn["source"];
        }[]
      >(`wingate_addons?firm_id=eq.${FIRM_ID}&is_active=eq.true&order=name.asc`),
    ]);

    return assembleCatalog(packages, groups, features, links, addons);
  } catch (error) {
    console.warn("Wingate packages: Supabase catalog unavailable, using local catalog.", error);
    return null;
  }
}

export async function getPublishedCatalog(): Promise<Catalog & { source: "neon" | "supabase" | "local" }> {
  const neon = await loadCatalogFromNeon();
  if (neon) {
    const host = process.env.DATABASE_URL || "";
    return { ...neon, source: /supabase/i.test(host) ? "supabase" : "neon" };
  }
  const remote = await loadCatalogFromSupabase();
  if (remote) return { ...remote, source: "supabase" };
  return {
    packages: PACKAGES.filter((item) => item.isActive),
    groups: PACKAGE_GROUPS,
    features: PACKAGE_FEATURES,
    addons: ADD_ONS.filter((item) => item.isActive),
    source: "local",
  };
}

async function saveSelectionOnNeon(input: Omit<PackageSelection, "id" | "createdAt">): Promise<PackageSelection | null> {
  if (!isNeonConfigured()) return null;
  const id = `sel_${randomUUID()}`;
  try {
    const result = await getPool().query<{ id: string; created_at: Date }>(
      `insert into wingate_package_selections
        (id, firm_id, package_id, addon_ids, name, email, phone, company_name, notes)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       returning id, created_at`,
      [
        id,
        FIRM_ID,
        input.packageId,
        input.addonIds,
        input.name,
        input.email,
        input.phone,
        input.companyName,
        input.notes,
      ],
    );
    const saved = result.rows[0];
    return {
      ...input,
      id: saved?.id ?? id,
      createdAt: (saved?.created_at ?? new Date()).toISOString(),
    };
  } catch (error) {
    console.warn("Wingate packages: Neon insert failed, trying fallback.", error);
    return null;
  }
}

export async function listPackagesForAdmin(): Promise<Package[]> {
  if (isNeonConfigured()) {
    try {
      const result = await getPool().query<PackageRow>(
        `select id, slug, name, client_type, group_id, monthly_price, annual_price, vat_note, price_note,
                billing, description, ideal_for, highlights, exclusions, comparison, property_bands,
                onboarding_kind, is_active, featured
           from wingate_packages
          where firm_id = $1
          order by name asc`,
        [FIRM_ID],
      );
      return result.rows.map((row) => mapPackage(row, []));
    } catch (error) {
      console.warn("Wingate packages: admin list failed.", error);
    }
  }
  if (restConfig()) {
    try {
      const rows = await rest<PackageRow[]>(`wingate_packages?firm_id=eq.${FIRM_ID}&order=name.asc`);
      return rows.map((row) => mapPackage(row, []));
    } catch (error) {
      console.warn("Wingate packages: admin REST list failed.", error);
    }
  }
  return PACKAGES;
}

export async function savePackageRecord(pkg: Package): Promise<Package> {
  if (!isNeonConfigured()) {
    throw new Error("Connect DATABASE_URL before editing live prices.");
  }
  await getPool().query(
    `insert into wingate_packages (
        id, firm_id, slug, name, client_type, group_id, monthly_price, annual_price, vat_note, price_note,
        billing, description, ideal_for, highlights, exclusions, comparison, property_bands,
        onboarding_kind, is_active, featured, updated_at
      ) values (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15::jsonb,$16::jsonb,$17::jsonb,$18,$19,$20, now()
      )
      on conflict (id) do update set
        name = excluded.name,
        slug = excluded.slug,
        monthly_price = excluded.monthly_price,
        annual_price = excluded.annual_price,
        description = excluded.description,
        highlights = excluded.highlights,
        is_active = excluded.is_active,
        featured = excluded.featured,
        price_note = excluded.price_note,
        updated_at = now()`,
    [
      pkg.id,
      FIRM_ID,
      pkg.slug,
      pkg.name,
      pkg.clientType,
      pkg.groupId,
      pkg.monthlyPrice,
      pkg.annualPrice,
      pkg.vatNote,
      pkg.priceNote ?? "",
      pkg.billing,
      pkg.description,
      pkg.idealFor,
      JSON.stringify(pkg.highlights),
      JSON.stringify(pkg.exclusions),
      JSON.stringify(pkg.comparison),
      pkg.propertyBands ? JSON.stringify(pkg.propertyBands) : null,
      pkg.onboardingKind,
      pkg.isActive,
      Boolean(pkg.featured),
    ],
  );
  return pkg;
}

export async function savePackageSelection(input: Omit<PackageSelection, "id" | "createdAt">): Promise<PackageSelection> {
  const neonSaved = await saveSelectionOnNeon(input);
  if (neonSaved) return neonSaved;

  const cfg = restConfig();
  if (!cfg) return packageSelectionStore.create(input);
  const row = {
    id: `sel_${randomUUID()}`,
    firm_id: FIRM_ID,
    package_id: input.packageId,
    addon_ids: input.addonIds,
    name: input.name,
    email: input.email,
    phone: input.phone,
    company_name: input.companyName,
    notes: input.notes,
  };
  try {
    const inserted = await rest<Array<{ id: string; created_at: string }>>("wingate_package_selections", {
      method: "POST",
      body: JSON.stringify(row),
    });
    const saved = inserted[0];
    return {
      ...input,
      id: saved?.id ?? row.id,
      createdAt: saved?.created_at ?? new Date().toISOString(),
    };
  } catch (error) {
    console.warn("Wingate packages: Supabase insert failed, storing locally.", error);
    return packageSelectionStore.create(input);
  }
}
