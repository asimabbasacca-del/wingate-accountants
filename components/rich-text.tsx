import Link from "next/link";

const TOKEN = /(\[[^\]]+\]\([^)]+\))/g;
const LINK = /^\[([^\]]+)\]\(([^)]+)\)$/;

export function RichText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(TOKEN);
  return (
    <span className={className}>
      {parts.map((part, index) => {
        const match = part.match(LINK);
        if (!match) return <span key={index}>{part}</span>;
        const [, label, href] = match;
        if (href.startsWith("/")) {
          return (
            <Link key={index} href={href} className="font-medium text-primary underline-offset-4 hover:underline">
              {label}
            </Link>
          );
        }
        return (
          <a
            key={index}
            href={href}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {label}
          </a>
        );
      })}
    </span>
  );
}
