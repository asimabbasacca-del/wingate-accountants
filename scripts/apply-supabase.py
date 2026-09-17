#!/usr/bin/env python3
"""Apply wingate/supabase/APPLY_IN_SUPABASE.sql to DATABASE_URL_UNPOOLED (or DATABASE_URL)."""
from __future__ import annotations

import os
import pathlib
import re
import sys
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import psycopg

ROOT = pathlib.Path(__file__).resolve().parents[1]


def load_env() -> dict[str, str]:
    data: dict[str, str] = {}
    for path in (ROOT / ".env.local", ROOT.parent / ".env.local"):
        if not path.exists():
            continue
        for line in path.read_text().splitlines():
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            data.setdefault(key, value)
    return data


def split_sql(sql: str) -> list[str]:
    stmts: list[str] = []
    buf: list[str] = []
    i = 0
    n = len(sql)
    in_single = False
    dollar: str | None = None
    while i < n:
        ch = sql[i]
        if dollar:
            end = sql.find(dollar, i)
            if end == -1:
                buf.append(sql[i:])
                break
            buf.append(sql[i : end + len(dollar)])
            i = end + len(dollar)
            dollar = None
            continue
        if in_single:
            buf.append(ch)
            if ch == "'":
                if i + 1 < n and sql[i + 1] == "'":
                    buf.append("'")
                    i += 2
                    continue
                in_single = False
            i += 1
            continue
        if ch == "-" and i + 1 < n and sql[i + 1] == "-":
            nl = sql.find("\n", i)
            if nl == -1:
                break
            i = nl + 1
            buf.append("\n")
            continue
        if ch == "/" and i + 1 < n and sql[i + 1] == "*":
            end = sql.find("*/", i + 2)
            i = n if end == -1 else end + 2
            continue
        if ch == "'":
            in_single = True
            buf.append(ch)
            i += 1
            continue
        if ch == "$":
            match = re.match(r"\$[A-Za-z0-9_]*\$", sql[i:])
            if match:
                dollar = match.group(0)
                buf.append(dollar)
                i += len(dollar)
                continue
        if ch == ";":
            stmt = "".join(buf).strip()
            if stmt:
                stmts.append(stmt)
            buf = []
            i += 1
            continue
        buf.append(ch)
        i += 1
    tail = "".join(buf).strip()
    if tail:
        stmts.append(tail)
    return stmts


def connect(url: str):
    parts = urlsplit(url)
    query = dict(parse_qsl(parts.query, keep_blank_values=True))
    query.pop("channel_binding", None)
    cleaned = urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))
    try:
        return psycopg.connect(url, connect_timeout=20)
    except Exception:
        return psycopg.connect(cleaned, connect_timeout=20)


def main() -> int:
    env = load_env()
    url = os.environ.get("DATABASE_URL_UNPOOLED") or env.get("DATABASE_URL_UNPOOLED") or os.environ.get("DATABASE_URL") or env.get("DATABASE_URL")
    if not url:
        print("Set DATABASE_URL_UNPOOLED (Supabase direct URI) in wingate/.env.local", file=sys.stderr)
        return 1
    sql_path = ROOT / "supabase" / "APPLY_IN_SUPABASE.sql"
    stmts = split_sql(sql_path.read_text())
    conn = connect(url)
    try:
        with conn.cursor() as cur:
            for stmt in stmts:
                cur.execute(stmt)
        conn.commit()
        with conn.cursor() as cur:
            cur.execute("select count(*) from wingate_packages")
            packages = cur.fetchone()[0]
            cur.execute("select count(*) from wingate_addons")
            addons = cur.fetchone()[0]
        print(f"Applied {sql_path.name}: {packages} packages, {addons} add-ons")
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
