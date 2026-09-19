import Link from "next/link";
import type { RelatedService } from "@/lib/service-pages";

export function RelatedServices({ items }: { items: RelatedService[] }) {
  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="font-heading text-2xl font-semibold">Related services</h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex h-full flex-col rounded-xl border border-border bg-card p-5 hover:shadow-md"
            >
              <span className="font-heading font-semibold">{item.title}</span>
              <span className="mt-2 text-sm text-primary">Find out more</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
