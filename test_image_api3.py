"""
测试新 image key + gemini-3-pro-image-preview
py test_image_api3.py
"""
import httpx

BASE_URL  = "https://aiapi.tnt-pub.com/v1"
NEW_KEY   = "sk-0ZK3T37jZRDhDpGFfOX9FD51BalbBBBevxs5K6pFGxdke7l8"
HEADERS   = {"Authorization": f"Bearer {NEW_KEY}", "Content-Type": "application/json"}
PROMPT    = "a simple blue circle on white background"

# ── 1. images/generations 接口 ───────────────────────────────────
print("=" * 60)
print("1. gemini-3-pro-image-preview — images/generations")
payload = {"model": "gemini-3-pro-image-preview", "prompt": PROMPT, "n": 1, "size": "1024x1024"}
try:
    r = httpx.post(f"{BASE_URL}/images/generations", headers=HEADERS, json=payload, timeout=90)
    print(f"   Status: {r.status_code}")
    body = r.json()
    if r.status_code == 200 and body.get("data"):
        item = body["data"][0]
        url = item.get("url") or ""
        b64 = item.get("b64_json") or ""
        err = item.get("error")
        print(f"   url={'✅ ' + url[:80] if url else '❌ empty'}")
        print(f"   b64_len={len(b64)}")
        if err:
            print(f"   error={err}")
    else:
        print(f"   Raw: {r.text[:400]}")
except Exception as e:
    print(f"   Exception: {e}")

# ── 2. chat/completions 接口 ─────────────────────────────────────
print()
print("2. gemini-3-pro-image-preview — chat/completions")
payload = {
    "model": "gemini-3-pro-image-preview",
    "messages": [{"role": "user", "content": f"Generate an image: {PROMPT}"}],
}
try:
    r = httpx.post(f"{BASE_URL}/chat/completions", headers=HEADERS, json=payload, timeout=90)
    print(f"   Status: {r.status_code}")
    body = r.json()
    if r.status_code == 200:
        content = body.get("choices", [{}])[0].get("message", {}).get("content", "")
        if isinstance(content, list):
            for part in content:
                ptype = part.get("type")
                if ptype == "image_url":
                    url = part.get("image_url", {}).get("url", "")
                    print(f"   ✅ image_url part, is_base64={url.startswith('data:')}, len={len(url)}")
                else:
                    print(f"   text part: {str(part)[:100]}")
        else:
            print(f"   Content preview: {str(content)[:300]}")
    else:
        print(f"   Error: {r.text[:400]}")
except Exception as e:
    print(f"   Exception: {e}")

# ── 3. 顺便确认新 key 的模型列表 ─────────────────────────────────
print()
print("3. 新 key 可用模型列表")
try:
    r = httpx.get(f"{BASE_URL}/models", headers=HEADERS, timeout=30)
    body = r.json()
    models = [m["id"] for m in body.get("data", [])]
    print(f"   共 {len(models)} 个模型:")
    for m in models:
        print(f"     - {m}")
except Exception as e:
    print(f"   Exception: {e}")

print()
print("Done.")
