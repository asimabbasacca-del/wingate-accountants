import Link from "next/link";
import { SITE } from "@/lib/site";

export function CtaBanner() {
  return (
    <section className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center sm:px-6">
        <p className="font-heading max-w-2xl text-xl font-semibold sm:text-2xl">
          Need help with tax or accounting? Speak to {SITE.name} today.
        </p>
        <Link
          href="/contact/"
          className="inline-flex h-11 items-center rounded-lg bg-accent px-5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
        >
          Contact Us
        </Link>
      </div>
    </section>
  );
}
