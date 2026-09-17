import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryMap, getPostsByCategory } from "@/lib/content";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ slug: string[] }> };

const NAMES: Record<string, string> = Object.fromEntries(
  getCategoryMap().map((item) => [item.slug, item.name]),
);

export function generateStaticParams() {
  const simple = getCategoryMap().map((item) => ({ slug: [item.slug] }));
  const nested = [
    { slug: ["self-assessment-tax", "self-assessment-tax-return"] },
    { slug: ["payroll-services", "tax-returns"] },
  ];
  return [...simple, ...nested];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const last = slug[slug.length - 1];
  const name = NAMES[last] ?? last;
  return {
    title: { absolute: `${name} Archives - Wingate Accountants` },
    description: `Articles in ${name} from Wingate Accountants.`,
    alternates: { canonical: `${SITE.url}/category/${slug.join("/")}/` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const last = slug[slug.length - 1];
  const posts = getPostsByCategory(last).filter((post) => post.source !== "extra");
  if (!posts.length && !NAMES[last]) notFound();
  const name = NAMES[last] ?? last;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-sm text-muted-foreground">Category</p>
      <h1 className="font-heading mt-2 text-4xl font-bold">{name}</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={post.path} className="rounded-xl border border-border bg-card p-6 hover:shadow-md">
            <p className="text-xs text-muted-foreground">{post.date}</p>
            <h2 className="font-heading mt-2 font-semibold leading-snug">{post.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
