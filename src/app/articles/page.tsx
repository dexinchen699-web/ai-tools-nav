import type { Metadata } from 'next'
import articlesData from '@/data/articles.json'

export const metadata: Metadata = {
  title: 'AI 文章 — AI工具导航',
  description: '精选 AI Agent、工具深度解析与教程，涵盖 Dify、Coze、n8n、MCP 等主流平台，助你快速上手 AI 应用开发。',
}

const CATEGORY_META: Record<string, { emoji: string }> = {
  '教程':   { emoji: '📖' },
  '深度解析': { emoji: '🔬' },
  '科普':   { emoji: '💡' },
  'AI工具': { emoji: '🛠️' },
}

interface Article {
  slug: string
  file: string
  title: string
  desc: string
  date: string
  category: string
}

const articles = articlesData as Article[]

export default function ArticlesPage() {
  const grouped = Object.keys(CATEGORY_META).reduce<Record<string, Article[]>>((acc, cat) => {
    acc[cat] = articles.filter(a => a.category === cat)
    return acc
  }, {})

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white">
        <div className="container-content py-12 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">AI 文章</h1>
          <p className="text-brand-100 text-sm max-w-lg mx-auto">
            深度解析 AI Agent、主流工具与前沿技术，从科普到实战一站搞定
          </p>
          <p className="mt-3 text-brand-200 text-xs">共 {articles.length} 篇</p>
        </div>
      </section>

      <div className="container-content py-8 pb-16 space-y-12">
        {Object.entries(grouped).map(([cat, items]) => {
          if (items.length === 0) return null
          const meta = CATEGORY_META[cat]
          return (
            <section key={cat}>
              <h2 className="section-title flex items-center gap-2 mb-4">
                <span>{meta.emoji}</span>
                {cat}
                <span className="text-sm font-normal ml-1" style={{ color: 'var(--text-muted)' }}>
                  ({items.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(a => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <a
      href={`/articles/${article.file}`}
      target="_blank"
      rel="noopener noreferrer"
      className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow group"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug group-hover:text-indigo-600 transition-colors"
          style={{ color: 'var(--text-primary)' }}>
          {article.title}
        </h3>
        <span className="badge flex-shrink-0 text-xs px-2 py-0.5 rounded-full border whitespace-nowrap"
          style={{ background: 'var(--accent-light)', color: 'var(--accent)', borderColor: 'transparent' }}>
          {article.category}
        </span>
      </div>

      {article.desc && (
        <p className="text-xs flex-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
          {article.desc}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{article.date}</span>
        <span className="text-xs font-medium group-hover:underline" style={{ color: 'var(--accent)' }}>
          阅读 →
        </span>
      </div>
    </a>
  )
}
