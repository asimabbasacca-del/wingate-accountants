import type { FaqItem } from "@/lib/packages/types";

export const MTD_PACKAGE_IDS = ["mtd-essentials", "mtd-full"] as const;

export const MTD_TIMELINE = [
  { date: "6 April 2026", text: "MTD for Income Tax starts for sole traders and landlords with qualifying income over £50,000." },
  { date: "7 August 2026", text: "First quarterly update due for April to June 2026." },
  { date: "7 November 2026", text: "Second quarterly update due for July to September 2026." },
  { date: "7 February 2027", text: "Third quarterly update due for October to December 2026." },
  { date: "7 May 2027", text: "Fourth quarterly update due for January to March 2027." },
  { date: "April 2027", text: "The £30,000 income threshold comes into scope." },
  { date: "April 2028", text: "The £20,000 income threshold comes into scope." },
];

export const MTD_COMPARISON: { label: string; comply: string; complete: string }[] = [
  { label: "Set up and onboarding with MTD-ready software", comply: "Xero or QuickBooks", complete: "Xero or QuickBooks" },
  { label: "Self Assessment and MTD registration with HMRC", comply: "Included", complete: "Included" },
  { label: "Quarterly MTD update submissions", comply: "Included", complete: "Included" },
  { label: "Year-end final declaration", comply: "Included", complete: "Included" },
  { label: "Automated deadline reminders", comply: "Included", complete: "Included" },
  { label: "Email support from a named accountant", comply: "Included", complete: "Included" },
  { label: "Dedicated accountant", comply: "Basic monthly cover", complete: "Full year-round cover" },
  { label: "Phone and video advice", comply: "—", complete: "Included" },
  { label: "Quarterly review of the books", comply: "—", complete: "Included" },
  { label: "Help with allowable expenses", comply: "Checklist", complete: "Accountant-led" },
  { label: "Quarterly tax estimates", comply: "—", complete: "Included" },
  { label: "Self-employed accounts at year end", comply: "—", complete: "Included" },
  { label: "VAT returns when registered", comply: "—", complete: "Included" },
  { label: "Payroll (up to two people)", comply: "—", complete: "Included" },
  { label: "CIS support (up to two subcontractors)", comply: "—", complete: "Included" },
];

export const MTD_FAQS: FaqItem[] = [
  {
    question: "Who does MTD for Income Tax apply to?",
    answer:
      "Individuals only: sole traders and landlords (including jointly owned lets held in your own name) once qualifying income is over the HMRC threshold. Limited companies and LLPs are not on this Income Tax MTD timetable. If your combined self-employment and property income was over £50,000 in 2024–25, you start in April 2026. Between £30,000 and £50,000 starts April 2027. £20,000 follows in April 2028.",
  },
  {
    question: "What do I have to do under MTD?",
    answer:
      "Keep digital records of income and expenses, use MTD-compatible software, send quarterly updates to HMRC, and file a final declaration at the year end. Spreadsheets on their own are not enough once you are in scope.",
  },
  {
    question: "Do I still need a Self Assessment?",
    answer:
      "The annual Self Assessment remains for 2025–26. From the tax year you enter MTD, the final declaration replaces the old year-end return for those sources. Both Wingate MTD packages include the year-end filing for the personal income they cover.",
  },
  {
    question: "Which package is the basic monthly subscription?",
    answer:
      "MTD Comply is the basic monthly package: software, registration help, quarterly updates and the year-end declaration, with email support from a named accountant. MTD Complete is the accountant-led monthly package, with bookkeeping reviews, VAT, payroll and CIS where they apply.",
  },
  {
    question: "Is MTD bridging live on this website?",
    answer:
      "MTD bridging from this portal is in development. Your named accountant still prepares the submissions that are live today, using HMRC-recognised software. We will not pretend a live HMRC sandbox connection exists until those credentials work.",
  },
  {
    question: "Do landlords and CIS subcontractors use the same packages?",
    answer:
      "Yes, if the income is reported on a personal tax return. MTD Comply is enough when you keep your own records. MTD Complete is the better fit for mixed income, CIS or VAT. Property held in a company uses a landlord or limited-company package instead.",
  },
  {
    question: "Can I keep using Xero or QuickBooks I already have?",
    answer:
      "Yes. We include Xero or QuickBooks in both monthly packages. If you already subscribe, we join that file rather than forcing a second licence.",
  },
];
