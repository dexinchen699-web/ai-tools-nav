'use client'

import { useState } from 'react'
import type { NewsItem, NewsCategory } from '@/lib/types'

const CATEGORY_COLORS: Record<NewsCategory, string> = {
  '行业动态': 'bg-blue-100 text-blue-700',
  '产品发布': 'bg-green-100 text-green-700',
  '研究论文': 'bg-purple-100 text-purple-700',
  '公司新闻': 'bg-orange-100 text-orange-700',
  '政策法规': 'bg-red-100 text-red-700',
}

const ALL_CATEGORIES: NewsCategory[] = ['行业动态', '产品发布', '研究论文', '公司新闻', '政策法规']

function toDateKey(iso: string): string {
  return iso.slice(0, 10)
}

function formatGroupDate(key: string): string {
  const [y, m, d] = key.split('-')
  return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

export function NewsFilter({ allNews }: { allNews: NewsItem[] }) {
  const [activeCategory, setActiveCategory] = useState<NewsCategory | null>(null)

  const filtered = activeCategory
    ? allNews.filter((n) => n.category === activeCategory)
    : allNews

  const groups: { dateKey: string; items: NewsItem[] }[] = []
  const groupMap = new Map<string, NewsItem[]>()
  for (const item of filtered) {
    const key = toDateKey(item.publishedAt)
    if (!groupMap.has(key)) {
      groupMap.set(key, [])
      groups.push({ dateKey: key, items: groupMap.get(key)! })
    }
    groupMap.get(key)!.push(item)
  }

  return (
    <>
      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !activeCategory
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
          }`}
        >
          全部
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 按天分组的资讯列表 */}
      {groups.length === 0 ? (
        <p className="text-gray-400 text-center py-20">暂无资讯</p>
      ) : (
        <div className="space-y-10">
          {groups.map(({ dateKey, items }) => (
            <section key={dateKey}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-semibold text-gray-900">
                  {formatGroupDate(dateKey)}
                </h2>
                <span className="text-xs text-gray-400">{items.length} 条</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group mb-2"
                    >
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 leading-snug transition-colors">
                        {item.title}
                      </h3>
                    </a>

                    {item.summary && (
                      <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2">
                        {item.summary}
                      </p>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          CATEGORY_COLORS[item.category] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-400">{item.source}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{formatTime(item.publishedAt)}</span>
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
