import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Guide } from "@/lib/types";

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <Badge variant="secondary" className="w-fit">
          {guide.category}
        </Badge>
        <CardTitle className="font-heading text-lg leading-snug">
          <Link href={`/blog/${guide.slug}`} className="hover:underline">
            {guide.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{guide.excerpt}</CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {guide.dateLabel} · {guide.read}
      </CardFooter>
    </Card>
  );
}
