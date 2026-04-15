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
        raise ValueError(f"JSON repair failed: {e}\nRaw snippet: {raw[:300]}")


# ── Text content generator ────────────────────────────────────────────────────
def generate_text_content(tool_name: str, tool_info: dict) -> dict:
    print(f"  [Text] Generating content for {tool_name}...")

    category    = tool_info.get("category", "AI Tool")
    keywords    = tool_info.get("keywords", tool_name)
    website     = tool_info.get("website", "")
    slug        = tool_name.lower().replace(" ", "-").replace("/", "-")
    cat_slug    = CATEGORY_SLUG_MAP.get(category, category.lower().replace(" ", "-"))

    prompt = f"""你是一名资深中文AI工具测评编辑，拥有5年以上AI产品深度测评经验，文章风格参考少数派、爱范儿、ai-bot.cn——专业、有深度、对用户真正有价值，绝不堆砌空洞形容词。

请为以下AI工具生成一篇完整、高质量的结构化测评内容：
工具名称：{tool_name}
分类：{category}
关键词：{keywords}
官网：{website}

【内容质量标准】

introduction（核心介绍，最重要的字段）：
- 必须写3段，每段100-150字，总计350-500字
- 第一段：工具的诞生背景、开发团队/公司、在行业中的定位，以及解决了什么核心痛点
- 第二段：深入解析核心技术原理或架构优势，与同类工具的本质差异，为什么技术上更先进或更适合某类场景
- 第三段：真实使用场景举例（至少2个具体场景），目标用户群体，以及长期使用的价值和ROI
- 语言要有观点，不能只是罗列事实，要有编辑的判断和推荐理由

features（功能特性，6条）：
- 每条必须包含：功能名称 + 具体实现方式 + 实际效果/收益
- 格式：「功能名称」：详细说明（50-80字）
- 避免泛泛而谈，要说清楚"这个功能怎么用、能达到什么效果"

pros（优点，4条，每条40-60字）：
- 必须有具体依据，不能只写"功能强大"
- 要写"为什么强大"，最好有数据或对比

cons（缺点，3条，每条30-50字）：
- 客观真实，不能为了平衡而编造缺点
- 要说明缺点对哪类用户影响最大

useCases（使用场景，4条，每条50-70字）：
- 描述具体的使用流程和预期收益
- 要有代入感，让读者能想象自己在用

faqs（常见问题，4条）：
- 问题必须来自真实用户疑虑（价格、功能限制、与竞品对比、上手难度等）
- 每条回答80-120字，要实用，不能只说"请参考官网"

howToSteps（使用教程，5步）：
- 每步80-120字，要详细到用户能直接按步骤操作
- 包含具体的界面操作、注意事项、小技巧

targetUsers（目标用户，3类，每类40-60字）：
- 精准描述用户画像，说明为什么这类用户特别适合，能获得什么具体收益

返回如下JSON对象（严格遵守格式，不要截断）：
{{
  "name": "{tool_name}",
  "slug": "{slug}",
  "website": "{website}",
  "category": "{cat_slug}",
  "tags": ["标签1", "标签2", "标签3", "标签4", "标签5"],
  "tagline": "一句话核心价值主张（中文，20-40字，突出最大亮点和目标用户）",
  "description": "工具概述（中文，单段，120-180字，涵盖：是什么、核心能力、主要用户群、与竞品的核心差异）",
  "title": "SEO页面标题（中文，30-45字，包含工具名、核心关键词和使用场景）",
  "metaDescription": "Meta描述（中文，100-150字，包含核心功能、使用场景和差异化优势，吸引点击）",
  "heroTitle": "主标题（中文，15-30字，突出核心价值，有吸引力）",
  "heroSubtitle": "副标题（中文，50-80字，补充说明使用场景、差异化优势或具体收益）",
  "features": [
    "「功能名称1」：具体描述实现方式和效果（50-80字）",
    "「功能名称2」：具体描述（50-80字）",
    "「功能名称3」：具体描述（50-80字）",
    "「功能名称4」：具体描述（50-80字）",
    "「功能名称5」：具体描述（50-80字）",
    "「功能名称6」：具体描述（50-80字）"
  ],
  "pros": [
    "优点1：具体说明优势及依据（40-60字）",
    "优点2：具体说明（40-60字）",
    "优点3：具体说明（40-60字）",
    "优点4：具体说明（40-60字）"
  ],
  "cons": [
    "缺点1：客观描述局限性及影响人群（30-50字）",
    "缺点2：客观描述（30-50字）",
    "缺点3：客观描述（30-50字）"
  ],
  "useCases": [
    "场景1：描述具体使用流程和预期收益（50-70字）",
    "场景2：描述（50-70字）",
    "场景3：描述（50-70字）",
    "场景4：描述（50-70字）"
  ],
  "pricing": "freemium",
  "pricingDetail": "定价详情（中文，40-80字，列出所有主要套餐名称和价格，说明各套餐核心差异）",
  "rating": 4.5,
  "reviewCount": 1280,
  "faqs": [
    {{"question": "真实用户常见疑问1（15-30字）", "answer": "详细实用的回答（80-120字）"}},
    {{"question": "真实用户常见疑问2（15-30字）", "answer": "详细实用的回答（80-120字）"}},
    {{"question": "真实用户常见疑问3（15-30字）", "answer": "详细实用的回答（80-120字）"}},
    {{"question": "真实用户常见疑问4（15-30字）", "answer": "详细实用的回答（80-120字）"}}
  ],
  "howToSteps": [
    {{"name": "步骤1名称（8-15字）", "text": "详细操作说明，包含界面操作和注意事项（80-120字）"}},
    {{"name": "步骤2名称（8-15字）", "text": "详细操作说明（80-120字）"}},
    {{"name": "步骤3名称（8-15字）", "text": "详细操作说明（80-120字）"}},
    {{"name": "步骤4名称（8-15字）", "text": "详细操作说明（80-120字）"}},
    {{"name": "步骤5名称（8-15字）", "text": "详细操作说明，包含进阶技巧（80-120字）"}}
  ],
  "introduction": "第一段：工具背景、开发团队、行业定位和核心痛点（100-150字）\\n\\n第二段：核心技术原理、架构优势、与同类工具的本质差异（100-150字）\\n\\n第三段：真实使用场景举例（至少2个）、目标用户群体、长期使用价值（100-150字）",
  "targetUsers": [
    {{"type": "用户类型1（5-10字）", "description": "精准描述用户画像和具体收益（40-60字）"}},
    {{"type": "用户类型2（5-10字）", "description": "精准描述（40-60字）"}},
    {{"type": "用户类型3（5-10字）", "description": "精准描述（40-60字）"}}
  ],
  "pricingTiers": [
    {{"name": "套餐名称1", "price": "具体价格（如：免费 / $0/月）", "features": ["功能点1（15-25字）", "功能点2（15-25字）", "功能点3（15-25字）", "功能点4（15-25字）", "功能点5（15-25字）"]}},
    {{"name": "套餐名称2", "price": "具体价格", "features": ["功能点1", "功能点2", "功能点3", "功能点4", "功能点5"]}},
    {{"name": "套餐名称3（如有）", "price": "具体价格", "features": ["功能点1", "功能点2", "功能点3", "功能点4", "功能点5"]}}
  ],
  "similarTools": [
    {{"name": "同类竞品工具名1", "slug": "similar-tool-slug-1"}},
    {{"name": "同类竞品工具名2", "slug": "similar-tool-slug-2"}},
    {{"name": "同类竞品工具名3", "slug": "similar-tool-slug-3"}}
  ]
}}

pricing字段必须是以下之一：free / freemium / paid / enterprise

严格格式要求：
1. 只返回原始JSON对象，不要markdown代码块，不要任何解释文字
2. 不允许有尾随逗号
3. introduction字段用 \\n\\n 分隔三段，整体作为一个字符串
4. 所有双引号内的内容不能再包含未转义的双引号，用单引号替代
5. 整个响应必须是可解析的合法JSON，确保所有括号正确闭合
6. 内容必须基于该工具的真实情况，不要编造不存在的功能
7. rating字段根据工具实际口碑给出合理评分（3.5-5.0之间），reviewCount根据工具知名度给出合理数字"""

    last_err = None
    for attempt in range(1, 4):  # up to 3 attempts
        try:
            response = text_client.chat.completions.create(
                model=TEXT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=12000,
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
    # screenshotUrl via Microlink
    screenshot_url = f"https://api.microlink.io/?url={tool.get('website', '')}&screenshot=true&meta=false&embed=screenshot.url" if tool.get("website") else ""
    lines.append(f'    screenshotUrl: "{screenshot_url}",')
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

    # introduction
    intro = tool.get("introduction")
    if intro:
        lines.append(f'    introduction: {ts_string(intro)},')

    # targetUsers
    target_users = tool.get("targetUsers", [])
    if target_users:
        parts = []
        for u in target_users:
            t = str(u.get("type", "")).replace('"', "'")
            d = str(u.get("description", "")).replace('"', "'")
            parts.append(f'      {{ type: "{t}", description: "{d}" }}')
        lines.append('    targetUsers: [\n' + ',\n'.join(parts) + '\n    ],')

    # pricingTiers
    pricing_tiers = tool.get("pricingTiers", [])
    if pricing_tiers:
        parts = []
        for tier in pricing_tiers:
            n = str(tier.get("name", "")).replace('"', "'")
            p = str(tier.get("price", "")).replace('"', "'")
            feats = tier.get("features", [])
            feats_str = ", ".join(f'"{str(f).replace(chr(34), chr(39))}"' for f in feats)
            parts.append(f'      {{ name: "{n}", price: "{p}", features: [{feats_str}] }}')
        lines.append('    pricingTiers: [\n' + ',\n'.join(parts) + '\n    ],')

    # similarTools
    similar_tools = tool.get("similarTools", [])
    if similar_tools:
        parts = []
        for st in similar_tools:
            n = str(st.get("name", "")).replace('"', "'")
            s = str(st.get("slug", "")).replace('"', "'")
            parts.append(f'      {{ name: "{n}", slug: "{s}" }}')
        lines.append('    similarTools: [\n' + ',\n'.join(parts) + '\n    ],')

    lines.append("  },")
    return lines


def append_to_typescript(new_tools: list[dict]) -> None:
    """Splice new tool entries before the closing ]; in the existing TS file."""
    content = OUTPUT_TS.read_text(encoding="utf-8")
    close_idx = content.rfind("];")
    if close_idx == -1:
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
    force = "--force" in sys.argv

    csv_path = Path(__file__).parent / "keywords.csv"
    if not csv_path.exists():
        print(f"ERROR: keywords.csv not found at {csv_path}")
        sys.exit(1)

    tools_list = read_keywords_csv(str(csv_path))
    print(f"📋 Loaded {len(tools_list)} tools from keywords.csv")

    # --force: wipe existing output and regenerate everything
    if force and OUTPUT_TS.exists():
        OUTPUT_TS.unlink()
        print("🗑  --force: deleted existing generated_data.ts, will regenerate all tools")

    # Load existing generated data to support incremental runs
    if OUTPUT_TS.exists():
        print(f"📂 Output file exists — will skip already-generated tools")
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
