import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getNewsBySlug, getLatestNews } from '@/lib/data'
import type { NewsCategory } from '@/lib/types'

const CATEGORY_COLORS: Record<NewsCategory, string> = {
  '行业动态': 'bg-blue-100 text-blue-700',
  '产品发布': 'bg-green-100 text-green-700',
  '研究论文': 'bg-purple-100 text-purple-700',
  '公司新闻': 'bg-orange-100 text-orange-700',
  '政策法规': 'bg-red-100 text-red-700',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const item = await getNewsBySlug(slug)
  if (!item) return { title: '资讯未找到' }
  return {
    title: `${item.title} | AI资讯`,
    description: item.summary,
  }
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [item, latest] = await Promise.all([
    getNewsBySlug(slug),
    getLatestNews(6),
  ])

  if (!item) notFound()

  const related = latest.filter((n) => n.slug !== slug).slice(0, 5)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* ── 主内容 ── */}
          <article className="flex-1 min-w-0">
            {/* 面包屑 */}
            <nav className="text-sm text-gray-400 mb-4 flex items-center gap-1">
              <Link href="/" className="hover:text-gray-600">首页</Link>
              <span>/</span>
              <Link href="/news" className="hover:text-gray-600">AI资讯</Link>
              <span>/</span>
              <span className="text-gray-600 truncate">{item.title}</span>
            </nav>

            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
              {/* 分类 + 日期 */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    CATEGORY_COLORS[item.category] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {item.category}
                </span>
                <span className="text-sm text-gray-400">{item.source}</span>
                <span className="text-sm text-gray-400">·</span>
                <span className="text-sm text-gray-400">{formatDate(item.publishedAt)}</span>
              </div>

              {/* 标题 */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">
                {item.title}
              </h1>

              {/* 摘要 */}
              <p className="text-base text-gray-600 border-l-4 border-blue-400 pl-4 mb-6 leading-relaxed">
                {item.summary}
              </p>

              {/* 正文 */}
              <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                {item.content}
              </div>

              {/* 标签 */}
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 原文链接 */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800"
                >
                  查看原文 →
                </a>
              </div>
            </div>
          </article>

          {/* ── 侧边栏：最新资讯 ── */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">最新资讯</h2>
              <div className="space-y-4">
                {related.map((n) => (
                  <Link
                    key={n.id}
                    href={`/news/${n.slug}`}
                    className="block group"
                  >
                    <p className="text-sm text-gray-700 group-hover:text-blue-600 line-clamp-2 leading-snug mb-1">
                      {n.title}
                    </p>
                    <span className="text-xs text-gray-400">{formatDate(n.publishedAt)}</span>
                  </Link>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link
                  href="/news"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  查看全部资讯 →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
