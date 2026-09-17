import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { FAQAccordion } from "@/components/packages/faq-accordion";
import { InvestigationSidebar } from "@/components/investigations/sidebar";
import { investigationPath, relatedTopics } from "@/lib/investigations/catalog";
import type { InvestigationTopic } from "@/lib/investigations/types";
import { SITE } from "@/lib/site";

function SectionBlock({
  heading,
  paragraphs,
  bullets,
}: {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}) {
  return (
    <section className="mt-10">
      <h2 className="font-heading text-2xl font-semibold">{heading}</h2>
      {paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 48)} className="mt-3 text-muted-foreground">
          {paragraph}
        </p>
      ))}
      {bullets?.length ? (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
          {bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function InvestigationArticle({ topic }: { topic: InvestigationTopic }) {
  const related = relatedTopics(topic);
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <InvestigationSidebar current={topic.slug} />
      <article className="min-w-0 space-y-4">
        {topic.intro.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="text-base leading-relaxed text-foreground/90">
            {paragraph}
          </p>
        ))}
        {topic.sections.map((section) => (
          <SectionBlock key={section.heading} {...section} />
        ))}
        <SectionBlock {...topic.help} />
        {topic.faqs.length ? (
          <section className="mt-12">
            <h2 className="font-heading text-2xl font-semibold">Questions we are asked</h2>
            <div className="mt-6">
              <FAQAccordion items={topic.faqs} />
            </div>
          </section>
        ) : null}
        {related.length ? (
          <section className="mt-12">
            <h2 className="font-heading text-2xl font-semibold">Related investigations</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={investigationPath(item.slug)}
                    className="block rounded-xl border border-border bg-card p-4 hover:shadow-md"
                  >
                    <p className="font-heading font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <div className="mt-12 rounded-xl bg-primary p-6 text-primary-foreground">
          <h2 className="font-heading text-xl font-semibold">Talk to {SITE.name}</h2>
          <p className="mt-2 text-sm text-primary-foreground/80">
            {SITE.address}. {SITE.phone}. {SITE.email}. Free, confidential, no obligation.
          </p>
          <ButtonLink href="/contact-us/" className="mt-4 h-10 bg-accent px-4 text-accent-foreground hover:bg-accent/90">
            Contact us
          </ButtonLink>
        </div>
      </article>
    </div>
  );
}
