import Link from 'next/link'
import { getAllCategories, getFeaturedTools, getAllTools } from '@/lib/data'
import { CategoryNavSidebar } from '@/components/CategoryNavSidebar'
import { ToolCard } from '@/components/ToolCard'
import type { AITool, Category } from '@/lib/types'

export const revalidate = 3600

// ── Section header ────────────────────────────────────────────────────────────

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
    <div className="flex items-end justify-between mb-5">
      <div>
        <p className="section-label">{en}</p>
        <h2 className="section-title">
          {cn}
          {count !== undefined && (
            <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">
              {count} 款
            </span>
          )}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="text-xs font-medium text-[var(--accent-navy)] hover:text-[var(--accent-gold)] transition-colors whitespace-nowrap pb-0.5"
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
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
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
    <div style={{ background: 'var(--bg-primary)' }}>

      {/* ── Hero ── */}
      <section
        className="hero-grid"
        style={{
          borderBottom: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background orbs */}
        <div style={{
          position: 'absolute', top: -100, left: '5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: 0, right: '0%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container-content" style={{ paddingTop: '4.5rem', paddingBottom: '5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 620 }}>

            {/* Live badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: 999,
              padding: '0.3rem 1rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              marginBottom: '1.75rem',
              background: 'rgba(26,47,94,0.06)',
              border: '1px solid rgba(26,47,94,0.15)',
              color: 'var(--accent-navy)',
              fontFamily: 'var(--font-body)',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 6px #22c55e',
                flexShrink: 0,
              }} />
              收录 {allTools.length}+ 款精选 AI 工具，持续更新
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '1.25rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
            }}>
              发现最好用的<br />
              <span className="gradient-text">AI 工具</span>
            </h1>

            <p style={{
              fontSize: '1.0625rem',
              lineHeight: 1.75,
              marginBottom: '2.25rem',
              maxWidth: 480,
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
            }}>
              精选 ChatGPT、Midjourney、Claude 等热门 AI 工具，附详细中文测评和使用教程
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <Link href="/tools" className="btn-primary" style={{ padding: '0.625rem 1.75rem', fontSize: '0.9rem' }}>
                浏览全部工具
              </Link>
              <Link href="/compare" className="btn-secondary" style={{ padding: '0.625rem 1.75rem', fontSize: '0.9rem' }}>
                工具对比
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── Mobile category pills ── */}
      <div className="lg:hidden" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="container-content" style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            <Link href="/" style={{
              flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.375rem 0.875rem',
              borderRadius: 999,
              fontSize: '0.75rem',
              fontWeight: 600,
              background: 'var(--accent-navy)',
              color: '#fff',
              textDecoration: 'none',
            }}>
              🔥 全部
            </Link>
            {categories.map(cat => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                style={{
                  flexShrink: 0,
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.375rem 0.875rem',
                  borderRadius: 999,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                }}
              >
                {cat.icon} {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sidebar + content ── */}
      <CategoryNavSidebar categories={categories} totalCount={allTools.length} />

      <div className="lg:pl-56">
        <div className="container-content" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>

            {/* Featured */}
            <section id="featured">
              <SectionHeader en="FEATURED" cn="✨ 精选推荐" href="/tools" />
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                {featuredTools.slice(0, 6).map(tool => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>

            {/* New arrivals */}
            {newTools.length > 0 && (
              <section id="new-tools">
                <SectionHeader en="NEW ARRIVALS" cn="🆕 最新收录" />
                <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
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

            {/* CTA banner */}
            <section>
              <div style={{
                borderRadius: '1.25rem',
                padding: '2.5rem',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(26,47,94,0.04) 0%, rgba(201,168,76,0.06) 100%)',
                border: '1px solid var(--border)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Decorative corner accent */}
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  width: 200, height: 200,
                  background: 'radial-gradient(circle at top right, rgba(201,168,76,0.1) 0%, transparent 60%)',
                  pointerEvents: 'none',
                }} />
                <p className="section-label" style={{ marginBottom: '0.25rem' }}>CONTRIBUTE</p>
                <h2 style={{
                  fontSize: '1.375rem',
                  fontWeight: 700,
                  marginBottom: '0.625rem',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-display)',
                }}>
                  有好用的 AI 工具想推荐？
                </h2>
                <p style={{
                  fontSize: '0.9375rem',
                  marginBottom: '1.75rem',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)',
                  maxWidth: 400,
                  margin: '0 auto 1.75rem',
                }}>
                  欢迎提交你发现的优质 AI 工具，帮助更多人找到合适的 AI 助手
                </p>
                <Link href="/submit" className="btn-primary" style={{ padding: '0.625rem 1.75rem' }}>
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
