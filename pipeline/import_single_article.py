#!/usr/bin/env python3
"""
单篇文章导入 Supabase（复用 import_articles.py 的解析逻辑）
用法: python pipeline/import_single_article.py <html文件绝对路径>
"""

import os
import re
import json
import sys
from pathlib import Path
from dotenv import dotenv_values
from bs4 import BeautifulSoup
from supabase import create_client, Client

ENV_FILE = Path(__file__).parent.parent / ".env.local"

def load_env():
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        if ENV_FILE.exists():
            for enc in ("utf-8-sig", "gbk", "cp1252", "latin-1"):
                try:
                    lines = ENV_FILE.read_text(encoding=enc).splitlines()
                    env = {}
                    for line in lines:
                        line = line.strip()
                        if "=" in line and not line.startswith("#"):
                            k, _, v = line.partition("=")
                            env[k.strip()] = v.strip().strip('"').strip("'")
                    url = url or env.get("NEXT_PUBLIC_SUPABASE_URL")
                    key = key or env.get("SUPABASE_SERVICE_ROLE_KEY")
                    break
                except Exception:
                    continue
    if not url: raise ValueError("缺少 NEXT_PUBLIC_SUPABASE_URL")
    if not key: raise ValueError("缺少 SUPABASE_SERVICE_ROLE_KEY")
    return url, key

def filename_to_slug(filename: str) -> str:
    name = Path(filename).stem
    name = re.sub(r"^\d+_", "", name)
    return name

def infer_category(badges: list) -> str:
    text = " ".join(badges)
    if re.search(r"教程|Tutorial", text, re.IGNORECASE): return "AI工具教程"
    if "科普" in text: return "AI科普"
    if re.search(r"技术解析|深度解析|架构", text): return "AI技术解析"
    if re.search(r"行业|洞察|职场", text): return "AI行业洞察"
    return "AI技术解析"

def fix_image_paths(html: str) -> str:
    return re.sub(r'src="images/', 'src="/images/articles/', html)

def parse_html_file(filepath: Path) -> dict:
    with open(filepath, encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")

    title_tag = soup.find("title")
    title = title_tag.get_text(strip=True) if title_tag else ""

    meta_desc = soup.find("meta", attrs={"name": "description"})
    meta_description = meta_desc["content"].strip() if meta_desc and meta_desc.get("content") else ""

    og_image = soup.find("meta", property="og:image")
    cover_image_url = og_image["content"].strip() if og_image and og_image.get("content") else ""

    date_published = None
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "")
            if isinstance(data, dict) and data.get("datePublished"):
                date_published = data["datePublished"]
                break
        except (json.JSONDecodeError, TypeError):
            continue

    lead = soup.find("p", class_="article-lead")
    summary = lead.get_text(strip=True) if lead else ""

    badge_row = soup.find(class_="badge-row")
    badges = []
    if badge_row:
        badges = [b.get_text(strip=True) for b in badge_row.find_all(class_="badge") if b.get_text(strip=True)]

    category = infer_category(badges)
    tags = [t.strip() for t in (badges[-1].split("·") if badges else [])][:5]

    body = soup.find("div", class_="article-body") or soup.find("main", class_="article-body")
    content_html = fix_image_paths(body.decode_contents()) if body else ""

    return {
        "title": title,
        "meta_description": meta_description,
        "cover_image_url": cover_image_url,
        "date_published": date_published,
        "summary": summary,
        "category": category,
        "tags": tags,
        "content_html": content_html,
    }

def main():
    if len(sys.argv) < 2:
        print("用法: python pipeline/import_single_article.py <html文件绝对路径>")
        sys.exit(1)

    filepath = Path(sys.argv[1])
    if not filepath.exists():
        print(f"❌ 文件不存在: {filepath}")
        sys.exit(1)

    slug = filename_to_slug(filepath.name)
    print(f"slug: {slug}")

    supabase_url, supabase_key = load_env()
    supabase: Client = create_client(supabase_url, supabase_key)

    fields = parse_html_file(filepath)
    print(f"title: {fields['title'][:60]}")
    print(f"category: {fields['category']}")
    print(f"date: {fields['date_published']}")

    record = {"slug": slug, "is_published": True, **fields}
    supabase.table("articles").upsert(record, on_conflict="slug").execute()
    print(f"[OK] imported: {slug}")

if __name__ == "__main__":
    main()
