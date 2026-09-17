"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PublicUser } from "@/lib/tax-returns/types";
import { portalHome } from "@/lib/practice/roles";

type MeResponse = { user: PublicUser | null };

export function usePortalUser() {
  const path = usePathname();
  const [user, setUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tax-returns/auth/me/", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : { user: null }))
      .then((data: MeResponse) => {
        if (!cancelled) setUser(data.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  return user;
}

export function HeaderAuth({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const user = usePortalUser();

  async function logout() {
    await fetch("/api/tax-returns/auth/logout/", { method: "POST", credentials: "include" });
    onNavigate?.();
    router.push("/");
    router.refresh();
    window.location.href = "/";
  }

  if (user) {
    const dashboard = portalHome(user.role);
    const links =
      user.role === "client"
        ? [
            { href: dashboard, label: "Dashboard" },
            { href: "/portal/tax-returns/", label: "Tax portal" },
            { href: "/portal/tax-returns/messages/", label: "Messages" },
            { href: "/portal/tax-returns/documents/", label: "Documents" },
          ]
        : [{ href: dashboard, label: "Dashboard" }];
    return (
      <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
        <Button type="button" variant="outline" className="h-10 px-4" onClick={() => void logout()}>
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Link
        href="/sign-in/"
        onClick={onNavigate}
        className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4 font-semibold tracking-wide")}
      >
        SIGN IN
      </Link>
      <Link
        href="/sign-up/"
        onClick={onNavigate}
        className={cn(buttonVariants({ variant: "default" }), "h-10 bg-accent px-4 font-semibold tracking-wide text-accent-foreground hover:bg-accent/90")}
      >
        SIGN UP
      </Link>
    </div>
  );
}
