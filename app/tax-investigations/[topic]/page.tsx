import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InvestigationArticle } from "@/components/investigations/article";
import { HeroWithPhoto } from "@/components/site-photo";
import { ServicePageEnd } from "@/components/service-page-end";
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
      <HeroWithPhoto
        kicker="Tax Investigations and compliance"
        title={topic.title}
        imageSrc="/images/tax-investigation-meeting.png"
        imageAlt="Accountant and client reviewing HMRC correspondence"
        actions={
          <Link
            href="/tax-investigations/"
            className="text-sm text-primary-foreground/80 underline-offset-2 hover:underline"
          >
            ← All investigation topics
          </Link>
        }
      >
        <p>{topic.summary}</p>
      </HeroWithPhoto>
      <InvestigationArticle topic={topic} />
      <ServicePageEnd slug="tax-investigations" skipFaq />
    </>
  );
}
