import Link from 'next/link'
import { getAllCategories, getFeaturedTools, getAllTools, getToolsByCategory } from '@/lib/data'
import { ToolLogo } from '@/components/ToolLogo'
import { CategoryNavSidebar } from '@/components/CategoryNavSidebar'
import type { AITool, Category } from '@/lib/types'

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

// Category section with tool grid
function CategorySection({ category, tools }: { category: Category; tools: AITool[] }) {
  if (tools.length === 0) return null
  return (
    <section id={`cat-${category.slug}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
          <span className="text-xl">{category.icon}</span>
          {category.name}
          <span className="text-xs font-normal text-gray-400 ml-1">{tools.length} 款</span>
        </h2>
        <Link
          href={`/category/${category.slug}`}
          className="text-xs text-brand-600 hover:text-brand-700 font-medium"
        >
          查看全部 →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {tools.slice(0, 6).map(tool => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </section>
  )
}

export default async function HomePage() {
  const [categories, featuredTools, allTools] = await Promise.all([
    getAllCategories(),
    getFeaturedTools(),
    getAllTools(),
  ])

  // Build per-category tool lists (sorted: featured first, then by rating)
  const categoryTools = categories.map(cat => ({
    category: cat,
    tools: allTools
      .filter(t => t.category === cat.slug)
      .sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1
        if (!a.isFeatured && b.isFeatured) return 1
        return b.rating - a.rating
      }),
  }))

  const newTools = allTools.filter(t => t.isNew).slice(0, 6)

  return (
    <div className="animate-fade-in">
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white">
        <div className="container-content py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            收录 {allTools.length}+ 款精选AI工具，持续更新
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
            发现最好用的 <span className="text-brand-300">AI 工具</span>
          </h1>
          <p className="text-brand-100 text-base sm:text-lg max-w-xl mx-auto mb-7">
            精选 ChatGPT、Midjourney、Claude 等热门AI工具，附详细中文测评和使用教程
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tools" className="btn-primary bg-white text-brand-700 hover:bg-brand-50 px-6 py-3 text-sm font-semibold">
              浏览AI工具 →
            </Link>
            <Link href="/compare" className="inline-flex items-center gap-1.5 px-6 py-3 bg-white/10 text-white border border-white/30 rounded-lg hover:bg-white/20 transition-colors duration-150 text-sm font-semibold">
              工具对比
            </Link>
          </div>
        </div>
      </section>

      {/* ── Mobile category pills ── */}
      <div className="lg:hidden container-content pt-5 pb-1">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Link
            href="/tools"
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-600 text-white text-xs font-medium"
          >
            🔥 全部
          </Link>
          {categories.map(cat => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-brand-50 hover:text-brand-600 text-xs font-medium transition-colors"
            >
              {cat.icon} {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Main layout: sidebar + content ── */}
      <div className="container-content py-8">
        <div className="flex gap-8 items-start">

          {/* Left sidebar */}
          <CategoryNavSidebar categories={categories} totalCount={allTools.length} />

          {/* Right content */}
          <div className="flex-1 min-w-0 space-y-10">

            {/* Featured Tools */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                  <span className="text-xl">⭐</span>
                  精选推荐
                </h2>
                <Link href="/tools" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                  浏览全部 →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {featuredTools.slice(0, 6).map(tool => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>

            {/* New Tools */}
            {newTools.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                    <span className="text-xl">🆕</span>
                    最新收录
                    <span className="badge bg-rose-50 text-rose-600 border border-rose-200 text-[10px]">NEW</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {newTools.map(tool => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </section>
            )}

            {/* Per-category sections */}
            {categoryTools.map(({ category, tools }) => (
              <CategorySection key={category.slug} category={category} tools={tools} />
            ))}

            {/* CTA Banner */}
            <section>
              <div className="bg-gradient-to-r from-brand-50 to-blue-50 border border-brand-100 rounded-2xl p-8 text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">有好用的AI工具想推荐？</h2>
                <p className="text-gray-500 text-sm mb-5">欢迎提交你发现的优质AI工具，帮助更多人找到合适的AI助手</p>
                <Link href="/submit" className="btn-primary px-6 py-2.5">
                  提交工具
                </Link>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
