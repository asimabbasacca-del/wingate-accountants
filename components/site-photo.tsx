import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const SITE_PHOTOS = [
  { src: "/images/accountant-client-meeting.png", alt: "Wingate accountant meeting a client" },
  { src: "/images/digital-tax-desk.png", alt: "Digital tax records on an accountant’s desk" },
  { src: "/images/practice-office.png", alt: "Meeting room in a UK accountancy practice" },
  { src: "/images/company-formation.png", alt: "Reviewing company formation documents" },
  { src: "/images/tax-investigation-meeting.png", alt: "Accountant and client reviewing HMRC correspondence" },
  { src: "/images/accounts-ledger-desk.png", alt: "Ledger, invoices and calculator on an accountant’s desk" },
] as const;

export function photoForSlug(slug: string) {
  const sum = [...slug].reduce((n, char) => n + char.charCodeAt(0), 0);
  return SITE_PHOTOS[sum % SITE_PHOTOS.length];
}

export function SitePhoto({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-muted shadow-lg", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        sizes="(min-width: 1024px) 40vw, 100vw"
        className="object-cover"
      />
    </div>
  );
}

export function HeroWithPhoto({
  kicker,
  title,
  imageSrc,
  imageAlt,
  children,
  actions,
}: {
  kicker: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:py-24">
        <div>
          <p className="text-sm font-medium tracking-wide text-accent uppercase">{kicker}</p>
          <h1 className="font-heading mt-3 max-w-4xl text-4xl leading-tight font-bold sm:text-5xl">{title}</h1>
          <div className="mt-5 max-w-2xl text-lg text-primary-foreground/85">{children}</div>
          {actions ? <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
        </div>
        <SitePhoto src={imageSrc} alt={imageAlt} priority className="aspect-[4/3] min-h-[14rem] lg:min-h-[20rem]" />
      </div>
    </section>
  );
}

export function CardPhoto({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const photo = photoForSlug(slug);
  return <SitePhoto src={photo.src} alt={photo.alt} className={cn("aspect-[16/10]", className)} />;
}
