"""
诊断脚本：测试 aiapi.tnt-pub.com 图片生成 API
用法：py test_image_api.py
"""
import httpx
import json

BASE_URL = "https://aiapi.tnt-pub.com/v1"
IMAGE_KEY = "sk-QWuU4bC84uKen1Ywb5uvTnq3FTveZzZaBLEH1gsq7hSwXHxq"
TEXT_KEY  = "sk-nWpOUalAELM3VyCRTmcrXP6mQkJldU4QcRphAm429ubpO1kY"

HEADERS_IMG  = {"Authorization": f"Bearer {IMAGE_KEY}", "Content-Type": "application/json"}
HEADERS_TEXT = {"Authorization": f"Bearer {TEXT_KEY}",  "Content-Type": "application/json"}

# ── 1. 列出可用模型 ──────────────────────────────────────────────
print("=" * 60)
print("1. 列出可用模型（image key）")
try:
    r = httpx.get(f"{BASE_URL}/models", headers=HEADERS_IMG, timeout=15)
    print(f"   Status: {r.status_code}")
    data = r.json()
    models = [m.get("id") for m in data.get("data", [])]
    print(f"   Models: {json.dumps(models, ensure_ascii=False, indent=2)}")
except Exception as e:
    print(f"   Error: {e}")

print()
print("2. 列出可用模型（text key）")
try:
    r = httpx.get(f"{BASE_URL}/models", headers=HEADERS_TEXT, timeout=15)
    print(f"   Status: {r.status_code}")
    data = r.json()
    models = [m.get("id") for m in data.get("data", [])]
    print(f"   Models: {json.dumps(models, ensure_ascii=False, indent=2)}")
except Exception as e:
    print(f"   Error: {e}")

# ── 2. 测试几个常见图片模型名 ────────────────────────────────────
CANDIDATE_MODELS = [
    "doubao-image",
    "doubao-seedream-3-0",
    "doubao-seedream-4-0",
    "seedream-3-0",
    "dall-e-3",
    "dall-e-2",
    "flux",
    "flux-pro",
    "flux-schnell",
    "stable-diffusion-3",
    "sd3",
]

SIMPLE_PROMPT = "a simple blue circle on white background"

print()
print("=" * 60)
print("3. 逐一测试候选图片模型")
for model in CANDIDATE_MODELS:
    payload = {
        "model": model,
        "prompt": SIMPLE_PROMPT,
        "n": 1,
        "size": "512x512",
    }
    try:
        r = httpx.post(
            f"{BASE_URL}/images/generations",
            headers=HEADERS_IMG,
            json=payload,
            timeout=30,
        )
        body = r.json()
        if r.status_code == 200 and body.get("data"):
            item = body["data"][0]
            has_url = bool(item.get("url"))
            has_b64 = bool(item.get("b64_json"))
            print(f"   ✅ {model:35s} url={has_url} b64={has_b64}")
        else:
            err = body.get("error", body)
            print(f"   ❌ {model:35s} {r.status_code} — {err}")
    except Exception as e:
        print(f"   ❌ {model:35s} Exception: {e}")

# ── 3. 用 text key 也试一次 doubao-image ─────────────────────────
print()
print("=" * 60)
print("4. 用 text key 测试 doubao-image（排查 key 权限问题）")
payload = {"model": "doubao-image", "prompt": SIMPLE_PROMPT, "n": 1, "size": "512x512"}
try:
    r = httpx.post(f"{BASE_URL}/images/generations", headers=HEADERS_TEXT, json=payload, timeout=30)
    print(f"   Status: {r.status_code}")
    print(f"   Body:   {r.text[:500]}")
except Exception as e:
    print(f"   Error: {e}")

print()
print("Done.")
