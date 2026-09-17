import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InvestigationArticle } from "@/components/investigations/article";
import { getInvestigationTopic, getInvestigationTopics, investigationPath } from "@/lib/investigations/catalog";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ topic: string }> };

export function generateStaticParams() {
  return getInvestigationTopics().map((topic) => ({ topic: topic.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic: slug } = await params;
  const topic = getInvestigationTopic(slug);
  if (!topic) return { title: "Page not found" };
  return {
    title: { absolute: topic.seoTitle },
    description: topic.description,
    alternates: { canonical: `${SITE.url}${investigationPath(topic.slug)}` },
  };
}

export default async function InvestigationTopicPage({ params }: Props) {
  const { topic: slug } = await params;
  const topic = getInvestigationTopic(slug);
  if (!topic) notFound();

  return (
    <>
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <Link href="/tax-investigations/" className="text-sm text-primary-foreground/70 hover:text-white">
            ← Tax Investigations and compliance
          </Link>
          <h1 className="font-heading mt-4 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">{topic.title}</h1>
          <p className="mt-4 max-w-2xl text-primary-foreground/80">{topic.summary}</p>
        </div>
      </header>
      <InvestigationArticle topic={topic} />
    </>
  );
}
