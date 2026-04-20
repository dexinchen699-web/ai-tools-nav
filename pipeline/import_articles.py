#!/usr/bin/env python3
"""
SEO 文章批量导入脚本
将 41 个 HTML 文章文件解析并插入到 Supabase articles 表

依赖: pip install beautifulsoup4 supabase python-dotenv
"""

import os
import re
import json
import sys
from pathlib import Path
from dotenv import dotenv_values
from bs4 import BeautifulSoup
from supabase import create_client, Client

# ── 配置 ──────────────────────────────────────────────────────────────────────

HTML_DIR = Path(r"C:\Users\pct\Downloads\seo-farm-for-colleague\extracted\articles")
ENV_FILE = Path(__file__).parent.parent / ".env.local"

FILENAMES = [
    "01_dify.html", "02_coze.html", "03_n8n.html", "04_mcp.html",
    "05_agent-architecture.html", "06_agent-2026-protocols.html",
    "07_agent-platforms-guide.html", "08_mas-deep-dive.html",
    "09_gemini-31-guide.html", "10_agent-architecture-deep-dive.html",
    "11_coze-tutorial.html", "12_single-agent-vs-mas.html",
    "13_dify-tutorial.html", "14_agent-security-prompt-injection.html",
    "15_google-turboquant-kv-cache-compression-explained.html",
    "16_rag-explained.html", "17_ai-agent-workplace-revolution.html",
    "18_deerflow2-popular-science.html", "19_ollama-local-llm-tutorial.html",
    "20_langgraph-tutorial.html", "21_ai-token-explained.html",
    "22_n8n-enterprise-workflow.html", "23_kling-ai-video-tutorial.html",
    "24_deerflow2-architecture-deep-dive.html", "25_gemma4-open-source-explained.html",
    "26_claude-mythos-leak-explained.html", "27_nemoclaw-tutorial.html",
    "28_transformers-js-v4-explained.html", "29_gpt54-tutorial.html",
    "30_llama4-tutorial.html", "31_openai-codex-2026-deep-dive.html",
    "32_rogue-ai-agent-security.html", "33_ai-agent-real-jobs-replaced.html",
    "34_ai-agent-cost-breakdown.html", "35_qwen3-popular-science.html",
    "36_gemini-cli-tutorial.html", "37_deepseek-v4-huawei-explained.html",
    "38_ai-peer-preservation-explained.html", "39_mcp-protocol-why-it-won.html",
    "40_kimi-tutorial.html", "41_glm-51-tutorial.html",
]

# ── 环境变量加载 ───────────────────────────────────────────────────────────────

def load_env() -> tuple[str, str]:
    """从环境变量或 .env.local 文件读取 Supabase 配置"""
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        if ENV_FILE.exists():
            env = dotenv_values(ENV_FILE)
            url = url or env.get("NEXT_PUBLIC_SUPABASE_URL")
            key = key or env.get("SUPABASE_SERVICE_ROLE_KEY")
        else:
            print(f"警告: 未找到 {ENV_FILE}，仅依赖环境变量", file=sys.stderr)

    if not url:
        raise ValueError("缺少 NEXT_PUBLIC_SUPABASE_URL")
    if not key:
        raise ValueError("缺少 SUPABASE_SERVICE_ROLE_KEY")

    return url, key

# ── Slug 生成 ─────────────────────────────────────────────────────────────────

def filename_to_slug(filename: str) -> str:
    """01_dify.html → dify, 13_dify-tutorial.html → dify-tutorial"""
    name = Path(filename).stem          # 去掉 .html
    name = re.sub(r"^\d+_", "", name)  # 去掉数字前缀
    return name

# ── Category 推断 ─────────────────────────────────────────────────────────────

def infer_category(badges: list[str]) -> str:
    text = " ".join(badges)
    if re.search(r"教程|Tutorial", text, re.IGNORECASE):
        return "AI工具教程"
    if "科普" in text:
        return "AI科普"
    if re.search(r"技术解析|深度解析|架构", text):
        return "AI技术解析"
    if re.search(r"行业|洞察|职场", text):
        return "AI行业洞察"
    return "AI技术解析"

# ── Tags 提取 ─────────────────────────────────────────────────────────────────

def extract_tags(badges: list[str]) -> list[str]:
    """从最后一个 badge 用 · 分割提取 tags，最多 5 个"""
    if not badges:
        return []
    last = badges[-1]
    tags = [t.strip() for t in last.split("·") if t.strip()]
    return tags[:5]

# ── HTML 解析 ─────────────────────────────────────────────────────────────────

def fix_image_paths(html: str) -> str:
    """将 src="images/xxx" 替换为 src="/images/articles/xxx"""
    return re.sub(
        r'src="images/',
        'src="/images/articles/',
        html
    )

def parse_html_file(filepath: Path) -> dict:
    """解析单个 HTML 文件，返回 article 字段字典"""
    with open(filepath, encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")

    # title
    title_tag = soup.find("title")
    title = title_tag.get_text(strip=True) if title_tag else ""

    # meta description
    meta_desc = soup.find("meta", attrs={"name": "description"})
    meta_description = meta_desc["content"].strip() if meta_desc and meta_desc.get("content") else ""

    # og:image → cover_image_url
    og_image = soup.find("meta", property="og:image")
    cover_image_url = og_image["content"].strip() if og_image and og_image.get("content") else ""

    # datePublished from JSON-LD
    date_published = None
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "")
            if isinstance(data, dict) and data.get("datePublished"):
                date_published = data["datePublished"]
                break
            # 有时是列表
            if isinstance(data, list):
                for item in data:
                    if isinstance(item, dict) and item.get("datePublished"):
                        date_published = item["datePublished"]
                        break
        except (json.JSONDecodeError, TypeError):
            continue

    # summary from <p class="article-lead">
    lead = soup.find("p", class_="article-lead")
    summary = lead.get_text(strip=True) if lead else ""

    # badge-row badges
    badge_row = soup.find(class_="badge-row")
    badges = []
    if badge_row:
        badges = [b.get_text(strip=True) for b in badge_row.find_all(class_="badge") if b.get_text(strip=True)]

    category = infer_category(badges)
    tags = extract_tags(badges)

    # content_html from <div class="article-body"> or <main class="article-body">
    body = soup.find("div", class_="article-body") or soup.find("main", class_="article-body")
    if body:
        content_html = fix_image_paths(body.decode_contents())
    else:
        content_html = ""

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

# ── 主流程 ────────────────────────────────────────────────────────────────────

def main():
    # 加载 Supabase 客户端
    try:
        supabase_url, supabase_key = load_env()
    except ValueError as e:
        print(f"❌ 配置错误: {e}", file=sys.stderr)
        sys.exit(1)

    supabase: Client = create_client(supabase_url, supabase_key)

    total = len(FILENAMES)
    success = 0
    failed = 0

    for idx, filename in enumerate(FILENAMES, start=1):
        slug = filename_to_slug(filename)
        filepath = HTML_DIR / filename

        try:
            if not filepath.exists():
                raise FileNotFoundError(f"文件不存在: {filepath}")

            fields = parse_html_file(filepath)

            record = {
                "slug": slug,
                **fields,
            }

            # upsert，冲突时按 slug 更新
            supabase.table("articles").upsert(record, on_conflict="slug").execute()

            print(f"[{idx}/{total}] ✓ {slug}")
            success += 1

        except Exception as e:
            print(f"[{idx}/{total}] ✗ {slug}: {e}")
            failed += 1

    print(f"\n完成: {success}/{total} 成功, {failed} 失败")

if __name__ == "__main__":
    main()
