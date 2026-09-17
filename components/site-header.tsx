"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { HeaderAuth } from "@/components/header-auth";
import { NAV, NAV_MORE, SERVICE_NAV, SITE } from "@/lib/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <header className="border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0 font-heading text-lg font-semibold tracking-tight text-primary">
          {SITE.name}
        </Link>
        <nav className="hidden items-center gap-5 xl:flex">
          {NAV.map((item) =>
            item.href === "/services/" ? (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  {item.label} <ChevronDown className="size-3.5" />
                </Link>
                <div className="invisible absolute left-0 top-full z-30 grid w-[34rem] grid-cols-2 gap-1 rounded-xl border border-border bg-card p-3 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                  {SERVICE_NAV.map((service) => (
                    <Link
                      key={service.href}
                      href={service.href}
                      className="rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                    >
                      {service.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : item.href === "/online-tax-return-preparation-service/" ? (
              <Link
                key={item.href}
                href={item.href}
                className="max-w-[11rem] text-center text-xs font-semibold leading-tight text-primary hover:text-accent-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ),
          )}
          <div className="relative group">
            <span className="inline-flex cursor-default items-center gap-1 text-sm text-muted-foreground">
              More <ChevronDown className="size-3.5" />
            </span>
            <div className="invisible absolute right-0 top-full z-30 min-w-[12rem] rounded-xl border border-border bg-card p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
              {NAV_MORE.map((item) => (
                <Link key={item.href} href={item.href} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <div className="hidden xl:block">
          <HeaderAuth />
        </div>
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg border border-border xl:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open ? (
        <nav className="flex flex-col gap-3 border-t border-border px-4 py-4 xl:hidden">
          {NAV.map((item) => (
            <div key={item.href}>
              <Link href={item.href} className="text-sm font-medium" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
              {item.href === "/services/" ? (
                <button
                  type="button"
                  className="ml-2 text-xs text-muted-foreground"
                  onClick={() => setServicesOpen((value) => !value)}
                >
                  {servicesOpen ? "Hide" : "Show"} list
                </button>
              ) : null}
              {item.href === "/services/" && servicesOpen
                ? SERVICE_NAV.map((service) => (
                    <Link
                      key={service.href}
                      href={service.href}
                      className="mt-1 block pl-3 text-sm text-muted-foreground"
                      onClick={() => setOpen(false)}
                    >
                      {service.title}
                    </Link>
                  ))
                : null}
            </div>
          ))}
          {NAV_MORE.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <HeaderAuth onNavigate={() => setOpen(false)} />
        </nav>
      ) : null}
    </header>
  );
}
