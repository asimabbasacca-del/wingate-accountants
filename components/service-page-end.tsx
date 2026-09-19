import { RelatedServices } from "@/components/related-services";
import { LocationSeo } from "@/components/location-seo";
import { FaqSection } from "@/components/faq-section";
import { ServiceContactForm } from "@/components/service-contact-form";
import { getServicePage } from "@/lib/service-pages";

export function ServicePageEnd({
  slug,
  skipFaq,
}: {
  slug: string;
  skipFaq?: boolean;
}) {
  const page = getServicePage(slug);
  const related = page?.related ?? [
    { href: "/self-assessment-tax-returns/", title: "Self Assessment" },
    { href: "/accountancy-packages/", title: "Accountancy packages" },
    { href: "/tax-investigations/", title: "Tax investigations" },
  ];
  const faqs = page?.faqs ?? [];
  const hideFaq = skipFaq || page?.skipFaq;

  return (
    <div className="border-t border-border">
      <RelatedServices items={related} />
      <LocationSeo />
      {hideFaq ? null : <FaqSection items={faqs} />}
      <ServiceContactForm />
    </div>
  );
}
