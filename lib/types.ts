export type GuideCategory =
  | "Tax"
  | "VAT"
  | "Payroll"
  | "Companies"
  | "Self Assessment"
  | "Disclosures"
  | "Property";

export type GuideSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type GuideFaq = {
  question: string;
  answer: string;
};

export type Guide = {
  slug: string;
  category: GuideCategory;
  title: string;
  seoTitle: string;
  description: string;
  excerpt: string;
  date: string;
  dateLabel: string;
  read: string;
  featured?: boolean;
  relatedSlugs: string[];
  sections: GuideSection[];
  faqs: GuideFaq[];
};
