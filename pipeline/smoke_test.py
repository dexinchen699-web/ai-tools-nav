# -*- coding: utf-8 -*-
"""
Smoke test - run this directly in your local terminal:
  cd C:/Users/pct/ai-tools-nav/pipeline
  py smoke_test.py
"""
import sys, json, re
from pathlib import Path

# ── install deps if missing ──────────────────────────────────────────────────
import subprocess
for pkg in ["openai"]:
    try:
        __import__(pkg)
    except ImportError:
        print(f"Installing {pkg}...")
        subprocess.run([sys.executable, "-m", "pip", "install", pkg], check=True)

from openai import OpenAI

TEXT_API_KEY   = "sk-vw7nwidIvtBs8CSs6mJZUw3SyvGWxJneJ6cpjD9BB4noBcV7"
PROXY_BASE_URL = "https://aiapi.tnt-pub.com/v1"
TEXT_MODEL     = "claude-sonnet-4-6"

text_client = OpenAI(api_key=TEXT_API_KEY, base_url=PROXY_BASE_URL)

IMAGES_DIR = Path(__file__).parent.parent / "public" / "images" / "tools"

def extract_json(raw: str) -> dict:
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw).strip()
    try:
        return json.loads(raw)
    except Exception:
        pass
    s, e = raw.find("{"), raw.rfind("}")
    if s != -1 and e != -1:
        try:
            return json.loads(raw[s:e+1])
        except Exception:
            pass
    return json.loads(re.sub(r",\s*([}\]])", r"\1", raw))

# ── TEST 1: Text generation ──────────────────────────────────────────────────
print("=" * 50)
print("TEST 1: Text generation (gemini-2.5-flash)")
print("=" * 50)
try:
    resp = text_client.chat.completions.create(
        model=TEXT_MODEL,
        messages=[{"role": "user", "content": 'Return only JSON: {"title":"ChatGPT","slug":"chatgpt","rating":4.5}'}],
        max_tokens=128,
    )
    raw = resp.choices[0].message.content
    print("Raw:", raw[:200])
    data = extract_json(raw)
    print("slug:", data.get("slug"), "| rating:", data.get("rating"))
    print("\n[PASS] Text generation works")
except Exception as e:
    import traceback
    print(f"\n[FAIL] Text generation: {e}")
    traceback.print_exc()

# ── TEST 2: SVG icon generation — DISABLED ───────────────────────────────────
print()
print("TEST 2: SVG icon generation — SKIPPED (disabled)")

print()
print("Done.")
