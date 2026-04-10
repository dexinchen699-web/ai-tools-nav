# -*- coding: utf-8 -*-
"""Quick smoke test: text + image generation for one tool."""
import sys
sys.path.insert(0, __file__.rsplit("/", 1)[0])

from content_pipeline import generate_text_content, generate_tool_image

tool_name = "ChatGPT"
tool_info = {
    "category": "AI对话",
    "keywords": "聊天机器人 GPT 对话AI",
    "description": "",
}

print("=" * 50)
print("TEST: Text generation")
print("=" * 50)
try:
    content = generate_text_content(tool_name, tool_info)
    slug = content.get("slug", "chatgpt")
    print(f"  slug:        {content.get('slug')}")
    print(f"  title:       {content.get('title')}")
    print(f"  heroTitle:   {content.get('heroTitle')}")
    print(f"  rating:      {content.get('rating')}")
    print(f"  features[0]: {content.get('features', [''])[0]}")
    print("  [PASS] Text generation OK\n")
except Exception as e:
    print(f"  [FAIL] Text generation error: {e}\n")
    slug = "chatgpt"

print("=" * 50)
print("TEST: Image generation")
print("=" * 50)
try:
    img_url = generate_tool_image(tool_name, slug, "AI对话")
    print(f"  imageUrl: {img_url}")
    if img_url != "/images/tools/placeholder.png":
        print("  [PASS] Image generation OK")
    else:
        print("  [WARN] Fell back to placeholder — check API key / model")
except Exception as e:
    print(f"  [FAIL] Image generation error: {e}")
