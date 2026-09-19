import type { NextConfig } from "next";
import { contentSecurityPolicy, isProduction, SECURITY_HEADERS } from "./lib/security/config";

const nextConfig: NextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    const base = Object.entries(SECURITY_HEADERS).map(([key, value]) => ({ key, value }));
    base.push({ key: "Content-Security-Policy", value: contentSecurityPolicy(isProduction()) });
    if (isProduction()) {
      base.push({ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" });
    }
    return [{ source: "/:path*", headers: base }];
  },
  async redirects() {
    return [
      { source: "/about/", destination: "/about-us/", permanent: true },
      { source: "/contact/", destination: "/contact-us/", permanent: true },
      { source: "/privacy/", destination: "/privacy-policy/", permanent: true },
      { source: "/tax-returns", destination: "/online-tax-return-preparation-service/", permanent: false },
      { source: "/tax-returns/", destination: "/online-tax-return-preparation-service/", permanent: false },
      { source: "/tax-returns/start", destination: "/sign-up/", permanent: false },
      { source: "/tax-returns/start/", destination: "/sign-up/", permanent: false },
      { source: "/terms/", destination: "/tax-returns/engagement-terms/", permanent: false },
      { source: "/terms-and-conditions/", destination: "/tax-returns/engagement-terms/", permanent: false },
      { source: "/services/self-assessment/", destination: "/self-assessment-tax-returns/", permanent: true },
      { source: "/services/tax-disclosure/", destination: "/hmrc-tax-disclosure-london/", permanent: true },
      { source: "/services/capital-gains/", destination: "/capital-gains-tax/", permanent: true },
      { source: "/services/companies/", destination: "/annual-accounts-services/", permanent: true },
      { source: "/services/personal-tax/", destination: "/personal-tax-accountants/", permanent: true },
      { source: "/services/tax-disclosures/", destination: "/hmrc-tax-disclosure-london/", permanent: true },
      { source: "/services/capital-gains-tax/", destination: "/capital-gains-tax/", permanent: true },
      { source: "/services/tax-investigations/", destination: "/tax-investigations/", permanent: true },
      { source: "/services/accountancy-packages/", destination: "/accountancy-packages/", permanent: true },
      { source: "/services/payroll/", destination: "/payroll-services/", permanent: true },
      { source: "/making-tax-digital-mtd-accountancy-packages/", destination: "/mtd-packages/", permanent: true },
      { source: "/mtd/", destination: "/making-tax-digital-for-income-tax/", permanent: true },
      { source: "/setting-up-and-forming-a-limited-company/", destination: "/company-formation/", permanent: true },
      { source: "/blog/:slug/", destination: "/:slug/", permanent: true },
    ];
  },
};

export default nextConfig;
