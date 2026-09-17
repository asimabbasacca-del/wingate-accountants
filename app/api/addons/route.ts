import { NextResponse } from "next/server";
import { getPublishedCatalog } from "@/lib/packages/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const catalog = await getPublishedCatalog();
  return NextResponse.json({
    addons: catalog.addons,
    source: catalog.source,
  });
}
