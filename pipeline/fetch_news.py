"""
AI 资讯抓取 pipeline
用法: py pipeline/fetch_news.py
依赖: pip install feedparser requests openai python-slugify
"""

import json
import os
import re
import hashlib
from datetime import datetime, timezone
from pathlib import Path

import feedparser
import requests
from openai import OpenAI
from slugify import slugify

# ── 配置 ──────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent
OUTPUT_FILE = BASE_DIR / "src" / "data" / "news.json"

RSS_FEEDS = [
    {"url": "https://magazine.sebastianraschka.com/feed", "source": "Sebastian Raschka"},
    {"url": "https://aiacceleratorinstitute.com/rss/",    "source": "AI Accelerator Institute"},
    # 可继续添加更多 RSS 源
    {"url": "https://feeds.feedburner.com/venturebeat/SZYF", "source": "VentureBeat AI"},
    {"url": "https://techcrunch.com/category/artificial-intelligence/feed/", "source": "TechCrunch AI"},
]

NEWS_CATEGORIES = ["行业动态", "产品发布", "研究论文", "公司新闻", "政策法规"]

# LLM 客户端（与现有 pipeline 保持一致，走代理）
client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY", ""),
    base_url=os.environ.get("OPENAI_BASE_URL", "https://aiapi.tnt-pub.com/v1"),
)
MODEL = os.environ.get("NEWS_MODEL", "gemini-2.5-pro-preview-03-25")

# ── 工具函数 ──────────────────────────────────────────────────────────────────

def fetch_feed(feed_info: dict) -> list[dict]:
    """解析单个 RSS feed，返回原始条目列表"""
    try:
        parsed = feedparser.parse(feed_info["url"])
        entries = []
        for entry in parsed.entries[:10]:  # 每个源最多取 10 条
            entries.append({
                "title": entry.get("title", ""),
                "link": entry.get("link", ""),
                "summary": entry.get("summary", ""),
                "published": entry.get("published", ""),
                "source": feed_info["source"],
            })
        print(f"  ✓ {feed_info['source']}: {len(entries)} 条")
        return entries
    except Exception as e:
        print(f"  ✗ {feed_info['source']}: {e}")
        return []


def make_slug(title: str, published: str) -> str:
    """生成 URL-safe slug"""
    date_part = ""
    try:
        dt = datetime.fromisoformat(published.replace("Z", "+00:00"))
        date_part = dt.strftime("%Y-%m-%d")
    except Exception:
        date_part = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    base = slugify(title, max_length=60, separator="-")
    return f"{base}-{date_part}"


def make_id(slug: str) -> str:
    return hashlib.md5(slug.encode()).hexdigest()[:8]


def normalize_date(raw: str) -> str:
    """尽力解析各种日期格式，返回 ISO 8601"""
    import email.utils
    try:
        # RFC 2822 (RSS 常见格式)
        parsed = email.utils.parsedate_to_datetime(raw)
        return parsed.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
    except Exception:
        pass
    try:
        return datetime.fromisoformat(raw).isoformat()
    except Exception:
        return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def translate_and_classify(entry: dict) -> dict | None:
    """
    调用 LLM：
    1. 将标题和摘要翻译成中文
    2. 分类到 NEWS_CATEGORIES 之一
    3. 生成 tags
    4. 生成 200 字左右的中文 summary
    """
    prompt = f"""你是一个 AI 资讯编辑，请处理以下英文 AI 新闻条目，返回 JSON。

原始数据：
标题: {entry['title']}
摘要: {entry['summary'][:500]}
来源: {entry['source']}

请返回如下 JSON（不要加 markdown 代码块）：
{{
  "title": "中文标题（准确翻译，不超过 40 字）",
  "summary": "中文摘要（1-2 句话，不超过 100 字，突出核心信息）",
  "content": "中文正文（200-400 字，基于摘要扩写，专业准确）",
  "category": "从以下选一个: {', '.join(NEWS_CATEGORIES)}",
  "tags": ["标签1", "标签2", "标签3"]
}}"""

    try:
        resp = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=800,
        )
        raw = resp.choices[0].message.content.strip()
        # 去掉可能的 markdown 代码块
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        return json.loads(raw)
    except Exception as e:
        print(f"    LLM 处理失败: {e}")
        return None


def load_existing(path: Path) -> list[dict]:
    if path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return []


def save(path: Path, items: list[dict]):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    print(f"\n✅ 已保存 {len(items)} 条资讯到 {path}")


# ── 主流程 ────────────────────────────────────────────────────────────────────

def main():
    print("=== AI 资讯抓取 pipeline ===\n")

    # 1. 抓取所有 RSS
    print("1. 抓取 RSS feeds...")
    raw_entries: list[dict] = []
    for feed in RSS_FEEDS:
        raw_entries.extend(fetch_feed(feed))
    print(f"   共获取 {len(raw_entries)} 条原始条目\n")

    # 2. 加载已有数据，用于去重
    existing = load_existing(OUTPUT_FILE)
    existing_slugs = {item["slug"] for item in existing}
    existing_ids = {item["id"] for item in existing}

    # 3. 处理新条目
    print("2. 翻译 & 分类（调用 LLM）...")
    new_items: list[dict] = []
    for entry in raw_entries:
        slug = make_slug(entry["title"], entry.get("published", ""))
        if slug in existing_slugs:
            print(f"   跳过（已存在）: {entry['title'][:40]}")
            continue

        print(f"   处理: {entry['title'][:50]}...")
        result = translate_and_classify(entry)
        if not result:
            continue

        item_id = make_id(slug)
        # 确保 id 唯一
        while item_id in existing_ids:
            item_id = item_id + "x"

        news_item = {
            "id": item_id,
            "slug": slug,
            "title": result.get("title", entry["title"]),
            "summary": result.get("summary", ""),
            "content": result.get("content", ""),
            "source": entry["source"],
            "sourceUrl": entry["link"],
            "publishedAt": normalize_date(entry.get("published", "")),
            "category": result.get("category", "行业动态"),
            "tags": result.get("tags", []),
            "imageUrl": "",
        }
        new_items.append(news_item)
        existing_ids.add(item_id)
        existing_slugs.add(slug)

    print(f"\n   新增 {len(new_items)} 条\n")

    # 4. 合并并按时间倒序排列
    all_items = new_items + existing
    all_items.sort(key=lambda x: x.get("publishedAt", ""), reverse=True)
    # 最多保留 200 条
    all_items = all_items[:200]

    # 5. 保存
    save(OUTPUT_FILE, all_items)


if __name__ == "__main__":
    main()
