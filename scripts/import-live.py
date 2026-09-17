#!/usr/bin/env python3
"""Import live Wingate pages/posts (SEO URLs + copy) into the Next app."""
from __future__ import annotations

import html as html_lib
import json
import re
import urllib.parse
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path("/tmp/wingate-live")
OUT = Path(__file__).resolve().parents[1] / "content"

ALLOWED = {
    "p", "h2", "h3", "h4", "h5", "ul", "ol", "li", "strong", "em", "b", "i",
    "a", "blockquote", "br", "hr", "table", "thead", "tbody", "tr", "th", "td",
    "span",
}

class Sanitizer(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.out: list[str] = []
        self.skip = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        if tag in {"script", "style", "svg", "form", "iframe", "noscript"}:
            self.skip += 1
            return
        if self.skip or tag not in ALLOWED:
            return
        if tag == "a":
            href = dict(attrs).get("href") or ""
            href = rewrite_href(href)
            if href:
                self.out.append(f'<a href="{html_lib.escape(href, quote=True)}">')
            else:
                self.out.append("<a>")
            return
        if tag == "br":
            self.out.append("<br/>")
            return
        if tag == "hr":
            self.out.append("<hr/>")
            return
        self.out.append(f"<{tag}>")

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in {"script", "style", "svg", "form", "iframe", "noscript"}:
            self.skip = max(0, self.skip - 1)
            return
        if self.skip or tag not in ALLOWED or tag in {"br", "hr"}:
            return
        self.out.append(f"</{tag}>")

    def handle_data(self, data: str) -> None:
        if self.skip:
            return
        self.out.append(html_lib.escape(data))


def rewrite_href(href: str) -> str:
    href = href.strip()
    if not href or href.startswith("#") or href.startswith("mailto:") or href.startswith("tel:"):
        return href
    href = href.replace("https://www.wingateaccountants.co.uk", "")
    href = href.replace("http://www.wingateaccountants.co.uk", "")
    if href.startswith("/contact") and not href.startswith("/contact-us"):
        return "/contact-us/"
    if href in {"/about", "/about/"}:
        return "/about-us/"
    if href.startswith("/") and not href.startswith("//"):
        if not href.endswith("/") and "." not in href.rsplit("/", 1)[-1]:
            href += "/"
        return href
    if href.startswith("http"):
        return href
    return href


def sanitize(raw: str) -> str:
    parser = Sanitizer()
    parser.feed(raw or "")
    parser.close()
    html = "".join(parser.out)
    html = re.sub(r"(<p>\s*</p>)+", "", html)
    html = re.sub(r"\n{3,}", "\n\n", html)
    return html.strip()


def text_to_html(text: str) -> str:
    chunks = [c.strip() for c in re.split(r"\n{2,}|(?<=\.)\s+(?=[A-Z])", text) if c.strip()]
    # Prefer splitting on sentence groups of ~400 chars
    paras: list[str] = []
    buf = ""
    for sentence in re.split(r"(?<=[.!?])\s+", text.strip()):
        if not sentence:
            continue
        if len(buf) + len(sentence) > 420 and buf:
            paras.append(buf.strip())
            buf = sentence
        else:
            buf = f"{buf} {sentence}".strip()
    if buf:
        paras.append(buf.strip())
    return "".join(f"<p>{html_lib.escape(p)}</p>" for p in paras if p)


def load_cats() -> dict[str, list[dict]]:
    raw = json.loads((ROOT / "categories.json").read_text())
    id_to = {c["id"]: {"slug": c["slug"], "name": c["name"]} for c in raw["cats"]}
    out: dict[str, list[dict]] = {}
    for p in raw["posts"]:
        slug = urllib.parse.unquote(p["slug"])
        out[slug] = [id_to[i] for i in p.get("categories") or [] if i in id_to]
    return out


def main() -> None:
    pages = json.loads((ROOT / "pages.json").read_text())
    posts = json.loads((ROOT / "posts.json").read_text())
    cats = load_cats()
    OUT.mkdir(exist_ok=True)

    page_out = []
    for p in pages:
        if p["slug"] in {"blog"}:
            continue
        html = sanitize(p["html"])
        if len(re.sub(r"<[^>]+>", "", html).strip()) < 80 and p["text"]:
            html = text_to_html(p["text"])
        page_out.append({
            "slug": p["slug"],
            "path": f"/{p['slug']}/",
            "title": p["title"],
            "seoTitle": p["seoTitle"] or p["title"],
            "description": p["description"] or p["excerpt"][:160],
            "excerpt": p["excerpt"],
            "html": html,
            "kind": "page",
        })

    post_out = []
    for p in posts:
        slug = urllib.parse.unquote(p["slug"])
        html = sanitize(p["html"])
        post_out.append({
            "slug": slug,
            "path": f"/{slug}/",
            "title": p["title"],
            "seoTitle": p["seoTitle"] or p["title"],
            "description": p["description"] or p["excerpt"][:160],
            "excerpt": p["excerpt"] or p["text"][:180],
            "date": (p.get("date") or "")[:10],
            "html": html,
            "categories": cats.get(slug, []),
            "kind": "post",
            "source": "live",
        })

    (OUT / "live-pages.json").write_text(json.dumps(page_out, ensure_ascii=False, indent=2))
    (OUT / "live-posts.json").write_text(json.dumps(post_out, ensure_ascii=False, indent=2))
    print("pages", len(page_out), "posts", len(post_out))
    print("wrote", OUT)


if __name__ == "__main__":
    main()
