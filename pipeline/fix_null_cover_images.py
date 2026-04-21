#!/usr/bin/env python3
"""
Fix NULL cover_image_url entries in Supabase by mapping known image files to slugs.
Also fixes article #43 wrong-domain URL.
"""

import json
import sys
import urllib.request
from pathlib import Path

BASE_URL = "https://ai-tools-nav-two.vercel.app/images/articles/"

ENV_FILE = Path(__file__).parent.parent / ".env.local"

# slug -> image filename
SLUG_TO_IMAGE = {
    "agent-architecture-deep-dive":          "10_img1_components.jpg",
    "single-agent-vs-mas":                   "12_img1_single_agent.jpg",
    "rag-explained":                         "16_img1_ai-hallucination.jpg",
    "ai-agent-workplace-revolution":         "17_img1_ai-agent-work-transformation.jpg",
    "langgraph-tutorial":                    "20_img1_langgraph-cover.jpg",
    "ai-token-explained":                    "21_img1_token-cover.jpg",
    "n8n-enterprise-workflow":               "22_img1_n8n-enterprise-cover.jpg",
    "deerflow2-architecture-deep-dive":      "24_img1_deerflow_multiagent.jpg",
    "gemma4-open-source-explained":          "25_img1_gemma4_hero.jpg",
    "claude-mythos-leak-explained":          "26_img1_claude-mythos-cover.jpg",
    "nemoclaw-tutorial":                     "27_img1_nemoclaw-cover.jpg",
    "transformers-js-v4-explained":          "28_img1_transformers-js-cover.jpg",
    "gpt54-tutorial":                        "29_img1_gpt54-cover.jpg",
    "llama4-tutorial":                       "30_img1_llama4_cover.jpg",
    "rogue-ai-agent-security":               "32_img1_rogue-ai-agent-hacking.jpg",
    "ai-agent-real-jobs-replaced":           "33_img1_ai-agent-workplace.jpg",
    "ai-agent-cost-breakdown":               "34_img1_agent-cost-dashboard.jpg",
    "qwen3-popular-science":                 "35_img1_qwen3-hero.jpg",
    "gemini-cli-tutorial":                   "36_img1_gemini-cli-header.jpg",
    "deepseek-v4-huawei-explained":          "37_img1_deepseek-v4-header.jpg",
    "ai-peer-preservation-explained":        "38_img1_ai-peer-preservation.jpg",
    "mcp-protocol-why-it-won":              "39_img1_mcp-protocol-connection.jpg",
    "kimi-tutorial":                         "40_img1_kimi-tutorial-cover.jpg",
    "glm-51-tutorial":                       "41_img1_glm51-tutorial-cover.jpg",
    "chatgpt-shopping-acp":                  "42_img1_chatgpt-shopping.jpg",
    "qwen36plus-tutorial":                   "43_img1_qwen36plus.jpg",
    "google-turboquant-kv-cache-compression-explained": "cover_15.jpg",
}

def load_env(filepath):
    result = {}
    try:
        text = filepath.read_text(encoding="utf-8", errors="ignore")
    except FileNotFoundError:
        return result
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        result[k.strip()] = v.strip().strip('"')
    return result

def rest(method, path, body=None):
    env = load_env(ENV_FILE)
    url = env.get("NEXT_PUBLIC_SUPABASE_URL", "").rstrip("/") + "/rest/v1/" + path
    key = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read()), r.status
    except urllib.error.HTTPError as e:
        return json.loads(e.read()), e.code

def main():
    rows, status = rest("GET", "articles?select=slug,cover_image_url&limit=200")
    if not isinstance(rows, list):
        print("FAIL query: " + str(rows))
        sys.exit(1)

    updated = 0
    skipped = 0
    no_mapping = []

    for row in rows:
        slug = row.get("slug", "")
        current_url = row.get("cover_image_url") or ""

        if slug not in SLUG_TO_IMAGE:
            skipped += 1
            no_mapping.append(slug)
            continue

        new_url = BASE_URL + SLUG_TO_IMAGE[slug]

        # Skip if already correct
        if current_url == new_url:
            skipped += 1
            continue

        result, patch_status = rest("PATCH", "articles?slug=eq." + slug, {"cover_image_url": new_url})
        if patch_status in (200, 204):
            print("OK " + slug + " -> " + SLUG_TO_IMAGE[slug])
            updated += 1
        else:
            print("FAIL " + slug + " HTTP " + str(patch_status) + ": " + str(result))

    print("\nDone: " + str(updated) + " updated, " + str(skipped) + " skipped")
    if no_mapping:
        print("No mapping for: " + ", ".join(no_mapping))

if __name__ == "__main__":
    main()
