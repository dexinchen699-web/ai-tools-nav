"""
Generate comparison-specific pros/cons for each entry in the `comparisons` table
and write them to the `pros_cons` JSONB field.

Usage:
    py scripts/generate_comparisons.py
    py scripts/generate_comparisons.py --slug chatgpt-vs-claude   # single entry
    py scripts/generate_comparisons.py --limit 5                  # first N entries
    py scripts/generate_comparisons.py --overwrite                # re-generate existing

Requires env vars (or .env.local):
    NEXT_PUBLIC_SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY
    OPENAI_API_KEY  (proxy key — same key used by pipeline/)
"""

import os
import sys
import json
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
MODEL        = os.environ.get("COMPARISON_MODEL", "claude-sonnet-4-6")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
client   = OpenAI(api_key=OPENAI_KEY, base_url=PROXY_BASE)

# ── Prompt ────────────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """\
你是一位专业的 AI 工具评测编辑，擅长撰写深度对比内容，面向中文用户。
你的任务是为两款 AI 工具生成"对比性"优势与劣势——
即：相对于对方，每款工具各自的优势和劣势是什么。

输出必须是合法 JSON，格式如下（不要输出任何其他内容）：
{
  "tool1_pros": ["优势1", "优势2", "优势3", "优势4"],
  "tool1_cons": ["劣势1", "劣势2", "劣势3"],
  "tool2_pros": ["优势1", "优势2", "优势3", "优势4"],
  "tool2_cons": ["劣势1", "劣势2", "劣势3"]
}

要求：
- 每项 3-5 条，每条 15-40 字
- 内容必须是"相对于对方"的对比性描述，不是泛泛的工具介绍
- 使用简体中文，语气专业但易读
- 不要输出 JSON 以外的任何内容（无 markdown 代码块，无解释）
"""

def build_user_prompt(tool_a: str, tool_b: str, title: str) -> str:
    return f"""\
对比标题：{title}
工具A（tool1）：{tool_a}
工具B（tool2）：{tool_b}

请生成这两款工具的对比性优势与劣势。
"""

# ── LLM call ──────────────────────────────────────────────────────────────────
def generate_pros_cons(tool_a: str, tool_b: str, title: str, retries: int = 3) -> dict:
    for attempt in range(retries):
        try:
            resp = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user",   "content": build_user_prompt(tool_a, tool_b, title)},
                ],
                temperature=0.7,
                max_tokens=800,
            )
            raw = resp.choices[0].message.content.strip()
            # Strip markdown code fences if present
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            data = json.loads(raw)
            # Validate structure
            for key in ("tool1_pros", "tool1_cons", "tool2_pros", "tool2_cons"):
                if key not in data or not isinstance(data[key], list):
                    raise ValueError(f"Missing or invalid key: {key}")
            return data
        except Exception as e:
            print(f"  ⚠ Attempt {attempt+1} failed: {e}")
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
    raise RuntimeError(f"Failed to generate pros/cons for {tool_a} vs {tool_b}")

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Generate comparison pros/cons")
    parser.add_argument("--slug",      help="Process a single comparison by slug")
    parser.add_argument("--limit",     type=int, default=0, help="Max entries to process")
    parser.add_argument("--overwrite", action="store_true", help="Re-generate even if pros_cons already exists")
    args = parser.parse_args()

    # Fetch comparisons
    query = supabase.table("comparisons").select("id, slug, tool1_slug, tool2_slug, title, pros_cons")
    if args.slug:
        query = query.eq("slug", args.slug)
    rows = query.execute().data or []

    if not rows:
        print("No comparisons found.")
        return

    if args.limit:
        rows = rows[:args.limit]

    total = len(rows)
    done = skipped = failed = 0

    for i, row in enumerate(rows, 1):
        slug      = row["slug"]
        tool_a    = row.get("tool1_slug") or slug.split("-vs-")[0]
        tool_b    = row.get("tool2_slug") or ("-vs-".join(slug.split("-vs-")[1:]))
        title     = row.get("title") or f"{tool_a} vs {tool_b}"
        has_data  = bool(row.get("pros_cons"))

        prefix = f"[{i}/{total}] {slug}"

        if has_data and not args.overwrite:
            print(f"{prefix}  ✓ skip (already has pros_cons)")
            skipped += 1
            continue

        print(f"{prefix}  → generating…", end=" ", flush=True)
        try:
            pros_cons = generate_pros_cons(tool_a, tool_b, title)
            supabase.table("comparisons").update({"pros_cons": pros_cons}).eq("id", row["id"]).execute()
            print("✓ done")
            done += 1
        except Exception as e:
            print(f"✗ FAILED: {e}")
            failed += 1

        # Rate-limit: ~2 req/s
        if i < total:
            time.sleep(0.5)

    print(f"\n{'─'*40}")
    print(f"Done: {done}  Skipped: {skipped}  Failed: {failed}  Total: {total}")

if __name__ == "__main__":
    main()
