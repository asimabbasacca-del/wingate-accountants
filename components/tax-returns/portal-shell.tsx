"use client";

import Link from "next/link";
import { SITE } from "@/lib/site";

export function PortalShell({
  title,
  email,
  variant = "client",
  children,
}: {
  title: string;
  email?: string;
  variant?: "client" | "accountant" | "onboarding";
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {SITE.name} · {variant === "accountant" ? "Accountant workspace" : "My Tax Portal"}
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-heading text-3xl font-semibold">{title}</h1>
          {email ? <p className="text-xs text-muted-foreground">{email}</p> : null}
        </div>
        {variant === "client" ? (
          <nav className="mt-4 flex flex-wrap gap-4 text-sm">
            <Link className="text-primary underline" href="/portal/tax-returns/">
              Dashboard
            </Link>
            <Link className="text-primary underline" href="/portal/tax-returns/messages/">
              Messages
            </Link>
            <Link className="text-primary underline" href="/portal/tax-returns/documents/">
              Documents
            </Link>
            <Link className="text-primary underline" href="/online-tax-return-preparation-service/">
              Packages
            </Link>
          </nav>
        ) : variant === "accountant" ? (
          <nav className="mt-4 flex flex-wrap gap-4 text-sm">
            <Link className="text-primary underline" href="/portal/accountant/">
              Dashboard
            </Link>
          </nav>
        ) : null}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
