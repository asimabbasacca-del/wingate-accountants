import type { Metadata } from "next";
import Link from "next/link";
import { getLivePosts, getPosts } from "@/lib/content";
import { practiceStore } from "@/lib/practice/store";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Blog - Wingate Accountants" },
  description:
    "Tax and accountancy articles from Wingate Accountants, including posts from the live website and original UK tax guides.",
  alternates: { canonical: `${SITE.url}/blog/` },
};

export default async function BlogPage() {
  const live = getLivePosts();
  const extra = getPosts().filter((post) => post.source === "extra");
  const cms = await practiceStore.publishedPosts().catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-4xl font-bold">Blog</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Posts from the current Wingate website stay on their original URLs. Additional original
        guides on UK tax topics published from 2025 onward sit in Extra guides, with Wingate titles,
        meta descriptions and canonical tags.
      </p>

      {cms.length ? (
        <>
          <h2 className="font-heading mt-12 text-2xl font-semibold">From the practice CMS</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cms.map((post) => (
              <Link key={post.id} href={`/${post.slug}/`} className="rounded-xl border border-border bg-card p-6 hover:shadow-md">
                <p className="text-xs text-muted-foreground">{post.updatedAt.slice(0, 10)}</p>
                <h3 className="font-heading mt-2 font-semibold leading-snug">{post.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.description}</p>
              </Link>
            ))}
          </div>
        </>
      ) : null}

      <h2 className="font-heading mt-12 text-2xl font-semibold">From the current website</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {live.map((post) => (
          <Link key={post.slug} href={post.path} className="rounded-xl border border-border bg-card p-6 hover:shadow-md">
            <p className="text-xs text-muted-foreground">{post.date}</p>
            <h3 className="font-heading mt-2 font-semibold leading-snug">{post.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
          </Link>
        ))}
      </div>

      <h2 className="font-heading mt-16 text-2xl font-semibold">Extra guides</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Original Wingate articles on topics taken from another accountancy briefing site. They are
        not copied from that site.
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {extra.map((post) => (
          <Link key={post.slug} href={post.path} className="rounded-xl border border-border bg-card p-6 hover:shadow-md">
            <p className="text-xs text-muted-foreground">{post.date} · extra</p>
            <h3 className="font-heading mt-2 font-semibold leading-snug">{post.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
