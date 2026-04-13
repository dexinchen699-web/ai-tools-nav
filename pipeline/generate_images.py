# -*- coding: utf-8 -*-
"""
AI Tools Nav - 批量封面图生成脚本
使用 gemini-2.5-flash-image 为每个工具生成封面图，
保存到 public/images/tools/<slug>.png，
并更新 generated_data.ts 中对应的 imageUrl 字段。

用法：
  py pipeline/generate_images.py              # 生成全部（跳过已存在）
  py pipeline/generate_images.py chatgpt      # 只生成指定 slug
  py pipeline/generate_images.py --force      # 强制重新生成所有
"""

import sys
import re
import base64
import time
from pathlib import Path

from openai import OpenAI

# ── Config ────────────────────────────────────────────────────────────────────
IMAGE_API_KEY  = "sk-0ZK3T37jZRDhDpGFfOX9FD51BalbBBBevxs5K6pFGxdke7l8"
PROXY_BASE_URL = "https://aiapi.tnt-pub.com/v1"
IMAGE_MODEL    = "gemini-2.5-flash-image"   # fallback: "doubao-image"

PROJECT_ROOT   = Path(__file__).parent.parent
OUTPUT_TS      = PROJECT_ROOT / "src" / "data" / "generated_data.ts"
IMAGES_DIR     = PROJECT_ROOT / "public" / "images" / "tools"

IMAGES_DIR.mkdir(parents=True, exist_ok=True)

client = OpenAI(api_key=IMAGE_API_KEY, base_url=PROXY_BASE_URL)

# ── Category → style hint ─────────────────────────────────────────────────────
CATEGORY_STYLE = {
    "chat":         "conversational AI, speech bubbles, neural network",
    "image":        "digital art, colorful palette, creative brushstrokes",
    "coding":       "code editor, terminal, dark theme, syntax highlighting",
    "writing":      "pen and paper, typewriter, elegant typography",
    "video":        "film reel, play button, cinematic lighting",
    "seo":          "search bar, analytics chart, magnifying glass",
    "search":       "search engine, web graph, information retrieval",
    "design":       "UI wireframe, color swatches, vector shapes",
    "audio":        "sound waves, music notes, microphone",
    "productivity": "calendar, task list, workflow automation",
}


def build_prompt(tool_name: str, category: str) -> str:
    style = CATEGORY_STYLE.get(category, "technology, AI, modern")
    return (
        f"A professional cover image for an AI tool called '{tool_name}'. "
        f"Theme: {style}. "
        "Style: modern flat design, vibrant gradient background (purple to blue), "
        "clean white icon or logo in center, subtle tech grid pattern, "
        "professional SaaS product aesthetic, 16:9 aspect ratio. "
        "No text, no watermarks."
    )


def generate_image(tool_name: str, slug: str, category: str) -> str | None:
    """
    Generate one image. Returns local web path like /images/tools/chatgpt.png,
    or None on failure.
    """
    out_path = IMAGES_DIR / f"{slug}.png"
    prompt = build_prompt(tool_name, category)

    for attempt in range(1, 4):
        try:
            resp = client.images.generate(
                model=IMAGE_MODEL,
                prompt=prompt,
                n=1,
                size="1024x576",   # 16:9
            )
            item = resp.data[0]
            raw  = item.model_dump() if hasattr(item, "model_dump") else vars(item)

            b64 = raw.get("b64_json")
            url = raw.get("url")

            if b64:
                out_path.write_bytes(base64.b64decode(b64))
                print(f"  ✅ Saved (b64) → {out_path.name}")
                return f"/images/tools/{slug}.png"

            elif url:
                import httpx
                r = httpx.get(url, timeout=30)
                r.raise_for_status()
                out_path.write_bytes(r.content)
                print(f"  ✅ Saved (url) → {out_path.name}")
                return f"/images/tools/{slug}.png"

            else:
                print(f"  [WARN] No image data in response: {list(raw.keys())}")
                return None

        except Exception as e:
            print(f"  [Retry {attempt}/3] {tool_name}: {e}")
            time.sleep(3)

    return None


def parse_tools_from_ts() -> list[dict]:
    """
    Parse slug, name, category, imageUrl from generated_data.ts.
    Returns list of dicts.
    """
    content = OUTPUT_TS.read_text(encoding="utf-8")

    # Split into per-tool blocks by finding each { ... } at top level of the array
    # Simple approach: find all slug/name/category/imageUrl fields per block
    tools = []
    # Find all tool blocks (between consecutive top-level { and },)
    # We'll use a line-by-line state machine
    in_block = False
    current: dict = {}
    brace_depth = 0

    for line in content.splitlines():
        stripped = line.strip()

        if not in_block:
            if stripped == "{":
                in_block = True
                brace_depth = 1
                current = {}
            continue

        # Track brace depth
        brace_depth += stripped.count("{") - stripped.count("}")

        # Extract fields
        for field in ("slug", "name", "category", "imageUrl"):
            # Match:  slug: `value`,  or  slug: "value",
            m = re.match(rf'{field}:\s*[`"]([^`"]*)[`"]', stripped)
            if m:
                current[field] = m.group(1)

        if brace_depth <= 0:
            in_block = False
            if current.get("slug"):
                tools.append(current)
            current = {}

    return tools


def update_image_url_in_ts(slug: str, image_path: str) -> None:
    """
    Replace imageUrl for a specific slug in generated_data.ts.
    Finds the tool block by slug and updates its imageUrl line.
    """
    content = OUTPUT_TS.read_text(encoding="utf-8")

    # Strategy: find the slug line, then find the next imageUrl line within ~30 lines
    lines = content.splitlines(keepends=True)
    slug_pattern = re.compile(rf'slug:\s*[`"]{re.escape(slug)}[`"]')
    image_pattern = re.compile(r'(\s*imageUrl:\s*)[`"][^`"]*[`"]')

    i = 0
    while i < len(lines):
        if slug_pattern.search(lines[i]):
            # Found the slug — scan forward for imageUrl within the same block
            for j in range(i + 1, min(i + 40, len(lines))):
                m = image_pattern.match(lines[j])
                if m:
                    lines[j] = image_pattern.sub(
                        rf'\g<1>"{image_path}"', lines[j]
                    )
                    OUTPUT_TS.write_text("".join(lines), encoding="utf-8")
                    print(f"  📝 Updated imageUrl for {slug} in generated_data.ts")
                    return
            break
        i += 1

    print(f"  [WARN] Could not find imageUrl field for slug '{slug}' in TS file")


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    args = sys.argv[1:]
    force = "--force" in args
    target_slugs = [a for a in args if not a.startswith("--")]

    if not OUTPUT_TS.exists():
        print(f"ERROR: {OUTPUT_TS} not found. Run content_pipeline.py first.")
        sys.exit(1)

    tools = parse_tools_from_ts()
    print(f"📋 Found {len(tools)} tools in generated_data.ts")

    if target_slugs:
        tools = [t for t in tools if t["slug"] in target_slugs]
        print(f"🎯 Targeting: {[t['slug'] for t in tools]}")

    generated = 0
    skipped   = 0
    failed    = []

    for i, tool in enumerate(tools, 1):
        slug     = tool["slug"]
        name     = tool.get("name", slug)
        category = tool.get("category", "productivity")
        out_path = IMAGES_DIR / f"{slug}.png"

        # Skip if already generated (unless --force)
        if out_path.exists() and not force:
            current_url = tool.get("imageUrl", "")
            if current_url and "placeholder" not in current_url:
                print(f"[{i}/{len(tools)}] ⏭  Skipping {name} (image exists)")
                skipped += 1
                continue

        print(f"\n[{i}/{len(tools)}] 🎨 Generating image for: {name} ({category})")
        result = generate_image(name, slug, category)

        if result:
            update_image_url_in_ts(slug, result)
            generated += 1
        else:
            print(f"  ❌ Failed: {name}")
            failed.append(name)

        # Rate limit: 1 image per 2s
        time.sleep(2)

    print(f"\n{'='*50}")
    print(f"✅ Generated: {generated}")
    print(f"⏭  Skipped:   {skipped}")
    if failed:
        print(f"❌ Failed ({len(failed)}): {', '.join(failed)}")
    else:
        print("🎉 No failures!")
    print(f"\n💡 Next: git add public/images/tools src/data/generated_data.ts && git commit -m 'feat: add tool cover images'")


if __name__ == "__main__":
    main()
