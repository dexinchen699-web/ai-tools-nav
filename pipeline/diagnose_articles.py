#!/usr/bin/env python3
"""
诊断 articles 表状态，并强制 UPDATE is_published=true
用法: py pipeline/diagnose_articles.py
"""
import json, urllib.request, sys
from pathlib import Path
from dotenv import dotenv_values

ENV_FILE = Path(__file__).parent.parent / ".env.local"
env = dotenv_values(ENV_FILE)

SUPABASE_URL = env.get("NEXT_PUBLIC_SUPABASE_URL", "").rstrip("/")
SERVICE_KEY  = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
ANON_KEY     = env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")

if not SUPABASE_URL or not SERVICE_KEY:
    print("❌ 缺少 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY，请检查 .env.local")
    sys.exit(1)

def rest(method, path, key, body=None):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
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

# ── 1. service role 查全部（前5条）
rows, status = rest("GET", "articles?select=slug,is_published&limit=5", SERVICE_KEY)
print(f"\n[service_role] 全部（前5条）— HTTP {status}")
if isinstance(rows, list):
    for r in rows:
        print(f"  slug={r.get('slug'):<40} is_published={r.get('is_published')}")
else:
    print(f"  响应: {rows}")

# ── 2. service role 查 is_published=true
rows2, status2 = rest("GET", "articles?select=slug,is_published&is_published=eq.true&limit=5", SERVICE_KEY)
print(f"\n[service_role] is_published=true — HTTP {status2}，共 {len(rows2) if isinstance(rows2, list) else '?'} 条")

# ── 3. anon key 查 is_published=true
if ANON_KEY:
    rows3, status3 = rest("GET", "articles?select=slug,is_published&is_published=eq.true&limit=5", ANON_KEY)
    print(f"\n[anon_key]     is_published=true — HTTP {status3}，共 {len(rows3) if isinstance(rows3, list) else '?'} 条")
    if isinstance(rows3, dict):
        print(f"  错误详情: {rows3}")
else:
    print("\n[anon_key] 未配置，跳过")

# ── 4. 强制 PATCH 所有行 is_published=true（service role 绕过 RLS）
print("\n--- 执行 PATCH: 所有行 is_published=true ---")
updated, patch_status = rest("PATCH", "articles", SERVICE_KEY, {"is_published": True})
if isinstance(updated, list):
    print(f"✅ 更新成功，影响 {len(updated)} 行 (HTTP {patch_status})")
else:
    print(f"⚠️  HTTP {patch_status}: {updated}")

# ── 5. 再次用 anon key 验证
if ANON_KEY:
    rows4, status4 = rest("GET", "articles?select=slug,is_published&is_published=eq.true&limit=5", ANON_KEY)
    print(f"\n[PATCH后 anon] is_published=true — HTTP {status4}，共 {len(rows4) if isinstance(rows4, list) else '?'} 条")
    if isinstance(rows4, dict):
        print(f"  错误详情（可能是 RLS 问题）: {rows4}")
    elif isinstance(rows4, list) and len(rows4) == 0:
        print("  ⚠️  anon key 仍返回 0 条 → RLS 策略阻止了匿名读取！")
        print("  → 需要在 Supabase Dashboard 为 articles 表添加 SELECT policy")
    else:
        print("  ✅ anon key 可以正常读取文章")

print("\n诊断完成。")
