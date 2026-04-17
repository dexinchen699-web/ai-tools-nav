import Link from 'next/link'
import { getAllCategories, getFeaturedTools, getAllTools } from '@/lib/data'
import { CategoryNavSidebar } from '@/components/CategoryNavSidebar'
import { ToolCard } from '@/components/ToolCard'
import type { AITool, Category } from '@/lib/types'

export const revalidate = 3600

// ── Bilingual section header ──────────────────────────────────────────────────

function SectionHeader({
  en,
  cn,
  count,
  href,
}: {
  en: string
  cn: string
  count?: number
  href?: string
}) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <p className="section-label">{en}</p>
        <h2 className="section-title">
          {cn}
          {count !== undefined && (
            <span className="ml-2 text-sm font-normal" style={{ color: 'var(--text-tertiary)' }}>
              {count} 款
            </span>
          )}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="text-xs font-medium transition-colors pb-0.5"
          style={{ color: 'var(--accent)' }}
        >
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
        en={category.slug.toUpperCase().replace(/-/g, ' ')}
        cn={`${category.icon ?? ''} ${category.name}`}
        count={tools.length}
        href={`/category/${category.slug}`}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
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
    <div>

      {/* ── Hero ── */}
      <section className="hero-grid" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container-content lg:pl-56 py-14 sm:py-20">
          <div className="max-w-2xl">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs mb-6 border"
              style={{ background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.2)', color: 'var(--accent)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              收录 {allTools.length}+ 款精选 AI 工具，持续更新
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight mb-4"
              style={{ color: 'var(--text-primary)' }}>
              发现最好用的<br />
              <span style={{ color: 'var(--accent)' }}>AI 工具</span>
            </h1>

            <p className="text-base sm:text-lg mb-8 max-w-lg leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}>
              精选 ChatGPT、Midjourney、Claude 等热门 AI 工具，附详细中文测评和使用教程
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/submit" className="btn-primary px-5 py-2.5 text-sm">
                ＋ 提交工具
              </Link>
              <Link href="/compare" className="btn-secondary px-5 py-2.5 text-sm">
                工具对比
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile category pills ── */}
      <div className="lg:hidden container-content pt-4 pb-1">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Link href="/"
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
            style={{ background: 'var(--accent)' }}>
            🔥 全部
          </Link>
          {categories.map(cat => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              {cat.icon} {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Sidebar + content ── */}
      <CategoryNavSidebar categories={categories} totalCount={allTools.length} />

      <div className="lg:pl-56">
        <div className="container-content py-8 space-y-12">

          {/* Featured */}
          <section id="featured">
            <SectionHeader en="FEATURED" cn="精选推荐" href="/tools" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {featuredTools.slice(0, 6).map(tool => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>

          {/* New */}
          {newTools.length > 0 && (
            <section id="new-tools">
              <SectionHeader en="NEW ARRIVALS" cn="最新收录" />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {newTools.map(tool => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          )}

          {/* Per-category */}
          {categoryTools.map(({ category, tools }) => (
            <CategorySection key={category.slug} category={category} tools={tools} />
          ))}

          {/* CTA */}
          <section>
            <div className="rounded-2xl p-8 sm:p-10 text-center border"
              style={{ background: 'rgba(99,102,241,0.04)', borderColor: 'rgba(99,102,241,0.15)' }}>
              <p className="section-label mb-1">CONTRIBUTE</p>
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                有好用的 AI 工具想推荐？
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                欢迎提交你发现的优质 AI 工具，帮助更多人找到合适的 AI 助手
              </p>
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
