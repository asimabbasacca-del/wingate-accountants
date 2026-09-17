import Link from "next/link";
import { NAV, NAV_MORE, SERVICE_NAV, SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-heading text-lg font-semibold">{SITE.name}</p>
          <p className="mt-3 max-w-md text-sm text-primary-foreground/75">
            Independent firm of chartered accountants. Tax and compliance services for businesses
            and individuals.
          </p>
          <p className="mt-4 text-sm">{SITE.address}</p>
          <p className="mt-1 text-sm">
            <a className="hover:underline" href={SITE.phoneHref}>
              {SITE.phone}
            </a>
          </p>
          <p className="mt-1 text-sm">
            <a className="hover:underline" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
          </p>
          <p className="mt-2 text-sm text-primary-foreground/75">
            {SITE.hours}. Saturday and Sunday closed.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Navigation</p>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link className="hover:text-white" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
            {NAV_MORE.map((item) => (
              <li key={item.href}>
                <Link className="hover:text-white" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link className="hover:text-white" href="/tax-returns/aml-policy/">
                AML policy
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/tax-returns/engagement-terms/">
                Engagement terms
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/privacy-policy/">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Our services</p>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
            {SERVICE_NAV.slice(0, 8).map((item) => (
              <li key={item.href}>
                <Link className="hover:text-white" href={item.href}>
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-6 text-xs text-primary-foreground/60 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-2">
          <p>
            {SITE.name} is a trading name of {SITE.legalName}, registered in England and Wales
            (company {SITE.companyNumber}). ICO registration {SITE.ico}. HMRC and Companies House
            registered and authorised agents.
          </p>
          <p>Copyright © {new Date().getFullYear()} {SITE.name}. Accountancy and bookkeeping services.</p>
        </div>
      </div>
    </footer>
  );
}
