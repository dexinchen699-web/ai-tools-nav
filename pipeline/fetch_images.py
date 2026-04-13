"""
fetch_images.py — 从工具官网抓取 OG 图片 / favicon，保存到 public/images/tools/{slug}.png
用法：py pipeline/fetch_images.py
依赖：pip install requests beautifulsoup4 Pillow
"""

import os
import re
import sys
import time
import json
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from pathlib import Path

# ── 路径配置 ──────────────────────────────────────────────────────────────────
SCRIPT_DIR   = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
OUTPUT_DIR   = PROJECT_ROOT / "public" / "images" / "tools"
DATA_FILE    = PROJECT_ROOT / "src" / "data" / "generated_data.ts"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── 请求配置 ──────────────────────────────────────────────────────────────────
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}
TIMEOUT   = 12   # 秒
DELAY     = 1.0  # 每次请求间隔（秒）

# ── 从 generated_data.ts 解析工具列表 ─────────────────────────────────────────
def parse_tools(ts_path: Path) -> list[dict]:
    text = ts_path.read_text(encoding="utf-8")
    # 提取所有 slug + website 对
    slugs    = re.findall(r"slug:\s*[`'\"]([^`'\"]+)[`'\"]", text)
    websites = re.findall(r"website:\s*[`'\"]([^`'\"]+)[`'\"]", text)
    tools = []
    for slug, website in zip(slugs, websites):
        tools.append({"slug": slug, "website": website})
    return tools

# ── 抓取 OG image ─────────────────────────────────────────────────────────────
def fetch_og_image(url: str) -> str | None:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT, allow_redirects=True)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        # 优先级：og:image > twitter:image > 第一张大图
        for prop in ["og:image", "twitter:image", "og:image:secure_url"]:
            tag = soup.find("meta", property=prop) or soup.find("meta", attrs={"name": prop})
            if tag and tag.get("content"):
                return urljoin(url, tag["content"])

        # 降级：找 <link rel="apple-touch-icon"> 或 favicon
        for rel in ["apple-touch-icon", "apple-touch-icon-precomposed"]:
            tag = soup.find("link", rel=rel)
            if tag and tag.get("href"):
                return urljoin(url, tag["href"])

        # 最后降级：/favicon.ico
        parsed = urlparse(url)
        return f"{parsed.scheme}://{parsed.netloc}/favicon.ico"

    except Exception as e:
        print(f"    ✗ 抓取页面失败: {e}")
        return None

# ── 下载并保存图片 ─────────────────────────────────────────────────────────────
def download_image(img_url: str, dest: Path) -> bool:
    try:
        resp = requests.get(img_url, headers=HEADERS, timeout=TIMEOUT, stream=True)
        resp.raise_for_status()
        content_type = resp.headers.get("content-type", "")
        # 跳过 SVG（浏览器可用，但 Next.js <Image> 需要尺寸）
        if "svg" in content_type:
            print(f"    ⚠ 跳过 SVG: {img_url}")
            return False
        raw = resp.content
        if len(raw) < 500:
            print(f"    ⚠ 图片太小 ({len(raw)} bytes)，跳过")
            return False

        # 尝试用 Pillow 转换为 PNG（统一格式，过滤损坏文件）
        try:
            from PIL import Image
            import io
            img = Image.open(io.BytesIO(raw))
            # 如果是 favicon 且太小，放大到 256x256
            if img.width < 64 or img.height < 64:
                img = img.resize((256, 256), Image.LANCZOS)
            img.save(dest, "PNG")
        except Exception:
            # Pillow 失败则直接写原始字节
            dest.write_bytes(raw)

        print(f"    ✓ 已保存 → {dest.name}")
        return True
    except Exception as e:
        print(f"    ✗ 下载失败: {e}")
        return False

# ── 更新 generated_data.ts 中的 imageUrl ─────────────────────────────────────
def update_image_urls(ts_path: Path, updated: dict[str, str]):
    """updated: {slug: '/images/tools/{slug}.png'}"""
    text = ts_path.read_text(encoding="utf-8")

    for slug, img_path in updated.items():
        # 替换已有的 imageUrl 行
        text = re.sub(
            rf"(slug:\s*[`'\"]){re.escape(slug)}([`'\"][^}}]*?imageUrl:\s*)[`'\"][^`'\"]*[`'\"]",
            lambda m: m.group(0),  # 先匹配，下面用更精确的方式
            text,
        )

    # 更精确：逐工具块替换
    def replace_image_url(match):
        block = match.group(0)
        slug_match = re.search(r"slug:\s*[`'\"]([^`'\"]+)[`'\"]", block)
        if not slug_match:
            return block
        slug = slug_match.group(1)
        if slug not in updated:
            return block
        new_url = updated[slug]
        # 替换 imageUrl 值
        block = re.sub(
            r"imageUrl:\s*[`'\"][^`'\"]*[`'\"]",
            f"imageUrl: '{new_url}'",
            block,
        )
        return block

    # 匹配每个工具对象块（从 { 到下一个顶层 },）
    text = re.sub(
        r"\{[^{}]*?slug:[^{}]*?\}",
        replace_image_url,
        text,
        flags=re.DOTALL,
    )

    ts_path.write_text(text, encoding="utf-8")
    print(f"\n✅ 已更新 {len(updated)} 条 imageUrl → {ts_path.name}")

# ── 主流程 ────────────────────────────────────────────────────────────────────
def main():
    tools = parse_tools(DATA_FILE)
    print(f"共 {len(tools)} 个工具，开始抓取图片...\n")

    updated: dict[str, str] = {}
    failed:  list[str]      = []

    for i, tool in enumerate(tools, 1):
        slug    = tool["slug"]
        website = tool["website"]
        dest    = OUTPUT_DIR / f"{slug}.png"

        print(f"[{i:02d}/{len(tools)}] {slug}  →  {website}")

        # 已存在则跳过
        if dest.exists() and dest.stat().st_size > 500:
            print(f"    ⏭ 已存在，跳过")
            updated[slug] = f"/images/tools/{slug}.png"
            continue

        img_url = fetch_og_image(website)
        if img_url:
            print(f"    → 图片 URL: {img_url[:80]}...")
            ok = download_image(img_url, dest)
            if ok:
                updated[slug] = f"/images/tools/{slug}.png"
            else:
                failed.append(slug)
        else:
            print(f"    ✗ 未找到图片 URL")
            failed.append(slug)

        time.sleep(DELAY)

    # 更新 TS 文件
    if updated:
        update_image_urls(DATA_FILE, updated)

    print(f"\n{'='*50}")
    print(f"成功: {len(updated)} / {len(tools)}")
    if failed:
        print(f"失败 ({len(failed)}): {', '.join(failed)}")

    # 输出失败列表到文件，方便后续处理
    if failed:
        fail_file = SCRIPT_DIR / "fetch_images_failed.txt"
        fail_file.write_text("\n".join(failed), encoding="utf-8")
        print(f"失败列表已写入: {fail_file.name}")

if __name__ == "__main__":
    main()
