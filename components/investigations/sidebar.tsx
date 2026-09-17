import Link from "next/link";
import { INVESTIGATION_GROUPS } from "@/lib/investigations/data";
import { investigationPath, topicsForGroup } from "@/lib/investigations/catalog";
import { cn } from "@/lib/utils";

export function InvestigationSidebar({ current }: { current?: string }) {
  return (
    <nav aria-label="Tax investigations" className="lg:sticky lg:top-6">
      <p className="text-xs font-semibold tracking-wide text-accent uppercase">On this service</p>
      <Link
        href={investigationPath()}
        className={cn(
          "mt-3 block rounded-lg px-3 py-2 text-sm",
          !current ? "bg-primary text-primary-foreground" : "hover:bg-muted",
        )}
      >
        Tax Investigations and compliance
      </Link>
      <div className="mt-4 space-y-5">
        {INVESTIGATION_GROUPS.map((group) => (
          <div key={group.id}>
            <p className="px-3 text-xs font-semibold text-muted-foreground">{group.name}</p>
            <ul className="mt-1">
              {topicsForGroup(group.id).map((topic) => (
                <li key={topic.slug}>
                  <Link
                    href={investigationPath(topic.slug)}
                    className={cn(
                      "block rounded-lg px-3 py-1.5 text-sm leading-snug",
                      current === topic.slug ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    )}
                  >
                    {topic.navTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
