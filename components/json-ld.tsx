import { SITE } from "@/lib/site";
import { safeJsonLd } from "@/lib/security/html";

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["AccountingService", "ProfessionalService", "LocalBusiness"],
        "@id": `${SITE.url}/#business`,
        name: SITE.name,
        legalName: SITE.legalName,
        url: SITE.url,
        email: SITE.email,
        telephone: SITE.phoneHref.replace("tel:", ""),
        image: `${SITE.url}/images/practice-office.png`,
        description: `${SITE.name} are chartered accountants and tax advisors in London, working with clients in Manchester and across the UK.`,
        address: {
          "@type": "PostalAddress",
          streetAddress: "128 City Road",
          addressLocality: "London",
          postalCode: "EC1V 2NX",
          addressCountry: "GB",
        },
        areaServed: [
          { "@type": "City", name: "London" },
          { "@type": "City", name: "Manchester" },
          { "@type": "Country", name: "United Kingdom" },
        ],
        openingHours: "Mo-Fr 09:00-17:00",
        priceRange: "££",
        knowsAbout: ["Accountant", "Tax advisor", "Self Assessment", "Corporation tax", "Making Tax Digital", "Payroll"],
      },
      {
        "@type": "Occupation",
        name: "Accountant",
        occupationLocation: { "@type": "Country", name: "United Kingdom" },
      },
      {
        "@type": "Occupation",
        name: "Tax advisor",
        occupationLocation: { "@type": "Country", name: "United Kingdom" },
      },
    ],
  };
}
