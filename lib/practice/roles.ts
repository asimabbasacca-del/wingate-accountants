import type { UserRole } from "@/lib/tax-returns/types";

export type Permission =
  | "users.manage"
  | "roles.manage"
  | "security.settings"
  | "system.delete"
  | "clients.view"
  | "clients.manage"
  | "jobs.manage"
  | "files.client"
  | "messages.client"
  | "packages.manage"
  | "pricing.manage"
  | "billing.settings"
  | "payments.view"
  | "payments.refund"
  | "cms.edit"
  | "blog.manage"
  | "seo.manage"
  | "reports.view"
  | "audit.view"
  | "integrations.manage"
  | "logs.view"
  | "api.settings"
  | "deploy.settings"
  | "crm.manage"
  | "deadlines.view"
  | "aml.manage"
  | "automation.manage";

const ROLE_PERMS: Record<UserRole, Permission[]> = {
  super_admin: [
    "users.manage",
    "roles.manage",
    "security.settings",
    "system.delete",
    "clients.view",
    "clients.manage",
    "jobs.manage",
    "files.client",
    "messages.client",
    "packages.manage",
    "pricing.manage",
    "billing.settings",
    "payments.view",
    "payments.refund",
    "cms.edit",
    "blog.manage",
    "seo.manage",
    "reports.view",
    "audit.view",
    "integrations.manage",
    "logs.view",
    "api.settings",
    "deploy.settings",
    "crm.manage",
    "deadlines.view",
    "aml.manage",
    "automation.manage",
  ],
  admin: [
    "clients.view",
    "clients.manage",
    "jobs.manage",
    "files.client",
    "messages.client",
    "packages.manage",
    "pricing.manage",
    "payments.view",
    "payments.refund",
    "cms.edit",
    "blog.manage",
    "seo.manage",
    "reports.view",
    "audit.view",
    "crm.manage",
    "deadlines.view",
    "aml.manage",
    "automation.manage",
    "users.manage",
    "roles.manage",
  ],
  staff: [
    "clients.view",
    "jobs.manage",
    "files.client",
    "messages.client",
    "deadlines.view",
    "aml.manage",
  ],
  accountant: [
    "clients.view",
    "jobs.manage",
    "files.client",
    "messages.client",
    "deadlines.view",
    "aml.manage",
  ],
  marketing: ["cms.edit", "blog.manage", "seo.manage"],
  developer: ["logs.view", "api.settings", "integrations.manage", "deploy.settings", "audit.view"],
  client: ["deadlines.view"],
};

export function can(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMS[role]?.includes(permission) ?? false;
}

export function isTaxStaff(role: UserRole): boolean {
  return role === "super_admin" || role === "admin" || role === "staff" || role === "accountant";
}

export function portalHome(role: UserRole): string {
  switch (role) {
    case "super_admin":
      return "/portal/os/overview/";
    case "admin":
      return "/portal/os/overview/";
    case "staff":
    case "accountant":
      return "/portal/os/jobs/";
    case "marketing":
      return "/portal/os/cms/";
    case "developer":
      return "/portal/os/developer/";
    default:
      return "/portal/os/progress/";
  }
}

export function roleLabel(role: UserRole): string {
  return {
    super_admin: "Super Admin",
    admin: "Admin",
    staff: "Staff",
    accountant: "Staff",
    marketing: "Marketing",
    developer: "Developer",
    client: "Client",
  }[role];
}

export const DEMO_PRACTICE_LOGINS = [
  { email: "super@wingateaccountants.co.uk", password: "WingateSuper2026", role: "super_admin" as const },
  { email: "admin@wingateaccountants.co.uk", password: "WingateAdmin2026", role: "admin" as const },
  { email: "accountant@wingateaccountants.co.uk", password: "WingateStaff2026", role: "accountant" as const },
  { email: "marketing@wingateaccountants.co.uk", password: "WingateMarketing2026", role: "marketing" as const },
  { email: "developer@wingateaccountants.co.uk", password: "WingateDev2026", role: "developer" as const },
  { email: "client@wingateaccountants.co.uk", password: "WingateClient2026", role: "client" as const },
];
