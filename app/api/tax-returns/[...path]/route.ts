import { NextRequest } from "next/server";
import { dispatchTaxReturns } from "@/lib/tax-returns/controllers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return dispatchTaxReturns(req, path ?? []);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return dispatchTaxReturns(req, path ?? []);
}
