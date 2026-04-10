"""
Phase 3: 关键词排名追踪脚本（无需 API，直接抓取搜索结果）
功能：检查目标关键词在 Google/Baidu 的排名位置

依赖安装：
  py -m pip install requests beautifulsoup4 pandas

使用：
  py pipeline/rank_tracker.py

注意：频繁抓取可能触发验证码，建议每天最多运行 1-2 次
"""

import time
import random
import pandas as pd
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import os

# ── 配置 ──────────────────────────────────────────────
SITE_DOMAIN = "ai-tools-nav-two.vercel.app"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "reports")

# 要追踪的目标关键词
TARGET_KEYWORDS = [
    "ChatGPT 使用教程",
    "ChatGPT 中文版",
    "Midjourney 教程",
    "Claude AI 测评",
    "Notion AI 功能",
    "Perplexity AI 使用",
    "AI 写作工具推荐",
    "AI 绘画工具对比",
    "最好用的 AI 工具",
    "AI 工具导航",
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "zh-CN,zh;q=0.9",
}
# ──────────────────────────────────────────────────────


def check_google_rank(keyword: str, max_pages: int = 3) -> int:
    """检查关键词在 Google 的排名（返回位置，-1 表示未找到）"""
    position = 0
    for page in range(max_pages):
        start = page * 10
        url = f"https://www.google.com/search?q={requests.utils.quote(keyword)}&start={start}&hl=zh-CN&gl=CN"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=10)
            soup = BeautifulSoup(resp.text, "html.parser")
            results = soup.select("div.g a[href]")
            for result in results:
                href = result.get("href", "")
                position += 1
                if SITE_DOMAIN in href:
                    return position
            time.sleep(random.uniform(2, 4))
        except Exception as e:
            print(f"  Google 请求失败：{e}")
            return -1
    return -1


def check_baidu_rank(keyword: str, max_pages: int = 3) -> int:
    """检查关键词在 Baidu 的排名（返回位置，-1 表示未找到）"""
    position = 0
    for page in range(max_pages):
        pn = page * 10
        url = f"https://www.baidu.com/s?wd={requests.utils.quote(keyword)}&pn={pn}"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=10)
            soup = BeautifulSoup(resp.text, "html.parser")
            results = soup.select("div.result a[href]")
            for result in results:
                href = result.get("href", "")
                position += 1
                if SITE_DOMAIN in href:
                    return position
            time.sleep(random.uniform(2, 4))
        except Exception as e:
            print(f"  Baidu 请求失败：{e}")
            return -1
    return -1


def run_rank_check():
    """运行完整排名检查"""
    print(f"🔍 排名追踪开始 — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"目标站点：{SITE_DOMAIN}\n")

    results = []
    for i, keyword in enumerate(TARGET_KEYWORDS, 1):
        print(f"[{i}/{len(TARGET_KEYWORDS)}] 检查：{keyword}")
        google_rank = check_google_rank(keyword)
        baidu_rank = check_baidu_rank(keyword)

        g_display = f"第 {google_rank} 位" if google_rank > 0 else "未收录"
        b_display = f"第 {baidu_rank} 位" if baidu_rank > 0 else "未收录"
        print(f"  Google: {g_display} | Baidu: {b_display}")

        results.append({
            "关键词": keyword,
            "Google排名": google_rank if google_rank > 0 else None,
            "Baidu排名": baidu_rank if baidu_rank > 0 else None,
            "检查时间": datetime.now().strftime("%Y-%m-%d %H:%M"),
        })
        time.sleep(random.uniform(3, 6))

    df = pd.DataFrame(results)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    filename = f"rank_report_{datetime.now().strftime('%Y%m%d_%H%M')}.csv"
    filepath = os.path.join(OUTPUT_DIR, filename)
    df.to_csv(filepath, index=False, encoding="utf-8-sig")
    print(f"\n✅ 排名报告已保存：{filepath}")
    return df


if __name__ == "__main__":
    run_rank_check()
