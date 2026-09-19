"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CtaBanner } from "@/components/cta-banner";
import { FloatingButtons } from "@/components/floating-buttons";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getServicePage } from "@/lib/service-pages";

function hideChromeExtras(path: string) {
  return (
    path.startsWith("/portal") ||
    path.startsWith("/sign-in") ||
    path.startsWith("/sign-up") ||
    path.startsWith("/checkout") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/verify-email") ||
    path.startsWith("/tax-returns/onboarding") ||
    path.startsWith("/accountancy-packages/start")
  );
}

function crumbsFor(path: string): { href?: string; label: string }[] | null {
  if (path.startsWith("/tax-investigations/")) {
    const rest = path.replace(/^\/tax-investigations\/?/, "").replace(/\/$/, "");
    const items: { href?: string; label: string }[] = [
      { href: "/", label: "Home" },
      { href: "/services/", label: "Services" },
      { href: "/tax-investigations/", label: "Tax investigations" },
    ];
    if (rest) items.push({ label: rest.replace(/-/g, " ") });
    return items;
  }
  const slug = path.replace(/^\/|\/$/g, "").split("/")[0] || "";
  const page = getServicePage(slug);
  if (!page) return null;
  return [
    { href: "/", label: "Home" },
    { href: "/services/", label: "Services" },
    { label: page.title },
  ];
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const hide = hideChromeExtras(path);
  const crumbs = hide ? null : crumbsFor(path);

  return (
    <>
      <SiteHeader />
      <div
        className={
          hide ? "flex flex-1 flex-col" : "flex flex-1 flex-col pb-20 md:pb-0 md:pl-44"
        }
      >
        {crumbs ? <Breadcrumbs items={crumbs} /> : null}
        <main className="flex-1">{children}</main>
        {hide ? null : (
          <>
            <CtaBanner />
            <SiteFooter />
          </>
        )}
      </div>
      {hide ? null : <FloatingButtons />}
    </>
  );
}
