import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { getLivePosts } from "@/lib/content";
import { HOME_SERVICES, SITE } from "@/lib/site";
import { practiceStore } from "@/lib/practice/store";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const home = await practiceStore.publishedHome().catch(() => null);
  return {
    title: { absolute: home?.seoTitle || SITE.homeTitle },
    description: home?.description || SITE.description,
    alternates: { canonical: `${SITE.url}/` },
  };
}

export default async function HomePage() {
  const latest = getLivePosts().slice(0, 3);
  const home = await practiceStore.publishedHome().catch(() => null);
  const testimonials = await practiceStore.publishedTestimonials().catch(() => []);
  const banner = await practiceStore.publishedBanner().catch(() => null);
  const cmsPosts = await practiceStore.publishedPosts().catch(() => []);
  const heroTitle = home?.title || "Chartered accountants for contractors, the self-employed and small businesses";
  const heroText = home?.html || `${SITE.name} is a forward-thinking firm of chartered accountants and tax advisors, blending traditional values with a modern approach. We specialise in undeclared income disclosures, personal and business accountancy, and Capital Gains Tax.`;

  return (
    <>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <p className="text-sm font-medium tracking-wide text-accent uppercase">
            Professional accountancy and tax advisory
          </p>
          <h1 className="font-heading mt-3 max-w-3xl text-4xl leading-tight font-bold sm:text-5xl">
            {heroTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-primary-foreground/80">
            {heroText}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/accountancy-packages/" className="h-11 bg-accent px-5 text-accent-foreground hover:bg-accent/90">
              View accountancy packages <ArrowRight />
            </ButtonLink>
            <ButtonLink
              href="/about-us/"
              variant="outline"
              className="h-11 border-white/30 bg-transparent px-5 text-primary-foreground hover:bg-white/10 hover:text-white"
            >
              About us
            </ButtonLink>
          </div>
          {banner ? (
            <p className="mt-6 text-sm text-accent">
              <Link href={banner.html || "/online-tax-return-preparation-service/"} className="underline">
                {banner.title}
              </Link>
              {banner.description ? ` — ${banner.description}` : ""}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-3xl font-semibold">How we can help</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Link
            href="/accountancy-packages/"
            className="rounded-xl border border-border bg-card p-6 hover:shadow-md md:col-span-2"
          >
            <h3 className="font-heading text-xl font-semibold">Fixed-fee accountancy packages</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Specialist monthly packages for contractors, landlords, sole traders, locums and limited companies, with
              published prices and a named accountant.
            </p>
            <p className="mt-4 text-sm font-medium text-primary">See packages and prices</p>
          </Link>
          {HOME_SERVICES.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              className="rounded-xl border border-border bg-card p-6 hover:shadow-md"
            >
              <h3 className="font-heading text-xl font-semibold">{service.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{service.text}</p>
              <p className="mt-4 text-sm font-medium text-primary">Find out more</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-secondary/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-primary">About us</p>
            <h2 className="font-heading mt-2 text-3xl font-semibold">Wingate Accountants Ltd</h2>
            <p className="mt-4 text-muted-foreground">
              Looking for exceptional service and a personalised approach to accounting? We take
              the time to understand how your business operates, identify its challenges, and
              provide tailored financial advice.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
              <li>Improve your business’s profitability</li>
              <li>Clear, practical guidance so you can make confident decisions</li>
              <li>Certified accountants with over 15 years of expertise</li>
            </ul>
            <ButtonLink href="/about-us/" variant="outline" className="mt-6 h-10 px-4">
              Read more about us
            </ButtonLink>
          </div>
          <div>
            <h2 className="font-heading text-3xl font-semibold">Why choose us</h2>
            <p className="mt-4 text-muted-foreground">
              Specialist accountants for contractors, the self-employed and small businesses.
              Fixed-fee packages, unlimited support and advice, and a technology-driven
              accountancy solution.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              {[
                "Fixed fee packages",
                "Unlimited support and advice",
                "Specialist contractor accountants",
                "Bespoke services",
              ].map((item) => (
                <p key={item} className="rounded-lg border border-border bg-card px-3 py-2">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {testimonials.length ? (
        <section className="border-y border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="font-heading text-3xl font-semibold">What clients say</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {testimonials.map((item) => (
                <blockquote key={item.id} className="rounded-xl border border-border p-6">
                  <p className="text-muted-foreground">“{item.html}”</p>
                  <footer className="mt-4 text-sm font-medium">
                    {item.title}
                    {item.seoTitle ? ` · ${item.seoTitle}` : ""}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl font-semibold">From the blog</h2>
            <p className="mt-2 text-muted-foreground">Articles from the live Wingate site, kept on the same URLs.</p>
          </div>
          <ButtonLink href="/blog/" variant="outline" className="hidden h-10 sm:inline-flex">
            All posts
          </ButtonLink>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            ...cmsPosts.map((post) => ({
              slug: post.slug,
              path: `/${post.slug}/`,
              title: post.title,
              excerpt: post.description,
              date: post.updatedAt.slice(0, 10),
            })),
            ...latest,
          ]
            .slice(0, 3)
            .map((post) => (
              <Link key={post.slug} href={post.path} className="rounded-xl border border-border bg-card p-6 hover:shadow-md">
                <h3 className="font-heading text-lg font-semibold leading-snug">{post.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                <p className="mt-4 text-xs text-muted-foreground">{post.date}</p>
              </Link>
            ))}
        </div>
      </section>
    </>
  );
}
