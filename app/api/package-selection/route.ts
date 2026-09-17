import { NextRequest, NextResponse } from "next/server";
import { getPublishedCatalog, savePackageSelection } from "@/lib/packages/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(asString).filter(Boolean);
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ error: "Send a JSON body." }, { status: 400 });
  }

  const catalog = await getPublishedCatalog();
  const slug = asString(body.packageId) || asString(body.packageSlug);
  const pkg = catalog.packages.find((item) => item.id === slug || item.slug === slug);
  if (!pkg) {
    return NextResponse.json({ error: "Choose a published package." }, { status: 400 });
  }

  const name = asString(body.name);
  const email = asString(body.email);
  if (!name || !email || !email.includes("@")) {
    return NextResponse.json({ error: "Name and a valid email are required." }, { status: 400 });
  }

  const allowedAddons = new Set(catalog.addons.map((item) => item.id));
  const addonIds = asStringArray(body.addonIds).filter((id) => allowedAddons.has(id));

  const selection = await savePackageSelection({
    packageId: pkg.id,
    addonIds,
    name,
    email,
    phone: asString(body.phone),
    companyName: asString(body.companyName),
    notes: asString(body.notes),
  });

  const nextPath =
    pkg.onboardingKind === "tax-return"
      ? `/sign-up/?package=${encodeURIComponent(pkg.slug)}`
      : `/contact-us/?package=${encodeURIComponent(pkg.slug)}`;

  return NextResponse.json({ selection, nextPath, onboardingKind: pkg.onboardingKind });
}
