export const SITE = {
  name: "Wingate Accountants",
  legalName: "Wingate Accountants Limited",
  tagline: "Chartered accountants and tax advisors in London",
  description:
    "Your trusted UK Chartered Accountants for contractors, self-employed, and small businesses. We offer expert tax advice, corporate tax planning, Capital Gains Tax (CGT) compliance, and more.",
  homeTitle: "Chartered Accountants UK | Corporate Tax Advisors & Experts",
  url: "https://www.wingateaccountants.co.uk",
  email: "enquiries@wingateaccountants.co.uk",
  phone: "01615 314179",
  phoneHref: "tel:+441615314179",
  address: "128 City Road, London, EC1V 2NX",
  hours: "Monday to Friday, 09:00–17:00",
  companyNumber: "15494836",
  ico: "ZB868558",
} as const;

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/services/", label: "Services" },
  { href: "/about-us/", label: "About Us" },
  { href: "/contact-us/", label: "Contact" },
  { href: "/online-tax-return-preparation-service/", label: "Online Tax Return Preparation Service" },
] as const;

export const NAV_MORE = [
  { href: "/accountancy-packages/", label: "Packages" },
  { href: "/blog/", label: "Blog" },
  { href: "/career/", label: "Career" },
] as const;

export const SERVICE_NAV = [
  { href: "/online-tax-return-preparation-service/", title: "Online Tax Return Preparation Service" },
  { href: "/accountancy-packages/", title: "Accountancy Packages" },
  { href: "/tax-investigations/", title: "Tax Investigations and compliance" },
  { href: "/personal-tax-accountants/", title: "Personal Tax" },
  { href: "/self-assessment-tax-returns/", title: "Self Assessment" },
  { href: "/hmrc-tax-disclosure-london/", title: "Tax Disclosures" },
  { href: "/capital-gains-tax/", title: "Capital Gains Tax" },
  { href: "/payroll-services/", title: "Payroll" },
  { href: "/bookkeeping-services/", title: "Bookkeeping" },
  { href: "/vat-accountancy-services/", title: "VAT" },
  { href: "/annual-accounts-services/", title: "Annual Accounts" },
  { href: "/business-tax-planning/", title: "Business Tax Planning" },
  { href: "/company-formation/", title: "Company Formation" },
  { href: "/construction-industry-scheme/", title: "CIS" },
  { href: "/making-tax-digital-for-income-tax/", title: "Making Tax Digital" },
] as const;

export const HOME_SERVICES = [
  {
    href: "/online-tax-return-preparation-service/",
    title: "Online Tax Return Preparation Service",
    text: "Fixed-fee Self Assessment prepared by a Wingate accountant, with secure upload, HMRC filing and a client portal to track every step.",
  },
  {
    href: "/tax-investigations/",
    title: "Tax Investigations and compliance",
    text: "Contact our specialists if HMRC has written, opened an enquiry, or you need Capital Gains Tax advice handled properly.",
  },
  {
    href: "/self-assessment-tax-returns/",
    title: "Personal Tax",
    text: "Self Assessment can be time-consuming, especially with the January deadline. We prepare and file the return for you.",
  },
  {
    href: "/hmrc-tax-disclosure-london/",
    title: "Tax Disclosure Services",
    text: "If income, rent or gains were missed, we help you disclose to HMRC the right way — from notification through to agreement.",
  },
  {
    href: "/payroll-services/",
    title: "Payroll Services",
    text: "PAYE, RTI, pensions and CIS payroll for small employers who want the monthly filings done on time.",
  },
] as const;
