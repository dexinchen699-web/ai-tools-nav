import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllTools, getAllCategories } from '@/lib/data'
import { ToolCard } from '@/components/ToolCard'
import type { AITool } from '@/lib/types'

export const metadata: Metadata = {
  title: '全部AI工具 — AI工具导航',
  description: '浏览收录的全部AI工具，支持按分类、定价筛选，按评分和最新排序。',
}

type SortKey = 'rating' | 'newest' | 'reviews'

interface PageProps {
  searchParams: Promise<{
    cat?: string
    pricing?: string
    sort?: string
    q?: string
  }>
}

export default async function AllToolsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const catFilter = sp.cat ?? 'all'
  const pricingFilter = sp.pricing ?? 'all'
  const sortKey = (sp.sort ?? 'rating') as SortKey
  const query = (sp.q ?? '').trim().toLowerCase()

  const [allTools, categories] = await Promise.all([getAllTools(), getAllCategories()])

  let tools = allTools
  if (query) {
    tools = tools.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.tagline.toLowerCase().includes(query) ||
      t.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }
  if (catFilter !== 'all') tools = tools.filter(t => t.category === catFilter)
  if (pricingFilter !== 'all') tools = tools.filter(t => t.pricing === pricingFilter)

  if (sortKey === 'rating') {
    tools = [...tools].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
  } else if (sortKey === 'reviews') {
    tools = [...tools].sort((a, b) => b.reviewCount - a.reviewCount)
  } else {
    tools = [...tools].sort((a, b) => {
      if (a.isNew !== b.isNew) return a.isNew ? -1 : 1
      return b.rating - a.rating
    })
  }

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams()
    const merged = { cat: catFilter, pricing: pricingFilter, sort: sortKey, ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v !== 'all' && !(k === 'sort' && v === 'rating')) params.set(k, v)
    }
    const qs = params.toString()
    return `/tools${qs ? `?${qs}` : ''}`
  }

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'rating', label: '按评分' },
    { key: 'reviews', label: '按热度' },
    { key: 'newest', label: '最新优先' },
  ]

  const pricingOptions = [
    { key: 'all', label: '全部' },
    { key: 'free', label: '免费' },
    { key: 'freemium', label: '免费+' },
    { key: 'paid', label: '付费' },
    { key: 'enterprise', label: '企业' },
  ]

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="glow-orb glow-orb-purple" style={{ top: -60, right: '10%', width: 300, height: 300, opacity: 0.12 }} />
        <div className="container-content" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
          <p className="section-label">TOOLS DIRECTORY</p>
          <h1 className="section-title" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>全部 AI 工具</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
            共收录 <strong style={{ color: 'var(--text-primary)' }}>{allTools.length}</strong> 款 AI 工具，覆盖 {categories.length} 个分类
          </p>
        </div>
      </div>

      <div className="container-content" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
        {/* Category pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
          <Link
            href={buildUrl({ cat: 'all' })}
            style={{
              flexShrink: 0,
              padding: '0.375rem 0.875rem',
              borderRadius: 999,
              fontSize: '0.75rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.15s',
              background: catFilter === 'all' ? 'var(--accent-purple)' : 'var(--bg-card)',
              color: catFilter === 'all' ? '#fff' : 'var(--text-secondary)',
              border: catFilter === 'all' ? '1px solid transparent' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            🔥 全部 ({allTools.length})
          </Link>
          {categories.map(cat => (
            <Link
              key={cat.slug}
              href={buildUrl({ cat: cat.slug })}
              style={{
                flexShrink: 0,
                padding: '0.375rem 0.875rem',
                borderRadius: 999,
                fontSize: '0.75rem',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.15s',
                background: catFilter === cat.slug ? 'var(--accent-purple)' : 'var(--bg-card)',
                color: catFilter === cat.slug ? '#fff' : 'var(--text-secondary)',
                border: catFilter === cat.slug ? '1px solid transparent' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {cat.icon} {cat.name} ({cat.toolCount})
            </Link>
          ))}
        </div>

        {/* Filter + sort row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {/* Pricing */}
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {pricingOptions.map(opt => (
              <Link
                key={opt.key}
                href={buildUrl({ pricing: opt.key })}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  background: pricingFilter === opt.key ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: pricingFilter === opt.key ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: pricingFilter === opt.key ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                }}
              >
                {opt.label}
              </Link>
            ))}
          </div>

          {/* Sort + count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              找到 <strong style={{ color: 'var(--text-secondary)' }}>{tools.length}</strong> 款
            </span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {sortOptions.map(opt => (
                <Link
                  key={opt.key}
                  href={buildUrl({ sort: opt.key })}
                  style={{
                    padding: '0.25rem 0.625rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: sortKey === opt.key ? 600 : 400,
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                    background: sortKey === opt.key ? 'rgba(139,92,246,0.15)' : 'transparent',
                    color: sortKey === opt.key ? 'var(--accent-purple)' : 'var(--text-muted)',
                  }}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        {tools.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔍</span>
            <p style={{ marginBottom: '1rem' }}>没有找到符合条件的工具</p>
            <Link href="/tools" style={{ fontSize: '0.875rem', color: 'var(--accent-purple)', textDecoration: 'none' }}>
              清除筛选
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '0.75rem',
          }}>
            {tools.map(tool => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
