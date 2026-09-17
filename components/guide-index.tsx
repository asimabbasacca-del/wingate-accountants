"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { GuideCard } from "@/components/guide-card";
import type { Guide, GuideCategory } from "@/lib/types";

const ALL = "All";

export function GuideIndex({
  guides,
  categories,
}: {
  guides: Guide[];
  categories: GuideCategory[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return guides.filter((guide) => {
      if (category !== ALL && guide.category !== category) return false;
      if (!needle) return true;
      return `${guide.title} ${guide.excerpt} ${guide.category}`.toLowerCase().includes(needle);
    });
  }, [guides, query, category]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {[ALL, ...categories].map((item) => {
            const active = category === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search guides"
          className="md:max-w-xs"
          aria-label="Search guides"
        />
      </div>
      {visible.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          No guides match that search. Try another word, or choose All.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
        </div>
      )}
    </div>
  );
}
