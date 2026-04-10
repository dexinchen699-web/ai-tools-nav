import Link from 'next/link'
import { getAllCategories, getFeaturedTools, getAllTools } from '@/lib/data'
import { ToolLogo } from '@/components/ToolLogo'
import type { AITool } from '@/lib/types'

const PRICING_BADGE: Record<string, string> = {
  free:       'badge-free',
  freemium:   'badge-freemium',
  paid:       'badge-paid',
  enterprise: 'badge-enterprise',
}

const PRICING_LABEL: Record<string, string> = {
  free:       '免费',
  freemium:   '免费+付费',
  paid:       '付费',
  enterprise: '企业版',
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-amber-400 text-xs">
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
      <span className="text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </span>
  )
}

function ToolCard({ tool }: { tool: AITool }) {
  return (
    <Link href={`/tools/${tool.slug}`} className="card p-4 flex flex-col gap-3 group">
      <div className="flex items-start gap-3">
        <ToolLogo
          src={tool.logoUrl || tool.imageUrl || '/images/tools/placeholder.png'}
          alt={tool.name}
          width={44}
          height={44}
          className="tool-logo w-11 h-11"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm group-hover:text-brand-600 transition-colors truncate">
              {tool.name}
            </h3>
            {tool.isNew && (
              <span className="badge bg-rose-50 text-rose-600 border border-rose-200 text-[10px]">NEW</span>
            )}
          </div>
          <span className={`${PRICING_BADGE[tool.pricing]} mt-0.5`}>
            {PRICING_LABEL[tool.pricing]}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{tool.tagline}</p>
      <div className="mt-auto pt-1 border-t border-gray-50">
        <StarRating rating={tool.rating} />
      </div>
    </Link>
  )
}

export default async function HomePage() {
  const [categories, featuredTools, allTools] = await Promise.all([
    getAllCategories(),
    getFeaturedTools(),
    getAllTools(),
  ])

  // Group tools by category for the "browse by category" section
  const newTools = allTools.filter(t => t.isNew).slice(0, 6)

  return (
    <div className="animate-fade-in">
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white">
        <div className="container-content py-14 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            收录 {allTools.length}+ 款精选AI工具，持续更新
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
            发现最好用的 <span className="text-brand-300">AI 工具</span>
          </h1>
          <p className="text-brand-100 text-base sm:text-lg max-w-xl mx-auto mb-8">
            精选 ChatGPT、Midjourney、Claude 等热门AI工具，附详细中文测评和使用教程
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tools" className="btn-primary bg-white text-brand-700 hover:bg-brand-50 px-6 py-3 text-sm font-semibold">
              浏览AI工具 →
            </Link>
            <Link href="/compare" className="btn-secondary border-white/30 text-white hover:bg-white/10 px-6 py-3 text-sm font-semibold">
              工具对比
            </Link>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="container-content py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">工具分类</h2>
          <span className="text-sm text-gray-400">{categories.length} 个分类</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map(cat => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="card p-4 flex flex-col items-center gap-2 text-center group hover:border-brand-300 hover:bg-brand-50/50 transition-all"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-sm font-medium text-gray-800 group-hover:text-brand-600 transition-colors">
                {cat.name}
              </span>
              <span className="text-xs text-gray-400">{cat.toolCount} 款工具</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Tools ── */}
      <section className="container-content py-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">精选推荐</h2>
          <Link href="/tools" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            浏览全部工具 →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredTools.slice(0, 6).map(tool => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      {/* ── New Tools ── */}
      {newTools.length > 0 && (
        <section className="container-content py-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title flex items-center gap-2">
              最新收录
              <span className="badge bg-rose-50 text-rose-600 border border-rose-200 text-xs">NEW</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {newTools.map(tool => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* ── CTA Banner ── */}
      <section className="container-content py-10">
        <div className="bg-gradient-to-r from-brand-50 to-blue-50 border border-brand-100 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">有好用的AI工具想推荐？</h2>
          <p className="text-gray-500 text-sm mb-5">欢迎提交你发现的优质AI工具，帮助更多人找到合适的AI助手</p>
          <a href="mailto:submit@ai-tools-nav.vercel.app" className="btn-primary px-6 py-2.5">
            提交工具
          </a>
        </div>
      </section>
    </div>
  )
}
