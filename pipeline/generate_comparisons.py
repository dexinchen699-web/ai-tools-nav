# -*- coding: utf-8 -*-
"""
generate_comparisons.py
-----------------------
批量为 COMPARISONS 列表中 description/verdict 为空的条目生成内容，
并 upsert 到 Supabase pages 表（前端 getAllComparisons() 读取的表）。

使用方式（PowerShell）：
  $env:OPENAI_API_KEY="sk-proj-..."
  $env:SUPABASE_URL="https://jlyossykquvtgsgzoedz.supabase.co"
  $env:SUPABASE_SERVICE_KEY="eyJ..."
  py pipeline/generate_comparisons.py

依赖：
  py -m pip install openai supabase
"""

import os
import sys
import time
import json
import re
import httpx
from openai import OpenAI

# ── Config ────────────────────────────────────────────────────────────────────
OPENAI_API_KEY    = os.environ.get("OPENAI_API_KEY", "")
SUPABASE_URL      = os.environ.get("SUPABASE_URL", "https://jlyossykquvtgsgzoedz.supabase.co")
SUPABASE_KEY      = os.environ.get("SUPABASE_SERVICE_KEY", "")

# 使用代理 + claude，或直接用 OpenAI GPT-4o-mini
# 如果有代理 key 就走代理，否则走 OpenAI
PROXY_BASE_URL    = "https://aiapi.tnt-pub.com/v1"
PROXY_API_KEY     = "sk-vw7nwidIvtBs8CSs6mJZUw3SyvGWxJneJ6cpjD9BB4noBcV7"
USE_PROXY         = True   # 改为 False 则使用 OPENAI_API_KEY + gpt-4o-mini

TEXT_MODEL        = "claude-sonnet-4-6" if USE_PROXY else "gpt-4o-mini"
DELAY_SECONDS     = 1.5    # 每次请求间隔，避免限速

# ── 所有需要生成的 comparisons（id 6-39，description 为空的）────────────────
COMPARISONS = [
  { "id": "6",  "slug": "replit-vs-cursor",                "toolA": "Replit",            "toolB": "Cursor",            "title": "Replit vs Cursor：在线IDE与本地AI编辑器对比" },
  { "id": "7",  "slug": "whisper-vs-assemblyai",           "toolA": "Whisper",           "toolB": "AssemblyAI",        "title": "Whisper vs AssemblyAI：AI语音转文字对比" },
  { "id": "8",  "slug": "chatgpt-vs-github-copilot",       "toolA": "ChatGPT",           "toolB": "GitHub Copilot",    "title": "ChatGPT vs GitHub Copilot：AI编程助手对比" },
  { "id": "9",  "slug": "heygen-vs-synthesia",             "toolA": "HeyGen",            "toolB": "Synthesia",         "title": "HeyGen vs Synthesia：AI数字人视频对比" },
  { "id": "10", "slug": "cursor-vs-windsurf",              "toolA": "Cursor",            "toolB": "Windsurf",          "title": "Cursor vs Windsurf：AI代码编辑器对比" },
  { "id": "11", "slug": "elevenlabs-vs-murf",              "toolA": "ElevenLabs",        "toolB": "Murf",              "title": "ElevenLabs vs Murf：AI语音合成工具对比" },
  { "id": "12", "slug": "github-copilot-vs-tabnine",       "toolA": "GitHub Copilot",    "toolB": "Tabnine",           "title": "GitHub Copilot vs Tabnine：AI代码补全对比" },
  { "id": "13", "slug": "sora-vs-runway",                  "toolA": "Sora",              "toolB": "Runway",            "title": "Sora vs Runway：AI视频生成工具对比" },
  { "id": "14", "slug": "github-copilot-vs-cursor",        "toolA": "GitHub Copilot",    "toolB": "Cursor",            "title": "GitHub Copilot vs Cursor：AI编程工具对比" },
  { "id": "15", "slug": "runway-vs-pika",                  "toolA": "Runway",            "toolB": "Pika",              "title": "Runway vs Pika：AI视频创作工具对比" },
  { "id": "16", "slug": "leonardo-vs-midjourney",          "toolA": "Leonardo AI",       "toolB": "Midjourney",        "title": "Leonardo AI vs Midjourney：AI绘图工具对比" },
  { "id": "17", "slug": "notion-ai-vs-copilot",            "toolA": "Notion AI",         "toolB": "GitHub Copilot",    "title": "Notion AI vs Copilot：AI写作与编程助手对比" },
  { "id": "18", "slug": "midjourney-vs-firefly",           "toolA": "Midjourney",        "toolB": "Adobe Firefly",     "title": "Midjourney vs Adobe Firefly：AI绘图工具对比" },
  { "id": "19", "slug": "stable-diffusion-vs-dalle3",      "toolA": "Stable Diffusion",  "toolB": "DALL-E 3",          "title": "Stable Diffusion vs DALL-E 3：AI图像生成对比" },
  { "id": "20", "slug": "grammarly-vs-chatgpt",            "toolA": "Grammarly",         "toolB": "ChatGPT",           "title": "Grammarly vs ChatGPT：AI写作辅助工具对比" },
  { "id": "21", "slug": "copy-ai-vs-jasper",               "toolA": "Copy.ai",           "toolB": "Jasper",            "title": "Copy.ai vs Jasper：AI营销文案工具对比" },
  { "id": "22", "slug": "midjourney-vs-dalle3",            "toolA": "Midjourney",        "toolB": "DALL-E 3",          "title": "Midjourney vs DALL-E 3：AI图像生成对比" },
  { "id": "23", "slug": "jasper-vs-chatgpt",               "toolA": "Jasper",            "toolB": "ChatGPT",           "title": "Jasper vs ChatGPT：AI内容创作工具对比" },
  { "id": "24", "slug": "notion-ai-vs-chatgpt",            "toolA": "Notion AI",         "toolB": "ChatGPT",           "title": "Notion AI vs ChatGPT：AI效率工具对比" },
  { "id": "25", "slug": "claude-vs-gpt4",                  "toolA": "Claude",            "toolB": "GPT-4",             "title": "Claude vs GPT-4：顶级AI大模型深度对比" },
  { "id": "26", "slug": "chatgpt-vs-grok",                 "toolA": "ChatGPT",           "toolB": "Grok",              "title": "ChatGPT vs Grok：OpenAI与xAI的AI助手对比" },
  { "id": "27", "slug": "claude-vs-gemini",                "toolA": "Claude",            "toolB": "Gemini",            "title": "Claude vs Gemini：Anthropic与Google AI对比" },
  { "id": "28", "slug": "chatgpt-vs-gemini",               "toolA": "ChatGPT",           "toolB": "Gemini",            "title": "ChatGPT vs Gemini：OpenAI与Google AI助手对比" },
  { "id": "29", "slug": "suno-vs-mubert",                  "toolA": "Suno",              "toolB": "Mubert",            "title": "Suno vs Mubert：AI音乐生成工具对比" },
  { "id": "30", "slug": "suno-vs-udio",                    "toolA": "Suno",              "toolB": "Udio",              "title": "Suno vs Udio：AI音乐创作平台对比" },
  { "id": "31", "slug": "bolt-vs-cursor",                  "toolA": "Bolt",              "toolB": "Cursor",            "title": "Bolt vs Cursor：AI全栈开发工具对比" },
  { "id": "32", "slug": "cursor-vs-chatgpt",               "toolA": "Cursor",            "toolB": "ChatGPT",           "title": "Cursor vs ChatGPT：AI编程专用 vs 通用助手对比" },
  { "id": "33", "slug": "github-copilot-vs-chatgpt",       "toolA": "GitHub Copilot",    "toolB": "ChatGPT",           "title": "GitHub Copilot vs ChatGPT：AI编程助手对比" },
  { "id": "34", "slug": "chatgpt-vs-jasper",               "toolA": "ChatGPT",           "toolB": "Jasper",            "title": "ChatGPT vs Jasper：AI写作工具对比" },
  { "id": "35", "slug": "notion-vs-obsidian",              "toolA": "Notion",            "toolB": "Obsidian",          "title": "Notion vs Obsidian：AI笔记与知识管理工具对比" },
  { "id": "36", "slug": "stable-diffusion-vs-flux",        "toolA": "Stable Diffusion",  "toolB": "Flux",              "title": "Stable Diffusion vs Flux：开源AI图像生成对比" },
  { "id": "37", "slug": "midjourney-vs-ideogram",          "toolA": "Midjourney",        "toolB": "Ideogram",          "title": "Midjourney vs Ideogram：AI图像生成工具对比" },
  { "id": "38", "slug": "midjourney-vs-dall-e",            "toolA": "Midjourney",        "toolB": "DALL-E",            "title": "Midjourney vs DALL-E：AI绘图工具终极对比" },
  { "id": "39", "slug": "gemini-vs-deepseek",              "toolA": "Gemini",            "toolB": "DeepSeek",          "title": "Gemini vs DeepSeek：Google与国产AI大模型对比" },
]

SYSTEM_PROMPT = """你是一位专业的AI工具评测专家，为中文用户撰写AI工具对比文章。
你的文章面向中国用户，语言简洁专业，重点突出实用价值。"""

def build_meta_prompt(toolA: str, toolB: str, title: str) -> str:
    """第一次请求：只生成 summary / description / verdict，纯 JSON，无 Markdown。"""
    return f"""请为以下AI工具对比页面生成三个字段，严格输出 JSON，不要有任何其他文字：

工具A：{toolA}
工具B：{toolB}
页面标题：{title}

输出格式（所有字段必须是中文，字段值内部不得使用双引号字符）：
{{
  "summary": "一句话总结两个工具的核心差异，50字以内",
  "description": "SEO描述，说明本文对比了哪些维度，帮助用户做出选择，80-120字",
  "verdict": "最终推荐结论，分别说明什么情况下选A、什么情况下选B，100-150字"
}}

只输出 JSON，不要 markdown 代码块，不要任何解释。"""


def build_content_prompt(toolA: str, toolB: str, title: str) -> str:
    """第二次请求：只生成 content_md，纯 Markdown 文本，不包在 JSON 里。"""
    return f"""请为以下AI工具对比页面撰写一篇完整的 Markdown 对比文章：

工具A：{toolA}
工具B：{toolB}
页面标题：{title}

文章要求：
1. 简介段落（2-3句）
2. 核心功能对比表格（至少4个维度，使用 Markdown 表格语法）
3. 各自优势分析
4. 适用场景建议
5. 价格对比（如适用）
总字数 600-900 字，全部中文。

直接输出 Markdown 内容，不要 JSON，不要代码块包裹。"""


def extract_json(raw: str) -> dict:
    """从 LLM 响应中提取 JSON，带多级容错。"""
    # 1. 剥掉 markdown 代码块
    text = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.MULTILINE)
    text = re.sub(r"\s*```\s*$", "", text.strip(), flags=re.MULTILINE)
    text = text.strip()

    # 2. 找到第一个 {
    start = text.find("{")
    if start == -1:
        raise ValueError(f"No JSON object found in response: {text[:200]}")
    text = text[start:]

    # 3. 直接尝试解析
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # 4. 逐字符重建：在 JSON 字符串值内部，把裸控制字符转义
    def sanitize_json_string(s: str) -> str:
        result = []
        in_string = False
        escape_next = False
        for ch in s:
            if escape_next:
                result.append(ch)
                escape_next = False
                continue
            if ch == "\\" and in_string:
                result.append(ch)
                escape_next = True
                continue
            if ch == '"':
                in_string = not in_string
                result.append(ch)
                continue
            if in_string:
                # 裸控制字符 → 转义
                if ch == "\n":
                    result.append("\\n")
                elif ch == "\r":
                    result.append("\\r")
                elif ch == "\t":
                    result.append("\\t")
                elif ord(ch) < 0x20:
                    result.append(f"\\u{ord(ch):04x}")
                else:
                    result.append(ch)
            else:
                result.append(ch)
        return "".join(result)

    fixed = sanitize_json_string(text)
    try:
        return json.loads(fixed)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"JSON parse failed after fix attempt: {e}\n"
            f"Raw (first 300): {raw[:300]}"
        )


def generate_content(client: OpenAI, toolA: str, toolB: str, title: str) -> dict:
    """两次请求：第一次拿 JSON meta，第二次拿纯 Markdown content_md。"""
    # ── 第一次：JSON 元数据 ──────────────────────────────────────────────────
    resp1 = client.chat.completions.create(
        model=TEXT_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": build_meta_prompt(toolA, toolB, title)},
        ],
        temperature=0.5,
        max_tokens=600,
    )
    meta = extract_json(resp1.choices[0].message.content or "")

    # ── 第二次：纯 Markdown 正文 ─────────────────────────────────────────────
    resp2 = client.chat.completions.create(
        model=TEXT_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": build_content_prompt(toolA, toolB, title)},
        ],
        temperature=0.7,
        max_tokens=2000,
    )
    content_md = (resp2.choices[0].message.content or "").strip()

    meta["content_md"] = content_md
    return meta


def upsert_page(comp: dict, content: dict) -> None:
    """将生成的内容 upsert 到 pages 表（直接调 Supabase REST API）。"""
    row = {
        "slug":             comp["slug"],
        "page_type":        "comparison",
        "primary_keyword":  comp["title"],
        "title":            comp["title"],
        "summary":          content.get("summary", ""),
        "meta_description": content.get("description", ""),
        "content_md":       content.get("content_md", ""),
        "verdict":          content.get("verdict", ""),
    }
    url = f"{SUPABASE_URL}/rest/v1/pages?on_conflict=slug"
    headers = {
        "apikey":        SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type":  "application/json",
        "Prefer":        "resolution=merge-duplicates,return=minimal",
    }
    resp = httpx.post(url, json=row, headers=headers, timeout=30)
    if resp.status_code not in (200, 201):
        raise RuntimeError(f"Supabase error {resp.status_code}: {resp.text[:200]}")


def main():
    # ── 检查环境变量 ──────────────────────────────────────────────────────────
    if USE_PROXY:
        api_key = PROXY_API_KEY
        base_url = PROXY_BASE_URL
    else:
        api_key = OPENAI_API_KEY
        base_url = None  # 使用默认 OpenAI endpoint

    if not api_key:
        print("❌ 缺少 API Key。请设置 OPENAI_API_KEY 环境变量，或在脚本中启用 USE_PROXY=True")
        sys.exit(1)

    if not SUPABASE_KEY:
        print("❌ 缺少 SUPABASE_SERVICE_KEY 环境变量")
        print("   请在 Supabase Dashboard → Project Settings → API → service_role 获取")
        sys.exit(1)

    # ── 初始化客户端 ──────────────────────────────────────────────────────────
    client_kwargs = {"api_key": api_key}
    if base_url:
        client_kwargs["base_url"] = base_url
    llm = OpenAI(**client_kwargs)

    print(f"🚀 开始生成 {len(COMPARISONS)} 个 comparison 页面内容")
    print(f"   模型: {TEXT_MODEL}")
    print(f"   Supabase: {SUPABASE_URL}\n")

    success = 0
    failed  = []

    for i, comp in enumerate(COMPARISONS, 1):
        slug  = comp["slug"]
        toolA = comp["toolA"]
        toolB = comp["toolB"]
        title = comp["title"]

        print(f"[{i:02d}/{len(COMPARISONS)}] {slug} ...", end=" ", flush=True)

        try:
            content = generate_content(llm, toolA, toolB, title)
            upsert_page(comp, content)
            print("✅")
            success += 1
        except Exception as e:
            print(f"❌ {e}")
            failed.append({"slug": slug, "error": str(e)})

        if i < len(COMPARISONS):
            time.sleep(DELAY_SECONDS)

    print(f"\n{'='*50}")
    print(f"✅ 成功: {success}/{len(COMPARISONS)}")
    if failed:
        print(f"❌ 失败: {len(failed)}")
        for f in failed:
            print(f"   - {f['slug']}: {f['error']}")
    print("🎉 完成！")


if __name__ == "__main__":
    main()
