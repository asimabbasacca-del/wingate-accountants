import { redirect } from "next/navigation";
import { readSessionUser } from "@/lib/tax-returns/session";
import { can, type Permission } from "@/lib/practice/roles";
import { PracticeApp } from "@/components/practice/practice-app";

export const dynamic = "force-dynamic";

const SECTION_PERM: Record<string, Permission | null> = {
  overview: null,
  users: "users.manage",
  clients: "clients.view",
  jobs: "jobs.manage",
  aml: "aml.manage",
  deadlines: "deadlines.view",
  documents: "files.client",
  crm: "crm.manage",
  payments: "payments.view",
  packages: "packages.manage",
  promos: "pricing.manage",
  automation: "automation.manage",
  cms: "cms.edit",
  audit: "audit.view",
  developer: "logs.view",
  billing: null,
  progress: null,
  profile: null,
};

export default async function PracticeOsPage({ params }: { params: Promise<{ section?: string[] }> }) {
  const user = await readSessionUser();
  if (!user) redirect("/sign-in/?next=/portal/os/");
  const { section: parts } = await params;
  const section = parts?.[0] || "overview";
  const perm = SECTION_PERM[section];
  if (perm && !can(user.role, perm) && !(user.role === "client" && (section === "aml" || section === "deadlines"))) {
    redirect("/portal/denied/");
  }
  if ((section === "billing" || section === "progress" || section === "profile") && user.role !== "client") redirect("/portal/denied/");
  if (section === "overview" && user.role === "marketing") redirect("/portal/os/cms/");
  if (section === "overview" && user.role === "developer") redirect("/portal/os/developer/");
  if (section === "overview" && user.role === "client") redirect("/portal/os/progress/");
  return <PracticeApp section={section} />;
}
