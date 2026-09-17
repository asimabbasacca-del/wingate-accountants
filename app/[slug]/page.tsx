import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CmsHtml } from "@/components/cms-html";
import { ButtonLink } from "@/components/button-link";
import { ContactForm } from "@/components/contact-form";
import { getPage, getPages, getPost, getPosts, relatedPosts } from "@/lib/content";
import { SITE } from "@/lib/site";
import { practiceStore } from "@/lib/practice/store";
import { safeJsonLd } from "@/lib/security/html";

const DEDICATED_SLUGS = new Set(["tax-investigations", "online-tax-return-preparation-service"]);

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [...getPages(), ...getPosts()]
    .filter((item) => !DEDICATED_SLUGS.has(item.slug))
    .map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const record = getPage(slug) ?? getPost(slug);
  const override = await practiceStore.publishedBySlug(slug).catch(() => null);
  if (!record && !override) return { title: "Page not found" };
  const title = override?.seoTitle || override?.title || record?.seoTitle || record?.title || slug;
  const description = override?.description || record?.description || "";
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${SITE.url}/${slug}/` },
    openGraph: {
      title: override?.title || record?.title || slug,
      description,
      url: `${SITE.url}/${slug}/`,
      type: override?.kind === "post" || record?.kind === "post" ? "article" : "website",
      publishedTime: record?.date,
    },
  };
}

export default async function CmsSlugPage({ params }: Props) {
  const { slug } = await params;
  const page = getPage(slug);
  const post = getPost(slug);
  const record = page ?? post;
  const override = await practiceStore.publishedBySlug(slug).catch(() => null);
  if (!record && !override) notFound();

  const title = override?.title || record?.title || slug;
  const html = override?.html || record?.html || "";
  const related = post ? relatedPosts(post) : [];
  const isPost = override?.kind === "post" || record?.kind === "post";

  const jsonLd =
    isPost
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description: override?.description || record?.description,
          datePublished: record?.date || override?.updatedAt,
          author: { "@type": "Organization", name: SITE.name },
          publisher: { "@type": "Organization", name: SITE.legalName },
          mainEntityOfPage: `${SITE.url}/${slug}/`,
        }
      : null;

  return (
    <article>
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      ) : null}
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          {isPost ? (
            <Link href="/blog/" className="text-sm text-primary-foreground/70 hover:text-white">
              ← Blog
            </Link>
          ) : (
            <Link href="/services/" className="text-sm text-primary-foreground/70 hover:text-white">
              ← Services
            </Link>
          )}
          <h1 className="font-heading mt-4 text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
          {post ? (
            <p className="mt-4 text-sm text-primary-foreground/75">
              {post.date} · {SITE.name}
              {post.source === "extra" ? " · extra guide" : ""}
            </p>
          ) : null}
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <CmsHtml html={html} />
        {slug === "contact-us" ? (
          <div className="mt-10">
            <Suspense fallback={<p className="text-sm text-muted-foreground">Loading the enquiry form…</p>}>
              <ContactForm />
            </Suspense>
          </div>
        ) : null}
          {record?.kind === "page" && slug !== "contact-us" && slug !== "thank-you" && slug !== "privacy-policy" ? (
          <div className="mt-12 rounded-xl bg-primary p-6 text-primary-foreground">
            <h2 className="font-heading text-xl font-semibold">Talk to {SITE.name}</h2>
            <p className="mt-2 text-sm text-primary-foreground/80">
              {SITE.address}. {SITE.phone}. {SITE.email}.
            </p>
            <ButtonLink href="/contact-us/" className="mt-4 h-10 bg-accent px-4 text-accent-foreground hover:bg-accent/90">
              Contact us
            </ButtonLink>
          </div>
        ) : null}
      </div>
      {related.length ? (
        <section className="border-t border-border bg-secondary/50 py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-heading text-2xl font-semibold">Keep reading</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {related.map((item) => (
                <Link key={item.slug} href={item.path} className="rounded-xl border border-border bg-card p-6 hover:shadow-md">
                  <h3 className="font-heading font-semibold leading-snug">{item.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{item.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}
