# -*- coding: utf-8 -*-
"""
AI Tools Nav - Content Pipeline
Text:  openai SDK -> claude-sonnet-4-6 via proxy
Image: placeholder (SVG generation suspended)
Output: src/data/generated_data.ts — AITool-compatible schema
"""

import sys
import json
import csv
import time
import re
from datetime import datetime
from pathlib import Path

from openai import OpenAI

# ── Config ───────────────────────────────────────────────────────────────────
TEXT_API_KEY   = "sk-vw7nwidIvtBs8CSs6mJZUw3SyvGWxJneJ6cpjD9BB4noBcV7"
PROXY_BASE_URL = "https://aiapi.tnt-pub.com/v1"
TEXT_MODEL     = "claude-sonnet-4-6"

PROJECT_ROOT  = Path(__file__).parent.parent
OUTPUT_TS     = PROJECT_ROOT / "src" / "data" / "generated_data.ts"

# ── Category slug mapping ─────────────────────────────────────────────────────
CATEGORY_SLUG_MAP = {
    "AI对话":   "chat",
    "AI编程":   "coding",
    "AI绘图":   "image",
    "AI写作":   "writing",
    "AI视频":   "video",
    "AI SEO":   "seo",
    "AI搜索":   "search",
    "AI设计":   "design",
    "AI音频":   "audio",
    "AI效率":   "productivity",
}

# ── Client ────────────────────────────────────────────────────────────────────
text_client = OpenAI(api_key=TEXT_API_KEY, base_url=PROXY_BASE_URL)


# ── CSV Reader ────────────────────────────────────────────────────────────────
def read_keywords_csv(csv_path: str) -> list[dict]:
    tools = []
    with open(csv_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            tools.append({
                "name":     row.get("name", "").strip(),
                "category": row.get("category", "").strip(),
                "keywords": row.get("keywords", "").strip(),
                "website":  row.get("website", "").strip(),
            })
    return [t for t in tools if t["name"]]


# ── JSON extractor ────────────────────────────────────────────────────────────
def extract_json(raw: str) -> dict:
    """Extract and repair JSON from LLM response."""
    # Strip markdown code fences
    text = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.MULTILINE)
    text = re.sub(r"\s*```$", "", text.strip(), flags=re.MULTILINE)
    text = text.strip()

    # Find the outermost { ... }
    start = text.find("{")
    if start == -1:
        raise ValueError(f"No JSON object found in response: {text[:200]}")
    text = text[start:]

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Repair: find last complete key-value pair and close open structures
    # Count open braces/brackets
    depth_brace = 0
    depth_bracket = 0
    in_string = False
    escape_next = False
    last_safe_pos = 0

    for i, ch in enumerate(text):
        if escape_next:
            escape_next = False
            continue
        if ch == "\\" and in_string:
            escape_next = True
            continue
        if ch == '"' and not escape_next:
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch == "{":
            depth_brace += 1
        elif ch == "}":
            depth_brace -= 1
            if depth_brace == 0:
                last_safe_pos = i + 1
        elif ch == "[":
            depth_bracket += 1
        elif ch == "]":
            depth_bracket -= 1

    # If we found a complete top-level object, try that slice
    if last_safe_pos > 0:
        try:
            return json.loads(text[:last_safe_pos])
        except json.JSONDecodeError:
            pass

    # Last resort: close open structures
    repaired = text.rstrip().rstrip(",")
    repaired += "]" * depth_bracket + "}" * max(depth_brace, 1)
    try:
        return json.loads(repaired)
    except json.JSONDecodeError as e:
        raise ValueError(f"JSON repair failed: {e}\nRaw snippet: {raw[:300]}")


# ── Text content generator ────────────────────────────────────────────────────
def generate_text_content(tool_name: str, tool_info: dict) -> dict:
    print(f"  [Text] Generating content for {tool_name}...")

    category    = tool_info.get("category", "AI Tool")
    keywords    = tool_info.get("keywords", tool_name)
    website     = tool_info.get("website", "")
    slug        = tool_name.lower().replace(" ", "-").replace("/", "-")
    cat_slug    = CATEGORY_SLUG_MAP.get(category, category.lower().replace(" ", "-"))

    prompt = f"""你是一名专业的中文AI工具测评SEO内容写手。

为以下AI工具生成结构化内容：
工具名称：{tool_name}
分类：{category}
关键词：{keywords}
官网：{website}

返回如下JSON对象，所有字符串值保持简短以避免截断：
{{
  "name": "{tool_name}",
  "slug": "{slug}",
  "website": "{website}",
  "category": "{cat_slug}",
  "tags": ["标签1", "标签2", "标签3"],
  "tagline": "一句话介绍（中文，最多30字）",
  "description": "工具概述（中文，单段，最多150字）",
  "title": "SEO页面标题（中文，最多40字）",
  "metaDescription": "Meta描述（中文，最多80字）",
  "heroTitle": "主标题（中文，最多30字）",
  "heroSubtitle": "副标题（中文，最多60字）",
  "features": ["功能1（最多20字）", "功能2", "功能3", "功能4", "功能5"],
  "pros": ["优点1（最多25字）", "优点2", "优点3"],
  "cons": ["缺点1（最多25字）", "缺点2", "缺点3"],
  "useCases": ["使用场景1（最多25字）", "使用场景2", "使用场景3"],
  "pricing": "freemium",
  "pricingDetail": "定价详情（中文，最多50字，如：免费版 / Pro $20/月）",
  "rating": 4.5,
  "reviewCount": 1280,
  "faqs": [
    {{"question": "常见问题1（最多30字）", "answer": "回答1（最多80字）"}},
    {{"question": "常见问题2（最多30字）", "answer": "回答2（最多80字）"}}
  ],
  "howToSteps": [
    {{"name": "步骤1名称（最多15字）", "text": "步骤1说明（最多50字）"}},
    {{"name": "步骤2名称（最多15字）", "text": "步骤2说明（最多50字）"}},
    {{"name": "步骤3名称（最多15字）", "text": "步骤3说明（最多50字）"}}
  ]
}}

pricing字段必须是以下之一：free / freemium / paid / enterprise

严格要求：
1. 只返回原始JSON对象，不要markdown代码块，不要任何解释
2. 不允许有尾随逗号
3. 所有字符串按上述长度限制，严格不超长
4. 整个响应必须是可解析的合法JSON，确保所有括号闭合"""

    last_err = None
    for attempt in range(1, 4):  # up to 3 attempts
        try:
            response = text_client.chat.completions.create(
                model=TEXT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=6000,
            )
            raw = response.choices[0].message.content
            data = extract_json(raw)

            # Ensure pricing is a valid PricingType
            valid_pricing = {"free", "freemium", "paid", "enterprise"}
            if data.get("pricing") not in valid_pricing:
                data["pricing"] = "freemium"

            return data
        except Exception as e:
            last_err = e
            print(f"  [Retry {attempt}/3] {tool_name}: {e}")
            time.sleep(2)

    raise last_err


# ── SVG icon generation — DISABLED ───────────────────────────────────────────
def generate_tool_image(tool_name: str, slug: str, category: str = "AI Tool") -> str:
    """Image generation suspended. Always returns placeholder."""
    return "/images/tools/placeholder.png"


# ── TypeScript serializer helpers ─────────────────────────────────────────────
def ts_string(val: str) -> str:
    escaped = val.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
    return f"`{escaped}`"

def ts_string_array(arr: list) -> str:
    items = ", ".join(f'"{str(i).replace(chr(34), chr(39))}"' for i in arr)
    return f"[{items}]"

def ts_faq_array(arr: list) -> str:
    parts = []
    for faq in arr:
        q = str(faq.get("question", "")).replace('"', "'")
        a = str(faq.get("answer", "")).replace('"', "'")
        parts.append(f'    {{ question: "{q}", answer: "{a}" }}')
    return "[\n" + ",\n".join(parts) + "\n  ]"

def ts_howto_array(arr: list) -> str:
    parts = []
    for step in arr:
        n = str(step.get("name", "")).replace('"', "'")
        t = str(step.get("text", "")).replace('"', "'")
        parts.append(f'    {{ name: "{n}", text: "{t}" }}')
    return "[\n" + ",\n".join(parts) + "\n  ]"


# ── Assembler ─────────────────────────────────────────────────────────────────
def _tool_ts_block(tool: dict) -> list[str]:
    """Return the lines for a single tool entry (without leading/trailing array brackets)."""
    slug        = tool.get("slug", "")
    domain      = tool.get("website", "").replace("https://", "").replace("http://", "").rstrip("/")
    logo_url    = f"https://logo.clearbit.com/{domain}" if domain else "/images/tools/placeholder.png"
    image_url   = tool.get("imageUrl", "/images/tools/placeholder.png")

    lines = []
    lines.append("  {")
    lines.append(f'    id: "{slug}",')
    lines.append(f'    slug: "{slug}",')
    lines.append(f'    name: {ts_string(tool.get("name", slug))},')
    lines.append(f'    tagline: {ts_string(tool.get("tagline", ""))},')
    lines.append(f'    description: {ts_string(tool.get("description", ""))},')
    lines.append(f'    category: "{tool.get("category", "productivity")}",')
    lines.append(f'    tags: {ts_string_array(tool.get("tags", []))},')
    lines.append(f'    website: "{tool.get("website", "")}",')
    lines.append(f'    logoUrl: "{logo_url}",')
    lines.append(f'    imageUrl: "{image_url}",')
    lines.append(f'    pricing: "{tool.get("pricing", "freemium")}",')
    lines.append(f'    pricingDetail: {ts_string(tool.get("pricingDetail", ""))},')
    lines.append(f'    rating: {tool.get("rating", 4.0)},')
    lines.append(f'    reviewCount: {tool.get("reviewCount", 0)},')
    lines.append(f'    title: {ts_string(tool.get("title", ""))},')
    lines.append(f'    metaDescription: {ts_string(tool.get("metaDescription", ""))},')
    lines.append(f'    heroTitle: {ts_string(tool.get("heroTitle", ""))},')
    lines.append(f'    heroSubtitle: {ts_string(tool.get("heroSubtitle", ""))},')
    lines.append(f'    features: {ts_string_array(tool.get("features", []))},')
    lines.append(f'    pros: {ts_string_array(tool.get("pros", []))},')
    lines.append(f'    cons: {ts_string_array(tool.get("cons", []))},')
    lines.append(f'    useCases: {ts_string_array(tool.get("useCases", []))},')
    lines.append(f'    faqs: {ts_faq_array(tool.get("faqs", []))},')
    lines.append(f'    howToSteps: {ts_howto_array(tool.get("howToSteps", []))},')
    lines.append("  },")
    return lines


def append_to_typescript(new_tools: list[dict]) -> None:
    """Splice new tool entries before the closing ]; in the existing TS file."""
    content = OUTPUT_TS.read_text(encoding="utf-8")
    # Find the last ]; which closes the array
    close_idx = content.rfind("];")
    if close_idx == -1:
        # Fallback: just assemble from scratch (shouldn't happen)
        assemble_typescript(new_tools)
        return

    new_blocks = []
    for tool in new_tools:
        new_blocks.extend(_tool_ts_block(tool))

    insertion = "\n".join(new_blocks) + "\n"
    updated = content[:close_idx] + insertion + content[close_idx:]
    OUTPUT_TS.write_text(updated, encoding="utf-8")
    print(f"✅ Appended {len(new_tools)} tools to {OUTPUT_TS}")


def assemble_typescript(all_tools: list[dict]) -> None:
    lines = [
        "// AUTO-GENERATED by content_pipeline.py — DO NOT EDIT MANUALLY",
        f"// Generated: {datetime.now().isoformat()}",
        f"// Tools: {len(all_tools)}",
        "",
        'import type { AITool } from "@/types/tool";',
        "",
        "export const generatedTools: AITool[] = [",
    ]

    for tool in all_tools:
        lines.extend(_tool_ts_block(tool))

    lines.append("];")
    lines.append("")

    OUTPUT_TS.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_TS.write_text("\n".join(lines), encoding="utf-8")
    print(f"\n✅ Written {len(all_tools)} tools to {OUTPUT_TS}")


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    csv_path = Path(__file__).parent / "keywords.csv"
    if not csv_path.exists():
        print(f"ERROR: keywords.csv not found at {csv_path}")
        sys.exit(1)

    tools_list = read_keywords_csv(str(csv_path))
    print(f"📋 Loaded {len(tools_list)} tools from keywords.csv")

    # Load existing generated data to support incremental runs
    existing: dict[str, dict] = {}
    if OUTPUT_TS.exists():
        print(f"📂 Output file exists — will skip already-generated tools")
        # Parse existing slugs from the TS file (simple regex approach)
        ts_content = OUTPUT_TS.read_text(encoding="utf-8")
        existing_slugs = set(re.findall(r'slug: [`"]([^`"]+)[`"]', ts_content))
        print(f"   Found {len(existing_slugs)} existing slugs")
    else:
        existing_slugs = set()

    all_tools: list[dict] = []
    failed: list[str] = []

    for i, tool_info in enumerate(tools_list, 1):
        tool_name = tool_info["name"]
        slug = tool_name.lower().replace(" ", "-").replace("/", "-")

        if slug in existing_slugs:
            print(f"[{i}/{len(tools_list)}] ⏭  Skipping {tool_name} (already generated)")
            continue

        print(f"\n[{i}/{len(tools_list)}] Processing: {tool_name}")
        try:
            data = generate_text_content(tool_name, tool_info)
            data["imageUrl"] = generate_tool_image(tool_name, slug, tool_info.get("category", ""))
            all_tools.append(data)
            print(f"  ✅ {tool_name} done")
        except Exception as e:
            print(f"  ❌ {tool_name} FAILED: {e}")
            failed.append(tool_name)

        time.sleep(0.5)

    if all_tools:
        if OUTPUT_TS.exists() and existing_slugs:
            # Incremental mode: splice new tool entries before the closing "];
            print(f"\n📝 Incremental mode: appending {len(all_tools)} new tools to existing file")
            append_to_typescript(all_tools)
        else:
            assemble_typescript(all_tools)
    else:
        print("\n⚠️  No new tools to write.")

    if failed:
        print(f"\n❌ Failed tools ({len(failed)}): {', '.join(failed)}")
    else:
        print("\n🎉 All tools processed successfully!")


if __name__ == "__main__":
    main()
