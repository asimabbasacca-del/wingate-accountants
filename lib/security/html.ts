const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "a",
  "span",
  "div",
]);

function stripDangerous(html: string): string {
  return html
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<(iframe|object|embed|link|meta|form|input|textarea|button|svg|math)[\s\S]*?>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(iframe|object|embed|link|meta|form|input|textarea|button|svg|math)[^>]*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src|xlink:href)\s*=\s*(["'])\s*(javascript:|data:text\/html|vbscript:)[\s\S]*?\2/gi, "$1=$2#$2");
}

export function sanitizeHtml(input: string): string {
  if (!input) return "";
  const stripped = stripDangerous(input);
  return stripped.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (full, rawTag: string, attrs: string) => {
    const tag = rawTag.toLowerCase();
    const close = full.startsWith("</");
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (close) return `</${tag}>`;
    if (tag === "br") return "<br />";
    if (tag === "a") {
      const hrefMatch = /\shref\s*=\s*(["'])([^"']*)\1/i.exec(attrs);
      const href = hrefMatch?.[2] || "";
      if (!/^(https?:\/\/|\/|#|mailto:)/i.test(href)) return `<a>`;
      const safe = href.replace(/"/g, "");
      return `<a href="${safe}" rel="noopener noreferrer">`;
    }
    return `<${tag}>`;
  });
}

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

export function safeFileName(name: string): string {
  const base = name.replace(/[\r\n"]/g, "").replace(/[^\w.\- ()]/g, "_").slice(0, 120);
  return base || "download";
}

export function isSafeFileId(id: string): boolean {
  return /^[a-z0-9][a-z0-9_-]{7,79}$/i.test(id);
}

export function isValidEmail(value: string | undefined | null): value is string {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export function isStrongPassword(value: string): boolean {
  return value.length >= 10 && /[A-Za-z]/.test(value) && /\d/.test(value);
}

export function isSafeSupabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}
