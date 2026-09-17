import { ADD_ONS, PACKAGE_FEATURES, PACKAGE_GROUPS, PACKAGES } from "./data";
import type { AddOn, Package, PackageFeature, PackageGroup } from "./types";

export function getActivePackages(): Package[] {
  return PACKAGES.filter((item) => item.isActive);
}

export function getPackageBySlug(slug: string): Package | undefined {
  return getActivePackages().find((item) => item.slug === slug || item.id === slug);
}

export function getPackageById(id: string): Package | undefined {
  return PACKAGES.find((item) => item.id === id);
}

export function getActiveAddOns(): AddOn[] {
  return ADD_ONS.filter((item) => item.isActive);
}

export function getAddOnBySlug(slug: string): AddOn | undefined {
  return getActiveAddOns().find((item) => item.slug === slug || item.id === slug);
}

export function getAddOnsForPackage(pkg: Package): AddOn[] {
  return getActiveAddOns().filter((addon) => addon.applicablePackageTypes.includes(pkg.groupId));
}

export function getFeaturesForPackage(pkg: Package): PackageFeature[] {
  const map = new Map(PACKAGE_FEATURES.map((feature) => [feature.id, feature]));
  return pkg.featureIds.map((id) => map.get(id)).filter((item): item is PackageFeature => Boolean(item));
}

export function groupsWithPackages(catalog: {
  packages: Package[];
  groups: PackageGroup[];
}): { group: PackageGroup; packages: Package[] }[] {
  return catalog.groups
    .map((group) => ({
      group,
      packages: catalog.packages.filter((item) => item.groupId === group.id),
    }))
    .filter((entry) => entry.packages.length > 0);
}

export function getGroupsWithPackages(): { group: PackageGroup; packages: Package[] }[] {
  return groupsWithPackages({ packages: getActivePackages(), groups: PACKAGE_GROUPS });
}

export function formatMoney(amount: number): string {
  const rounded = Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2).replace(/\.00$/, "");
  return `£${rounded}`;
}

export function packagePriceLabel(pkg: Package): string {
  if (pkg.billing === "quote" || (pkg.monthlyPrice == null && pkg.annualPrice == null)) {
    return "Price on application";
  }
  if (pkg.billing === "annual" && pkg.annualPrice != null) {
    return `${formatMoney(pkg.annualPrice)} ${pkg.vatNote}`.trim();
  }
  if (pkg.monthlyPrice != null) {
    return `${formatMoney(pkg.monthlyPrice)} ${pkg.vatNote}`.trim();
  }
  if (pkg.annualPrice != null) {
    return `${formatMoney(pkg.annualPrice)} ${pkg.vatNote}`.trim();
  }
  return "Price on application";
}

export function packagePricePeriod(pkg: Package): string {
  if (pkg.billing === "quote") return "";
  if (pkg.billing === "annual") return "per year";
  if (pkg.propertyBands) return "per month, from";
  return "per month";
}

export function addOnPriceLabel(addon: AddOn): string {
  return `${formatMoney(addon.price)} ${addon.vatNote} ${addon.unit}`.replace(/\s+/g, " ").trim();
}

export function choosePackageHref(pkg: Package, addonSlug?: string): string {
  const params = new URLSearchParams({ package: pkg.slug });
  if (addonSlug) params.set("addon", addonSlug);
  return `/accountancy-packages/start/?${params.toString()}`;
}
