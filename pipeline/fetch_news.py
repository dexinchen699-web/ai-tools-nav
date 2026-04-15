"""
AI 中文资讯抓取 pipeline
来源: AIBase (aibase.com), 量子位 (qbitai.com), 机器之心 (jiqizhixin.com)

用法: python pipeline/fetch_news.py
依赖: pip install requests beautifulsoup4 feedparser openai python-slugify
"""

import json
import os
import re
import hashlib
import email.utils
import time
from datetime import datetime, timezone
from pathlib import Path

import feedparser
import requests
from bs4 import BeautifulSoup
from openai import OpenAI
from slugify import slugify

# ── 配置 ──────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent
OUTPUT_FILE = BASE_DIR / "src" / "data" / "news.json"

MAX_PER_SOURCE = 10   # 每个源最多抓取条数
MAX_TOTAL = 300       # 历史最多保留条数

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "zh-CN,zh;q=0.9",
}

NEWS_CATEGORIES = ["行业动态", "产品发布", "研究论文", "公司新闻", "政策法规"]

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY", ""),
    base_url=os.environ.get("OPENAI_BASE_URL", "https://aiapi.tnt-pub.com/v1"),
)
MODEL = os.environ.get("NEWS_MODEL", "gemini-2.5-pro-preview-03-25")


# ── 工具函数 ──────────────────────────────────────────────────────────────────

def make_slug(title: str, published: str) -> str:
    try:
        dt = datetime.fromisoformat(published.replace("Z", "+00:00"))
        date_part = dt.strftime("%Y-%m-%d")
    except Exception:
        date_part = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    base = slugify(title, max_length=60, separator="-", allow_unicode=False)
    if not base:
        base = hashlib.md5(title.encode()).hexdigest()[:12]
    return f"{base}-{date_part}"


def make_id(slug: str) -> str:
    return hashlib.md5(slug.encode()).hexdigest()[:8]


def normalize_date(raw: str) -> str:
    """解析各种日期格式，返回 ISO 8601 UTC"""
    if not raw:
        return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    # RFC 2822
    try:
        parsed = email.utils.parsedate_to_datetime(raw)
        return parsed.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
    except Exception:
        pass
    # ISO 8601 / 自定义格式
    for fmt in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            dt = datetime.strptime(raw.strip(), fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
        except Exception:
            pass
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def get(url: str, timeout: int = 15) -> requests.Response | None:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=timeout)
        resp.raise_for_status()
        return resp
    except Exception as e:
        print(f"    GET 失败 {url}: {e}")
        return None


# ── 各源抓取器 ────────────────────────────────────────────────────────────────

def fetch_aibase() -> list[dict]:
    """
    AIBase: https://news.aibase.com/zh/news
    页面为服务端渲染的新闻列表，每条含标题、摘要、时间、链接。
    """
    print("  抓取 AIBase...")
    entries = []
    resp = get("https://news.aibase.com/zh/news")
    if not resp:
        return entries

    soup = BeautifulSoup(resp.text, "html.parser")

    # AIBase 新闻卡片：<a> 包裹整个卡片，含 h2/h3 标题和 p 摘要
    # 尝试多种选择器以应对页面结构变化
    cards = soup.select("a[href*='/zh/news/']")
    seen_hrefs = set()

    for card in cards:
        href = card.get("href", "")
        if not href or href in seen_hrefs or href.endswith("/zh/news"):
            continue
        seen_hrefs.add(href)

        title_el = card.select_one("h2, h3, h4, .title")
        summary_el = card.select_one("p, .desc, .summary")
        time_el = card.select_one("time, .time, .date, [class*='time'], [class*='date']")

        title = title_el.get_text(strip=True) if title_el else ""
        summary = summary_el.get_text(strip=True) if summary_el else ""
        pub_raw = time_el.get("datetime") or (time_el.get_text(strip=True) if time_el else "")

        if not title:
            continue

        full_url = href if href.startswith("http") else f"https://news.aibase.com{href}"
        entries.append({
            "title": title,
            "summary": summary,
            "link": full_url,
            "published": pub_raw,
            "source": "AIBase",
        })
        if len(entries) >= MAX_PER_SOURCE:
            break

    print(f"    ✓ AIBase: {len(entries)} 条")
    return entries


def fetch_qbitai() -> list[dict]:
    """
    量子位: https://www.qbitai.com/feed (WordPress RSS)
    """
    print("  抓取 量子位...")
    entries = []
    feed = feedparser.parse("https://www.qbitai.com/feed")

    for entry in feed.entries[:MAX_PER_SOURCE]:
        # 从 HTML content 提取纯文本摘要
        summary = ""
        if hasattr(entry, "summary"):
            summary_soup = BeautifulSoup(entry.summary, "html.parser")
            summary = summary_soup.get_text(strip=True)[:300]

        entries.append({
            "title": entry.get("title", ""),
            "summary": summary,
            "link": entry.get("link", ""),
            "published": entry.get("published", ""),
            "source": "量子位",
        })

    print(f"    ✓ 量子位: {len(entries)} 条")
    return entries


def fetch_jiqizhixin() -> list[dict]:
    """
    机器之心: https://jiqizhixin.com/rss
    """
    print("  抓取 机器之心...")
    entries = []
    feed = feedparser.parse("https://jiqizhixin.com/rss")

    for entry in feed.entries[:MAX_PER_SOURCE]:
        summary = ""
        # 机器之心 RSS 正文在 content:encoded，feedparser 映射到 content[0].value
        if hasattr(entry, "content") and entry.content:
            content_soup = BeautifulSoup(entry.content[0].value, "html.parser")
            summary = content_soup.get_text(strip=True)[:300]
        elif hasattr(entry, "summary"):
            summary_soup = BeautifulSoup(entry.summary, "html.parser")
            summary = summary_soup.get_text(strip=True)[:300]

        entries.append({
            "title": entry.get("title", ""),
            "summary": summary,
            "link": entry.get("link", ""),
            "published": entry.get("published", ""),
            "source": "机器之心",
        })

    print(f"    ✓ 机器之心: {len(entries)} 条")
    return entries


# ── LLM 处理 ──────────────────────────────────────────────────────────────────

def enrich_with_llm(entry: dict) -> dict | None:
    """
    对中文新闻条目：
    1. 清理/规范标题（去除多余符号）
    2. 生成 100 字以内的中文摘要
    3. 生成 200-400 字中文正文
    4. 分类 + 打标签
    """
    prompt = f"""你是一个 AI 资讯编辑，请处理以下中文 AI 新闻条目，返回 JSON。

原始数据：
标题: {entry['title']}
摘要/正文片段: {entry['summary'][:400]}
来源: {entry['source']}

请返回如下 JSON（不要加 markdown 代码块，不要有多余文字）：
{{
  "title": "规范后的中文标题（不超过 40 字，去除多余符号）",
  "summary": "中文摘要（1-2 句话，不超过 100 字，突出核心信息）",
  "content": "中文正文（200-400 字，基于摘要扩写，专业准确，不要编造细节）",
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
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        return json.loads(raw)
    except Exception as e:
        print(f"    LLM 处理失败: {e}")
        return None


# ── 数据持久化 ────────────────────────────────────────────────────────────────

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
    print("=== AI 中文资讯抓取 pipeline ===\n")

    # 1. 抓取所有源
    print("1. 抓取新闻源...")
    raw_entries: list[dict] = []
    raw_entries.extend(fetch_aibase())
    time.sleep(1)
    raw_entries.extend(fetch_qbitai())
    time.sleep(1)
    raw_entries.extend(fetch_jiqizhixin())
    print(f"\n   共获取 {len(raw_entries)} 条原始条目\n")

    # 2. 加载已有数据，用于去重
    existing = load_existing(OUTPUT_FILE)
    existing_slugs = {item["slug"] for item in existing}
    existing_ids = {item["id"] for item in existing}
    # 也用 sourceUrl 去重，避免同一篇文章重复入库
    existing_urls = {item.get("sourceUrl", "") for item in existing}

    # 3. 过滤 + LLM 处理
    print("2. LLM 处理（分类、摘要、正文）...")
    new_items: list[dict] = []

    for entry in raw_entries:
        if not entry.get("title") or not entry.get("link"):
            continue
        if entry["link"] in existing_urls:
            print(f"   跳过（已存在）: {entry['title'][:40]}")
            continue

        slug = make_slug(entry["title"], entry.get("published", ""))
        if slug in existing_slugs:
            print(f"   跳过（slug 重复）: {entry['title'][:40]}")
            continue

        print(f"   处理: {entry['title'][:50]}...")
        result = enrich_with_llm(entry)
        if not result:
            # LLM 失败时降级：直接用原始数据
            result = {
                "title": entry["title"],
                "summary": entry["summary"][:100],
                "content": entry["summary"][:400],
                "category": "行业动态",
                "tags": [],
            }

        item_id = make_id(slug)
        while item_id in existing_ids:
            item_id = item_id[:-1] + "x"

        news_item = {
            "id": item_id,
            "slug": slug,
            "title": result.get("title") or entry["title"],
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
        existing_urls.add(entry["link"])

        time.sleep(0.5)  # 避免 LLM API 限速

    print(f"\n   新增 {len(new_items)} 条\n")

    # 4. 合并、排序、截断
    all_items = new_items + existing
    all_items.sort(key=lambda x: x.get("publishedAt", ""), reverse=True)
    all_items = all_items[:MAX_TOTAL]

    # 5. 保存
    save(OUTPUT_FILE, all_items)


if __name__ == "__main__":
    main()
