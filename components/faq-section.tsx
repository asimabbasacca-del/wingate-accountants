import { FAQAccordion } from "@/components/packages/faq-accordion";
import { JsonLd } from "@/components/json-ld";
import type { FaqItem } from "@/lib/packages/types";

export function FaqSection({ items, title = "Questions people ask" }: { items: FaqItem[]; title?: string }) {
  if (!items.length) return null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  return (
    <section className="border-t border-border bg-secondary/40 py-16">
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-3xl font-semibold">{title}</h2>
        <div className="mt-8">
          <FAQAccordion items={items} />
        </div>
      </div>
    </section>
  );
}
