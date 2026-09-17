"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const hideFooter =
    path.startsWith("/portal") ||
    path.startsWith("/tax-returns/onboarding") ||
    path.startsWith("/accountancy-packages/start");
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      {hideFooter ? null : <SiteFooter />}
    </>
  );
}
