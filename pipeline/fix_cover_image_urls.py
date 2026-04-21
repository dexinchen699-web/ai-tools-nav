#!/usr/bin/env python3
"""
批量更新 Supabase articles 表中的 cover_image_url
将旧 seo-farm 域名替换为新站域名
"""

import json
import sys
import urllib.request
from pathlib import Path

OLD_PREFIX = "https://cc-newplayer.github.io/seo-farm/articles/images/"
NEW_PREFIX = "https://ai-tools-nav-two.vercel.app/images/articles/"

ENV_FILE = Path(__file__).parent.parent / ".env.local"

def load_env(filepath):
    result = {}
    try:
        text = filepath.read_text(encoding="utf-8", errors="ignore")
    except FileNotFoundError:
        return result
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        result[k.strip()] = v.strip().strip('"')
    return result

def rest(method, path, body=None):
    env = load_env(ENV_FILE)
    url = env.get("NEXT_PUBLIC_SUPABASE_URL", "").rstrip("/") + "/rest/v1/" + path
    key = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read()), r.status
    except urllib.error.HTTPError as e:
        return json.loads(e.read()), e.code

def main():
    rows, status = rest("GET", "articles?select=slug,cover_image_url&limit=200")
    if not isinstance(rows, list):
        print(f"FAIL query: {rows}")
        sys.exit(1)

    updated = 0
    skipped = 0
    for row in rows:
        slug = row.get("slug", "")
        url = row.get("cover_image_url") or ""
        if not url.startswith(OLD_PREFIX):
            skipped += 1
            continue
        new_url = NEW_PREFIX + url[len(OLD_PREFIX):]
        result, patch_status = rest("PATCH", f"articles?slug=eq.{slug}", {"cover_image_url": new_url})
        if patch_status in (200, 204):
            print(f"OK {slug}")
            updated += 1
        else:
            print(f"FAIL {slug} HTTP {patch_status}: {result}")

    print(f"\nDone: {updated} updated, {skipped} skipped (no old-domain URL)")

if __name__ == "__main__":
    main()
