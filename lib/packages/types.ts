export type Billing = "monthly" | "annual" | "quote";

export type OnboardingKind = "tax-return" | "practice";

export type PackageFeature = {
  id: string;
  name: string;
  description: string;
};

export type ComparisonRow = {
  yearEndAccounts: string;
  taxReturns: string;
  vatSupport: string;
  payrollSupport: string;
  bookkeeping: string;
  cloudSoftware: string;
  supportLevel: string;
  responseTime: string;
};

export type PropertyBand = {
  properties: string;
  monthlyPrice: number | null;
};

export type Package = {
  id: string;
  slug: string;
  name: string;
  clientType: string;
  groupId: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  vatNote: string;
  priceNote?: string;
  billing: Billing;
  description: string;
  idealFor: string;
  highlights: string[];
  featureIds: string[];
  exclusions: string[];
  comparison: ComparisonRow;
  propertyBands?: PropertyBand[];
  onboardingKind: OnboardingKind;
  isActive: boolean;
  featured?: boolean;
};

export type PackageGroup = {
  id: string;
  name: string;
  summary: string;
};

export type AddOn = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  vatNote: string;
  unit: string;
  applicablePackageTypes: string[];
  isActive: boolean;
  source: "mapped" | "wingate";
};

export type PackageSelection = {
  id: string;
  packageId: string;
  addonIds: string[];
  name: string;
  email: string;
  phone: string;
  companyName: string;
  notes: string;
  createdAt: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};
