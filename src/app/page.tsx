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
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
      <div>
        <p className="section-label">{en}</p>
        <h2 className="section-title">
          {cn}
          {count !== undefined && (
            <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)' }}>
              {count} 款
            </span>
          )}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--accent-purple)',
            textDecoration: 'none',
            transition: 'opacity 0.15s',
            paddingBottom: '0.125rem',
            whiteSpace: 'nowrap',
          }}
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '0.75rem',
      }}>
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
      <section className="hero-grid" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        {/* Background orbs */}
        <div className="glow-orb glow-orb-purple" style={{ top: '-80px', left: '10%', width: 400, height: 400, opacity: 0.25 }} />
        <div className="glow-orb glow-orb-blue" style={{ top: '20px', right: '5%', width: 300, height: 300, opacity: 0.15 }} />

        <div className="container-content" style={{ paddingLeft: undefined, paddingTop: '4rem', paddingBottom: '4.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 640 }}>
            {/* Live badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: 999,
              padding: '0.25rem 0.875rem',
              fontSize: '0.75rem',
              marginBottom: '1.5rem',
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.25)',
              color: 'var(--accent-purple)',
              fontFamily: 'var(--font-body)',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#34d399',
                boxShadow: '0 0 6px #34d399',
                animation: 'pulse 2s infinite',
              }} />
              收录 {allTools.length}+ 款精选 AI 工具，持续更新
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '1rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
            }}>
              发现最好用的<br />
              <span className="gradient-text">AI 工具</span>
            </h1>

            <p style={{
              fontSize: '1rem',
              lineHeight: 1.75,
              marginBottom: '2rem',
              maxWidth: 480,
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
            }}>
              精选 ChatGPT、Midjourney、Claude 等热门 AI 工具，附详细中文测评和使用教程
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <Link href="/tools" className="btn-primary" style={{ padding: '0.625rem 1.5rem', fontSize: '0.875rem' }}>
                浏览全部工具
              </Link>
              <Link href="/compare" className="btn-secondary" style={{ padding: '0.625rem 1.5rem', fontSize: '0.875rem' }}>
                工具对比
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile category pills ── */}
      <div className="lg-hidden container-content" style={{ paddingTop: '1rem', paddingBottom: '0.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <Link href="/" style={{
            flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.375rem 0.875rem',
            borderRadius: 999,
            fontSize: '0.75rem',
            fontWeight: 600,
            background: 'var(--accent-purple)',
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
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.375rem 0.875rem',
                borderRadius: 999,
                fontSize: '0.75rem',
                fontWeight: 500,
                background: 'var(--bg-card)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
              }}
            >
              {cat.icon} {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Sidebar + content ── */}
      <CategoryNavSidebar categories={categories} totalCount={allTools.length} />

      <div className="lg-pl-56">
        <div className="container-content" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>

            {/* Featured */}
            <section id="featured">
              <SectionHeader en="FEATURED" cn="✨ 精选推荐" href="/tools" />
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '0.75rem',
              }}>
                {featuredTools.slice(0, 6).map(tool => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>

            {/* New */}
            {newTools.length > 0 && (
              <section id="new-tools">
                <SectionHeader en="NEW ARRIVALS" cn="🆕 最新收录" />
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '0.75rem',
                }}>
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
              <div style={{
                borderRadius: '1rem',
                padding: '2.5rem',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.06) 100%)',
                border: '1px solid rgba(139,92,246,0.2)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div className="glow-orb glow-orb-purple" style={{ top: '-60px', left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, opacity: 0.2 }} />
                <p className="section-label" style={{ marginBottom: '0.25rem' }}>CONTRIBUTE</p>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-display)',
                }}>
                  有好用的 AI 工具想推荐？
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  marginBottom: '1.5rem',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)',
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
