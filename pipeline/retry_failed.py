# -*- coding: utf-8 -*-
"""
Retry script for failed tools: v0, Zapier AI
Prints full LLM response for debugging, then appends to generated_data.ts
"""

import sys
import json
import re
import time
from pathlib import Path
from openai import OpenAI

TEXT_API_KEY   = "sk-vw7nwidIvtBs8CSs6mJZUw3SyvGWxJneJ6cpjD9BB4noBcV7"
PROXY_BASE_URL = "https://aiapi.tnt-pub.com/v1"
TEXT_MODEL     = "claude-sonnet-4-6"

PROJECT_ROOT = Path(__file__).parent.parent
OUTPUT_TS    = PROJECT_ROOT / "src" / "data" / "generated_data.ts"

text_client = OpenAI(api_key=TEXT_API_KEY, base_url=PROXY_BASE_URL)

FAILED_TOOLS = [
    {
        "name": "v0",
        "category": "coding",
        "keywords": "UI生成 React组件 Vercel AI",
        "website": "https://v0.dev",
        "slug": "v0",
    },
    {
        "name": "Zapier AI",
        "category": "productivity",
        "keywords": "自动化 工作流 无代码集成",
        "website": "https://zapier.com",
        "slug": "zapier-ai",
    },
]

CATEGORY_SLUG_MAP = {
    "AI对话": "chat", "AI编程": "coding", "AI绘图": "image",
    "AI写作": "writing", "AI视频": "video", "AI SEO": "seo",
    "AI搜索": "search", "AI设计": "design", "AI音频": "audio",
    "AI效率": "productivity",
}


def extract_json(raw: str) -> dict:
    text = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.MULTILINE)
    text = re.sub(r"\s*```$", "", text.strip(), flags=re.MULTILINE)
    text = text.strip()
    start = text.find("{")
    if start == -1:
        raise ValueError(f"No JSON object found: {text[:300]}")
    text = text[start:]
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
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
    if last_safe_pos > 0:
        try:
            return json.loads(text[:last_safe_pos])
        except json.JSONDecodeError:
            pass
    repaired = text.rstrip().rstrip(",")
    repaired += "]" * depth_bracket + "}" * max(depth_brace, 1)
    try:
        return json.loads(repaired)
    except json.JSONDecodeError as e:
        raise ValueError(f"JSON repair failed: {e}\nRaw: {raw[:500]}")


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


def tool_ts_block(tool: dict) -> list[str]:
    slug   = tool.get("slug", "")
    domain = tool.get("website", "").replace("https://", "").replace("http://", "").rstrip("/")
    logo_url = f"https://logo.clearbit.com/{domain}" if domain else "/images/tools/placeholder.png"
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
    lines.append(f'    imageUrl: "/images/tools/placeholder.png",')
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
    content = OUTPUT_TS.read_text(encoding="utf-8")
    close_idx = content.rfind("];")
    if close_idx == -1:
        print("ERROR: Could not find ]; in output file")
        return
    new_blocks = []
    for tool in new_tools:
        new_blocks.extend(tool_ts_block(tool))
    insertion = "\n".join(new_blocks) + "\n"
    updated = content[:close_idx] + insertion + content[close_idx:]
    OUTPUT_TS.write_text(updated, encoding="utf-8")
    print(f"✅ Appended {len(new_tools)} tools to {OUTPUT_TS}")


def generate_tool(tool_info: dict) -> dict:
    tool_name = tool_info["name"]
    slug      = tool_info["slug"]
    category  = tool_info["category"]
    keywords  = tool_info["keywords"]
    website   = tool_info["website"]

    prompt = f"""你是AI工具测评写手。为以下工具生成JSON，所有字符串极度简短。

工具：{tool_name} | 分类：{category} | 官网：{website}

返回JSON（严格控制长度，整体响应不超过1000字符）：
{{
  "name": "{tool_name}",
  "slug": "{slug}",
  "website": "{website}",
  "category": "{category}",
  "tags": ["标签1", "标签2", "标签3"],
  "tagline": "最多15字",
  "description": "最多60字",
  "title": "最多25字",
  "metaDescription": "最多40字",
  "heroTitle": "最多15字",
  "heroSubtitle": "最多25字",
  "features": ["功能1", "功能2", "功能3"],
  "pros": ["优点1", "优点2", "优点3"],
  "cons": ["缺点1", "缺点2"],
  "useCases": ["场景1", "场景2"],
  "pricing": "freemium",
  "pricingDetail": "最多20字",
  "rating": 4.5,
  "reviewCount": 1280,
  "faqs": [{{"question": "问题1", "answer": "回答1最多20字"}}],
  "howToSteps": [
    {{"name": "步骤1", "text": "说明最多15字"}},
    {{"name": "步骤2", "text": "说明最多15字"}}
  ]
}}

规则：只返回JSON，无代码块，无注释，所有括号必须闭合。"""

    print(f"\n{'='*60}")
    print(f"Processing: {tool_name}")
    print(f"{'='*60}")

    for attempt in range(1, 4):
        try:
            response = text_client.chat.completions.create(
                model=TEXT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=6000,
            )
            raw = response.choices[0].message.content
            print(f"\n--- RAW RESPONSE (attempt {attempt}) ---")
            print(raw[:1000])
            print(f"--- END RAW (total {len(raw)} chars) ---\n")

            data = extract_json(raw)
            # Force correct slug and category
            data["slug"] = slug
            data["category"] = category
            data["website"] = website
            data["name"] = tool_name

            valid_pricing = {"free", "freemium", "paid", "enterprise"}
            if data.get("pricing") not in valid_pricing:
                data["pricing"] = "freemium"

            print(f"✅ JSON parsed successfully for {tool_name}")
            return data

        except Exception as e:
            print(f"❌ Attempt {attempt}/3 failed: {e}")
            time.sleep(2)

    raise RuntimeError(f"All 3 attempts failed for {tool_name}")


def main():
    # Check which tools are already in the output file
    existing_slugs = set()
    if OUTPUT_TS.exists():
        ts_content = OUTPUT_TS.read_text(encoding="utf-8")
        existing_slugs = set(re.findall(r'slug: [`"]([^`"]+)[`"]', ts_content))
        print(f"Found {len(existing_slugs)} existing slugs in output file")

    to_process = [t for t in FAILED_TOOLS if t["slug"] not in existing_slugs]
    if not to_process:
        print("All failed tools are already in the output file. Nothing to do.")
        return

    print(f"Will process: {[t['name'] for t in to_process]}")

    success = []
    failed  = []

    for tool_info in to_process:
        try:
            data = generate_tool(tool_info)
            success.append(data)
        except Exception as e:
            print(f"FINAL FAILURE for {tool_info['name']}: {e}")
            failed.append(tool_info["name"])

    if success:
        append_to_typescript(success)

    print(f"\n{'='*60}")
    print(f"Done. Success: {[t['name'] for t in success]}")
    if failed:
        print(f"Still failed: {failed}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
