import type { Metadata } from "next";
import Link from "next/link";
import { PackageStartForm } from "@/components/packages/package-start-form";
import { getPublishedCatalog } from "@/lib/packages/backend";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Start your package – Wingate Accountants Ltd" },
  robots: { index: false, follow: false },
};

export default async function PackageStartPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string; addon?: string }>;
}) {
  const params = await searchParams;
  const catalog = await getPublishedCatalog();
  const packageSlug = Array.isArray(params.package) ? params.package[0] : params.package;
  const addonSlug = Array.isArray(params.addon) ? params.addon[0] : params.addon;
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-5xl lg:grid-cols-2">
        <section className="bg-primary px-6 py-12 text-primary-foreground lg:py-24">
          <Link href="/accountancy-packages/" className="text-sm text-primary-foreground/70 hover:text-white">
            ← Accountancy packages
          </Link>
          <h1 className="font-heading mt-6 text-3xl font-bold sm:text-4xl">Tell us which package you want</h1>
          <p className="mt-4 max-w-md text-primary-foreground/80">
            Step 2 of onboarding. We save your choice, then take you to identity checks (personal and sole-trader work)
            or to the practice team (limited companies). {SITE.name} will assign a named accountant.
          </p>
          <ol className="mt-10 space-y-3 text-sm text-primary-foreground/80">
            <li>1. Package selected</li>
            <li>2. This form</li>
            <li>3. ID and business documents</li>
            <li>4. Meet your accountant</li>
          </ol>
        </section>
        <section className="flex items-center px-6 py-12">
          <div className="mx-auto w-full max-w-md">
            <PackageStartForm
              packages={catalog.packages}
              addons={catalog.addons}
              initialPackage={packageSlug}
              initialAddon={addonSlug}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
