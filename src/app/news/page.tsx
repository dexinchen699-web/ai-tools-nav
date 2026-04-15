import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllNews } from '@/lib/data'
import type { NewsCategory } from '@/lib/types'

export const metadata: Metadata = {
  title: 'AI 资讯 - 最新人工智能动态 | AI工具导航',
  description: '汇聚全球最新 AI 资讯，涵盖行业动态、产品发布、研究论文、公司新闻和政策法规，帮你掌握人工智能最新进展。',
}

const CATEGORY_COLORS: Record<NewsCategory, string> = {
  '行业动态': 'bg-blue-100 text-blue-700',
  '产品发布': 'bg-green-100 text-green-700',
  '研究论文': 'bg-purple-100 text-purple-700',
  '公司新闻': 'bg-orange-100 text-orange-700',
  '政策法规': 'bg-red-100 text-red-700',
}

const ALL_CATEGORIES: NewsCategory[] = ['行业动态', '产品发布', '研究论文', '公司新闻', '政策法规']

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const activeCategory = params.category as NewsCategory | undefined
  const allNews = await getAllNews()
  const filtered = activeCategory
    ? allNews.filter((n) => n.category === activeCategory)
    : allNews

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-white border-b border-gray-200 py-10">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 资讯</h1>
          <p className="text-gray-500 text-base">
            汇聚全球最新人工智能动态，每日更新
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* 分类筛选 */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/news"
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !activeCategory
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
            }`}
          >
            全部
          </Link>
          {ALL_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/news?category=${encodeURIComponent(cat)}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* 资讯列表 */}
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-center py-20">暂无资讯</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          CATEGORY_COLORS[item.category] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-400">{item.source}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-400">{formatDate(item.publishedAt)}</span>
                    </div>
                    <h2 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2 leading-snug">
                      {item.title}
                    </h2>
                    <p className="text-sm text-gray-500 line-clamp-2">{item.summary}</p>
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
