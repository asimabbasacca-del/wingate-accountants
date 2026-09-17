import { redirect } from "next/navigation";
import { readSessionUser } from "@/lib/tax-returns/session";
import { portalHome } from "@/lib/practice/roles";

export const dynamic = "force-dynamic";

export default async function PortalIndex() {
  const user = await readSessionUser();
  if (!user) redirect("/sign-in/?next=/portal/");
  redirect(portalHome(user.role));
}
