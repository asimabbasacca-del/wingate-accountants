"use client";

import Link from "next/link";
import { usePortalUser } from "@/components/header-auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StartNowButton({ planId, className, children }: { planId?: string; className?: string; children: React.ReactNode }) {
  const user = usePortalUser();
  const guest = planId ? `/sign-up/?plan=${planId}` : "/sign-up/";
  const member = planId ? `/tax-returns/onboarding/?plan=${planId}` : "/tax-returns/onboarding/";
  const href = user ? (user.role === "accountant" ? "/portal/accountant/" : member) : guest;
  return (
    <Link href={href} className={cn(buttonVariants({ variant: "default" }), className)}>
      {children}
    </Link>
  );
}
