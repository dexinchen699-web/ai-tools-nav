"""
第二轮诊断：测试真正可用的图片模型
py test_image_api2.py
"""
import httpx, json, base64, os

BASE_URL  = "https://aiapi.tnt-pub.com/v1"
IMAGE_KEY = "sk-QWuU4bC84uKen1Ywb5uvTnq3FTveZzZaBLEH1gsq7hSwXHxq"
TEXT_KEY  = "sk-nWpOUalAELM3VyCRTmcrXP6mQkJldU4QcRphAm429ubpO1kY"

H_IMG  = {"Authorization": f"Bearer {IMAGE_KEY}", "Content-Type": "application/json"}
H_TEXT = {"Authorization": f"Bearer {TEXT_KEY}",  "Content-Type": "application/json"}

SIMPLE = "a simple blue circle on white background"

# ── 1. 测试 gemini-2.5-flash-image（images/generations 接口）──────
print("=" * 60)
print("1. gemini-2.5-flash-image — images/generations")
for key_name, headers in [("image_key", H_IMG), ("text_key", H_TEXT)]:
    payload = {"model": "gemini-2.5-flash-image", "prompt": SIMPLE, "n": 1, "size": "1024x1024"}
    try:
        r = httpx.post(f"{BASE_URL}/images/generations", headers=headers, json=payload, timeout=60)
        body = r.json()
        if r.status_code == 200 and body.get("data"):
            item = body["data"][0]
            print(f"   [{key_name}] ✅ url={item.get('url')} b64_len={len(item.get('b64_json') or '')}")
        else:
            print(f"   [{key_name}] ❌ {r.status_code} — {str(body)[:200]}")
    except Exception as e:
        print(f"   [{key_name}] ❌ Exception: {e}")

# ── 2. 测试 gemini-3.1-flash-image（text key 的模型列表里有它）────
print()
print("2. gemini-3.1-flash-image — images/generations")
for key_name, headers in [("image_key", H_IMG), ("text_key", H_TEXT)]:
    payload = {"model": "gemini-3.1-flash-image", "prompt": SIMPLE, "n": 1, "size": "1024x1024"}
    try:
        r = httpx.post(f"{BASE_URL}/images/generations", headers=headers, json=payload, timeout=60)
        body = r.json()
        if r.status_code == 200 and body.get("data"):
            item = body["data"][0]
            print(f"   [{key_name}] ✅ url={item.get('url')} b64_len={len(item.get('b64_json') or '')}")
        else:
            print(f"   [{key_name}] ❌ {r.status_code} — {str(body)[:200]}")
    except Exception as e:
        print(f"   [{key_name}] ❌ Exception: {e}")

# ── 3. doubao-image via chat completions（有些代理走这个接口）──────
print()
print("3. doubao-image — chat/completions（看是否返回图片）")
payload = {
    "model": "doubao-image",
    "messages": [{"role": "user", "content": SIMPLE}],
}
try:
    r = httpx.post(f"{BASE_URL}/chat/completions", headers=H_IMG, json=payload, timeout=60)
    body = r.json()
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        content = body.get("choices", [{}])[0].get("message", {}).get("content", "")
        print(f"   Content type: {type(content)}")
        print(f"   Content preview: {str(content)[:300]}")
    else:
        print(f"   Error: {str(body)[:300]}")
except Exception as e:
    print(f"   Exception: {e}")

# ── 4. gemini-2.5-flash-image via chat completions ───────────────
print()
print("4. gemini-2.5-flash-image — chat/completions")
payload = {
    "model": "gemini-2.5-flash-image",
    "messages": [{"role": "user", "content": f"Generate an image: {SIMPLE}"}],
}
try:
    r = httpx.post(f"{BASE_URL}/chat/completions", headers=H_IMG, json=payload, timeout=60)
    body = r.json()
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        content = body.get("choices", [{}])[0].get("message", {}).get("content", "")
        print(f"   Content type: {type(content)}")
        if isinstance(content, list):
            for part in content:
                ptype = part.get("type")
                if ptype == "image_url":
                    url = part.get("image_url", {}).get("url", "")
                    is_b64 = url.startswith("data:")
                    print(f"   ✅ image_url part found, is_base64={is_b64}, len={len(url)}")
                else:
                    print(f"   Part type: {ptype} — {str(part)[:100]}")
        else:
            print(f"   Content preview: {str(content)[:300]}")
    else:
        print(f"   Error: {str(body)[:300]}")
except Exception as e:
    print(f"   Exception: {e}")

# ── 5. 原始 doubao-image 完整响应 dump ───────────────────────────
print()
print("5. doubao-image images/generations — 完整原始响应")
payload = {"model": "doubao-image", "prompt": SIMPLE, "n": 1, "size": "1024x1024"}
try:
    r = httpx.post(f"{BASE_URL}/images/generations", headers=H_IMG, json=payload, timeout=60)
    print(f"   Status: {r.status_code}")
    print(f"   Raw body: {r.text[:1000]}")
except Exception as e:
    print(f"   Exception: {e}")

print()
print("Done.")
