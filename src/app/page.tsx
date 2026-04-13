import Link from 'next/link'
import { getAllCategories, getFeaturedTools, getAllTools } from '@/lib/data'
import { CategoryNavSidebar } from '@/components/CategoryNavSidebar'
import { ToolCard } from '@/components/ToolCard'
import type { AITool, Category } from '@/lib/types'

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  count,
  href,
}: {
  icon: string
  title: string
  count?: number
  href?: string
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
        <span className="text-lg leading-none">{icon}</span>
        {title}
        {count !== undefined && (
          <span className="text-xs font-normal text-gray-400">{count} 款</span>
        )}
      </h2>
      {href && (
        <Link href={href} className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors">
          查看全部 →
        </Link>
      )}
    </div>
  )
}

// ── Category section ──────────────────────────────────────────────────────────

function CategorySection({ category, tools }: { category: Category; tools: AITool[] }) {
  if (tools.length === 0) return null
  return (
    <section id={`cat-${category.slug}`}>
      <SectionHeader
        icon={category.icon ?? '📦'}
        title={category.name}
        count={tools.length}
        href={`/category/${category.slug}`}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
        {tools.slice(0, 6).map(tool => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [categories, featuredTools, allTools] = await Promise.all([
    getAllCategories(),
    getFeaturedTools(),
    getAllTools(),
  ])

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

      {/* ── Compact hero bar ── */}
      <section className="bg-gradient-to-r from-brand-600 to-brand-800 text-white">
        <div className="container-content lg:pl-56 py-8 sm:py-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              收录 {allTools.length}+ 款精选AI工具，持续更新
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 leading-tight">
              发现最好用的 <span className="text-brand-200">AI 工具</span>
            </h1>
            <p className="text-brand-100 text-sm sm:text-base mb-5 max-w-lg">
              精选 ChatGPT、Midjourney、Claude 等热门AI工具，附详细中文测评和使用教程
            </p>
            <div className="flex gap-3">
              <Link href="/submit" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-brand-700 rounded-lg hover:bg-brand-50 transition-colors text-sm font-semibold">
                ＋ 提交工具
              </Link>
              <Link href="/category/ai-writing" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 text-white border border-white/30 rounded-lg hover:bg-white/20 transition-colors text-sm font-medium">
                浏览分类
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile category pills ── */}
      <div className="lg:hidden container-content pt-4 pb-1">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Link href="/" className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-600 text-white text-xs font-medium">
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

      {/* ── Main layout: fixed sidebar (rendered inside component) + content ── */}
      <CategoryNavSidebar categories={categories} totalCount={allTools.length} />

      <div className="lg:pl-56">
        <div className="container-content py-6 space-y-8">

          {/* Featured Tools */}
          <section id="featured">
            <SectionHeader icon="⭐" title="精选推荐" href="/tools" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {featuredTools.slice(0, 6).map(tool => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>

          {/* New Tools */}
          {newTools.length > 0 && (
            <section id="new-tools">
              <SectionHeader icon="🆕" title="最新收录" />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
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
              <h2 className="text-lg font-bold text-gray-900 mb-2">有好用的AI工具想推荐？</h2>
              <p className="text-gray-500 text-sm mb-5">欢迎提交你发现的优质AI工具，帮助更多人找到合适的AI助手</p>
              <Link href="/submit" className="btn-primary px-6 py-2.5">
                提交工具
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
