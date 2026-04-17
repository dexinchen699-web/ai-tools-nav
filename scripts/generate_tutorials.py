"""
Generate tutorial content (summary, content_md, steps) for rows in the `tutorials` table
and write them back via Supabase service role.

Usage:
    py scripts/generate_tutorials.py                    # all unpopulated rows
    py scripts/generate_tutorials.py --slug chatgpt-beginner-guide
    py scripts/generate_tutorials.py --limit 5
    py scripts/generate_tutorials.py --overwrite        # re-generate existing

Requires env vars (or .env.local):
    NEXT_PUBLIC_SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY
    OPENAI_API_KEY
"""

import os
import sys
import json
import re
import time
import argparse
from pathlib import Path

# ── Load .env.local ───────────────────────────────────────────────────────────
env_path = Path(__file__).parent.parent / ".env.local"
if env_path.exists():
    for line in env_path.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, _, v = line.partition("=")
            os.environ.setdefault(k.strip(), v.strip())

# ── Deps ──────────────────────────────────────────────────────────────────────
try:
    from openai import OpenAI
    from supabase import create_client
except ImportError:
    print("Missing deps. Run:  py -m pip install openai supabase")
    sys.exit(1)

# ── Config ────────────────────────────────────────────────────────────────────
SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
OPENAI_KEY   = os.environ["OPENAI_API_KEY"]
PROXY_BASE   = os.environ.get("OPENAI_BASE_URL", "https://aiapi.tnt-pub.com/v1")
MODEL        = os.environ.get("TUTORIAL_MODEL", "claude-sonnet-4-6")

sb     = create_client(SUPABASE_URL, SUPABASE_KEY)
client = OpenAI(api_key=OPENAI_KEY, base_url=PROXY_BASE)

# ── Prompts ───────────────────────────────────────────────────────────────────
def _row_context(row: dict) -> str:
    """Build a short context string describing the tutorial."""
    parts = [
        f"教程标题：{row['title']}",
        f"分类：{row['category']}",
        f"难度：{row['difficulty']}",
        f"预计时长：{row.get('duration_minutes', 10)} 分钟",
    ]
    if row.get("tool_slug"):
        parts.append(f"关联工具：{row['tool_slug']}")
    if row.get("tags"):
        tags = row["tags"] if isinstance(row["tags"], list) else []
        if tags:
            parts.append(f"标签：{', '.join(tags)}")
    return "\n".join(parts)


def _call(messages: list, max_tokens: int = 1200) -> str:
    """Single LLM call, returns stripped text content."""
    resp = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=0.7,
        max_tokens=max_tokens,
    )
    return resp.choices[0].message.content.strip()


def _gen_summary(ctx: str) -> str:
    raw = _call([
        {"role": "system", "content": "你是专业的 AI 工具教程作者，面向中文用户。"},
        {"role": "user",   "content": (
            f"{ctx}\n\n"
            "请为这篇教程写一句话摘要，要求：简洁有力，突出核心价值，50字以内，纯文本，不要任何标点以外的格式。"
        )},
    ], max_tokens=200)
    return raw.strip()


def _gen_content_md(ctx: str) -> str:
    raw = _call([
        {"role": "system", "content": (
            "你是专业的 AI 工具教程作者，面向中文用户。"
            "输出纯 Markdown 正文，不要 JSON，不要代码围栏，不要任何额外说明。"
        )},
        {"role": "user",   "content": (
            f"{ctx}\n\n"
            "请撰写这篇教程的完整正文，要求：\n"
            "- 使用 Markdown 格式（## 二级标题，**加粗**，`代码`，> 引用）\n"
            "- 包含：背景介绍、核心概念、实操技巧、注意事项\n"
            "- 语气专业但亲切，适合中文读者\n"
            "- 600-900字\n"
            "- 直接输出 Markdown，不要任何前缀或后缀"
        )},
    ], max_tokens=2000)
    # Strip accidental code fences
    if raw.startswith("```"):
        raw = raw.split("```", 2)[1]
        if raw.startswith(("markdown", "md")):
            raw = raw.split("\n", 1)[1] if "\n" in raw else raw[8:]
        raw = raw.rsplit("```", 1)[0]
    return raw.strip()


def _gen_steps(ctx: str) -> list:
    raw = _call([
        {"role": "system", "content": (
            "你是专业的 AI 工具教程作者，面向中文用户。"
            "输出必须是合法 JSON 数组，不要任何其他内容。"
        )},
        {"role": "user",   "content": (
            f"{ctx}\n\n"
            "请为这篇教程生成 3-5 个操作步骤，输出格式：\n"
            '[{"title":"步骤标题","description":"步骤说明，80-150字"},...]\n'
            "只输出 JSON 数组，不要任何其他文字。"
        )},
    ], max_tokens=1000)
    # Strip code fences
    if raw.startswith("```"):
        raw = raw.split("```", 2)[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.rsplit("```", 1)[0]
    raw = raw.strip()
    print(f"\n  [DEBUG steps raw[:500]] {repr(raw[:500])}")

    # Fix smart/curly quotes that break JSON parsing
    # Replace " " with escaped quote inside JSON strings
    raw = raw.replace('\u201c', '\u2018').replace('\u201d', '\u2019')  # first neutralize
    # Actually: replace with ASCII equivalents safe for JSON
    raw = raw.replace('\u201c', '"').replace('\u201d', '"')  # " " → straight "
    raw = raw.replace('\u2018', "'").replace('\u2019', "'")  # ' ' → straight '

    # Re-escape any unescaped straight quotes that are now inside JSON string values
    # Strategy: parse char by char to fix unescaped quotes inside strings
    fixed = _fix_json_quotes(raw)

    steps = json.loads(fixed)
    if not isinstance(steps, list):
        raise ValueError("steps is not a list")
    return steps


def _fix_json_quotes(s: str) -> str:
    """
    Walk through a JSON string and escape any bare double-quotes
    that appear inside string values (i.e. not structural quotes).
    """
    result = []
    in_string = False
    i = 0
    while i < len(s):
        c = s[i]
        if c == '\\' and in_string:
            # Keep escape sequence as-is
            result.append(c)
            i += 1
            if i < len(s):
                result.append(s[i])
                i += 1
            continue
        if c == '"':
            if not in_string:
                in_string = True
                result.append(c)
            else:
                # Check if this closes the string or is a bare quote inside
                # A closing quote is followed by: whitespace, ':', ',', '}', ']'
                j = i + 1
                while j < len(s) and s[j] == ' ':
                    j += 1
                next_c = s[j] if j < len(s) else ''
                if next_c in (':', ',', '}', ']', ''):
                    in_string = False
                    result.append(c)
                else:
                    # Bare quote inside string — escape it
                    result.append('\\"')
            i += 1
            continue
        result.append(c)
        i += 1
    return ''.join(result)


# ── LLM call ──────────────────────────────────────────────────────────────────
def generate_content(row: dict, retries: int = 3) -> dict:
    ctx = _row_context(row)
    last_err = None

    for attempt in range(retries):
        try:
            print(f"\n    [step 1/3] summary…", end=" ", flush=True)
            summary = _gen_summary(ctx)
            print("ok", end=" ", flush=True)

            print(f"[step 2/3] content_md…", end=" ", flush=True)
            content_md = _gen_content_md(ctx)
            print("ok", end=" ", flush=True)

            print(f"[step 3/3] steps…", end=" ", flush=True)
            steps = _gen_steps(ctx)
            print("ok")

            return {"summary": summary, "content_md": content_md, "steps": steps}

        except Exception as e:
            last_err = e
            print(f"\n  ⚠ Attempt {attempt+1} failed: {e}")
            if attempt < retries - 1:
                time.sleep(2 ** attempt)

    raise RuntimeError(f"Failed to generate content for: {row.get('slug')}")

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Generate tutorial content via LLM")
    parser.add_argument("--slug",      help="Process a single tutorial by slug")
    parser.add_argument("--limit",     type=int, default=0, help="Max rows to process")
    parser.add_argument("--overwrite", action="store_true", help="Re-generate even if content_md already exists")
    parser.add_argument("--category",  help="Filter by category (e.g. AI对话)")
    args = parser.parse_args()

    # Fetch tutorials
    query = sb.table("tutorials").select(
        "id, slug, title, category, difficulty, duration_minutes, tool_slug, tags, summary, content_md"
    ).eq("is_published", True)

    if args.slug:
        query = query.eq("slug", args.slug)
    if args.category:
        query = query.eq("category", args.category)

    rows = query.order("created_at").execute().data or []

    if not rows:
        print("No tutorials found.")
        return

    if args.limit:
        rows = rows[:args.limit]

    total = len(rows)
    done = skipped = failed = 0

    for i, row in enumerate(rows, 1):
        slug     = row["slug"]
        has_data = bool(row.get("content_md"))
        prefix   = f"[{i}/{total}] {slug}"

        if has_data and not args.overwrite:
            print(f"{prefix}  ✓ skip (already has content_md)")
            skipped += 1
            continue

        print(f"{prefix}  → generating…", end=" ", flush=True)
        try:
            data = generate_content(row)
            update_payload = {
                "summary":    data["summary"],
                "content_md": data["content_md"],
                "steps":      data["steps"],
            }
            sb.table("tutorials").update(update_payload).eq("id", row["id"]).execute()
            print("✓ done")
            done += 1
        except Exception as e:
            print(f"✗ FAILED: {e}")
            failed += 1

        # Rate-limit
        if i < total:
            time.sleep(0.6)

    print(f"\n{'─'*40}")
    print(f"Done: {done}  Skipped: {skipped}  Failed: {failed}  Total: {total}")

if __name__ == "__main__":
    main()
