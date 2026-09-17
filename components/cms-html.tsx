import { sanitizeHtml } from "@/lib/security/html";

export function CmsHtml({ html }: { html: string }) {
  return <div className="cms-body" dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
}
