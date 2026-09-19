import { SITE } from "@/lib/site";
import { LOCATION_SEO } from "@/lib/service-pages";

export function LocationSeo() {
  return (
    <p className="mx-auto max-w-6xl px-4 pb-4 text-sm text-muted-foreground sm:px-6">
      {LOCATION_SEO} {SITE.address}. {SITE.phone}.
    </p>
  );
}
