export type InvestigationGroupId = "enquiries" | "serious" | "disclosures" | "disputes";

export type InvestigationSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type InvestigationFaq = {
  question: string;
  answer: string;
};

export type InvestigationGroup = {
  id: InvestigationGroupId;
  name: string;
  summary: string;
};

export type InvestigationTopic = {
  slug: string;
  groupId: InvestigationGroupId;
  title: string;
  navTitle: string;
  seoTitle: string;
  description: string;
  summary: string;
  intro: string[];
  sections: InvestigationSection[];
  help: InvestigationSection;
  faqs: InvestigationFaq[];
  related: string[];
};
