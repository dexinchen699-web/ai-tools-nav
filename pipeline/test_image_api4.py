# -*- coding: utf-8 -*-
"""
测试新 key 上的图片模型：doubao-image 和 gemini-2.5-flash-image
"""
import base64, json, os
from openai import OpenAI

API_KEY  = "sk-0ZK3T37jZRDhDpGFfOX9FD51BalbBBBevxs5K6pFGxdke7l8"
BASE_URL = "https://aiapi.tnt-pub.com/v1"
PROMPT   = "A modern flat design icon for an AI tool, vibrant gradient background, clean white icon in center, professional tech style, 512x512."

client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

def test_images_generate(model: str):
    print(f"\n{'='*50}")
    print(f"[images/generations] model={model}")
    try:
        resp = client.images.generate(
            model=model,
            prompt=PROMPT,
            n=1,
            size="512x512",
        )
        item = resp.data[0]
        raw  = item.model_dump() if hasattr(item, "model_dump") else vars(item)
        print(f"  Keys: {list(raw.keys())}")

        # 尝试保存
        b64 = raw.get("b64_json")
        url = raw.get("url")
        if b64:
            fname = f"test_{model.replace('/', '_')}_gen.png"
            with open(fname, "wb") as f:
                f.write(base64.b64decode(b64))
            print(f"  [OK] Saved b64 -> {fname}")
        elif url:
            import httpx
            r = httpx.get(url, timeout=30)
            fname = f"test_{model.replace('/', '_')}_gen.png"
            with open(fname, "wb") as f:
                f.write(r.content)
            print(f"  [OK] Saved url -> {fname}")
        else:
            print(f"  [WARN] No image data. Full response: {raw}")
    except Exception as e:
        print(f"  [ERROR] {e}")

def test_chat_completions(model: str):
    print(f"\n{'='*50}")
    print(f"[chat/completions] model={model}")
    try:
        resp = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": PROMPT}],
            max_tokens=512,
        )
        msg = resp.choices[0].message
        print(f"  content type : {type(msg.content)}")
        print(f"  content[:200]: {str(msg.content)[:200]}")

        # 检查是否有图片 URL 嵌在 content 里
        content = msg.content or ""
        if "http" in content:
            import re, httpx
            urls = re.findall(r'https?://\S+', content)
            for u in urls[:1]:
                r = httpx.get(u.rstrip('")'), timeout=30)
                fname = f"test_{model.replace('/', '_')}_chat.png"
                with open(fname, "wb") as f:
                    f.write(r.content)
                print(f"  [OK] Saved url from content -> {fname}")
    except Exception as e:
        print(f"  [ERROR] {e}")

if __name__ == "__main__":
    for model in ["doubao-image", "gemini-2.5-flash-image"]:
        test_images_generate(model)
        test_chat_completions(model)

    print("\nDone.")
