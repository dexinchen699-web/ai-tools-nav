import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllCategories, getCategoryBySlug, getToolsByCategory, getAllTools } from '@/lib/data'
import { buildCategoryMetadata } from '@/lib/metadata'
import { Breadcrumb } from '@/components/Breadcrumb'
import { JsonLd } from '@/components/JsonLd'
import { CategoryNavSidebar } from '@/components/CategoryNavSidebar'
import { ToolCard } from '@/components/ToolCard'
import type { AITool } from '@/lib/types'

export const revalidate = 3600

export async function generateStaticParams() {
  const categories = await getAllCategories()
  return categories.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}
  return buildCategoryMetadata({
    name: category.name,
    description: category.description,
    slug: category.slug,
    toolCount: category.toolCount ?? 0,
  })
}

const SORT_OPTIONS = [
  { value: 'rating',   label: '评分最高' },
  { value: 'featured', label: '精选优先' },
  { value: 'newest',   label: '最新收录' },
  { value: 'name',     label: '名称排序' },
] as const

type SortKey = typeof SORT_OPTIONS[number]['value']

const PRICING_FILTERS = [
  { value: 'all',        label: '全部' },
  { value: 'free',       label: '免费' },
  { value: 'freemium',   label: '免费+付费' },
  { value: 'paid',       label: '付费' },
  { value: 'enterprise', label: '企业版' },
] as const

type PricingFilter = typeof PRICING_FILTERS[number]['value']

function sortTools(tools: AITool[], sort: SortKey): AITool[] {
  return [...tools].sort((a, b) => {
    switch (sort) {
      case 'featured':
        if (a.isFeatured && !b.isFeatured) return -1
        if (!a.isFeatured && b.isFeatured) return 1
        return b.rating - a.rating
      case 'newest':
        if (a.isNew && !b.isNew) return -1
        if (!a.isNew && b.isNew) return 1
        return b.rating - a.rating
      case 'name':
        return a.name.localeCompare(b.name, 'zh-CN')
      case 'rating':
      default:
        return b.rating - a.rating
    }
  })
}

function filterTools(tools: AITool[], pricing: PricingFilter): AITool[] {
  if (pricing === 'all') return tools
  return tools.filter(t => t.pricing === pricing)
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string; pricing?: string }>
}) {
  const { slug } = await params
  const { sort: sortParam, pricing: pricingParam } = await searchParams

  const sort: SortKey =
    SORT_OPTIONS.some(o => o.value === sortParam) ? (sortParam as SortKey) : 'featured'

  const pricing: PricingFilter =
    PRICING_FILTERS.some(o => o.value === pricingParam) ? (pricingParam as PricingFilter) : 'all'

  const [category, allCategories, allTools, rawTools] = await Promise.all([
    getCategoryBySlug(slug),
    getAllCategories(),
    getAllTools(),
    getToolsByCategory(slug),
  ])

  if (!category) notFound()

  const filteredTools = filterTools(sortTools(rawTools, sort), pricing)

  const breadcrumbs = [
    { name: '首页', url: '/' },
    { name: category.name, url: `/category/${slug}` },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name}工具大全`,
    description: category.description,
    url: `https://ai-tools-nav.vercel.app/category/${slug}`,
    numberOfItems: rawTools.length,
  }

  function buildUrl(newSort: string, newPricing: string) {
    const p = new URLSearchParams()
    if (newSort !== 'featured') p.set('sort', newSort)
    if (newPricing !== 'all') p.set('pricing', newPricing)
    const qs = p.toString()
    return `/category/${slug}${qs ? `?${qs}` : ''}`
  }

  // Pill style helpers
  const pillActive = {
    background: 'rgba(139,92,246,0.18)',
    color: 'var(--accent-purple)',
    border: '1px solid rgba(139,92,246,0.4)',
  }
  const pillIdle = {
    background: 'rgba(255,255,255,0.04)',
    color: 'var(--text-secondary)',
    border: '1px solid rgba(255,255,255,0.08)',
  }

  return (
    <div className="animate-fade-in">
      <JsonLd data={jsonLd} />

      <div className="container-content">
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

          {/* Sidebar */}
          <CategoryNavSidebar
            categories={allCategories}
            totalCount={allTools.length}
            activeSlug={slug}
          />

          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Breadcrumb */}
            <div style={{
              padding: '0.75rem 0',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              marginBottom: '1.25rem',
            }}>
              <Breadcrumb items={breadcrumbs} />
            </div>

            {/* Category hero */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.15) 50%, rgba(6,182,212,0.1) 100%)',
              border: '1px solid rgba(139,92,246,0.25)',
              borderRadius: '14px',
              padding: '1.75rem',
              marginBottom: '1.5rem',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Glow */}
              <div style={{
                position: 'absolute',
                top: '-40%',
                right: '-10%',
                width: '280px',
                height: '280px',
                background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative' }}>
                <span style={{ fontSize: '3rem', lineHeight: 1 }}>{category.icon}</span>
                <div>
                  <h1 style={{
                    fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display)',
                    marginBottom: '0.35rem',
                  }}>
                    {category.name}工具大全
                  </h1>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    {category.description}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    共收录 <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{rawTools.length}</span> 款工具
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile category pills */}
            <div className="lg:hidden" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {allCategories.map(cat => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    style={{
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.375rem 0.875rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.15s',
                      ...(cat.slug === slug ? pillActive : pillIdle),
                    }}
                  >
                    {cat.icon} {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Filter / sort bar */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '0.75rem',
              alignItems: 'center',
            }}>
              {/* Pricing */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.125rem' }}>定价：</span>
                {PRICING_FILTERS.map(opt => (
                  <Link
                    key={opt.value}
                    href={buildUrl(sort, opt.value)}
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.15s',
                      ...(pricing === opt.value ? pillActive : pillIdle),
                    }}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>

              {/* Sort */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap', marginLeft: 'auto' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.125rem' }}>排序：</span>
                {SORT_OPTIONS.map(opt => (
                  <Link
                    key={opt.value}
                    href={buildUrl(opt.value, pricing)}
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.15s',
                      ...(sort === opt.value ? pillActive : pillIdle),
                    }}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Result count */}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {pricing !== 'all'
                ? `筛选出 ${filteredTools.length} / ${rawTools.length} 款工具`
                : `共 ${filteredTools.length} 款工具`}
            </p>

            {/* Tool grid */}
            {filteredTools.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '0.75rem',
              }}>
                {filteredTools.map(tool => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</p>
                <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>该筛选条件下暂无工具</p>
                <Link
                  href={`/category/${slug}`}
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--accent-purple)',
                    textDecoration: 'none',
                  }}
                >
                  清除筛选
                </Link>
              </div>
            )}

            {/* CTA */}
            <div style={{
              margin: '3rem 0 2rem',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.08) 100%)',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: '16px',
              padding: '2.5rem',
              textAlign: 'center',
            }}>
              <h2 style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
                fontFamily: 'var(--font-display)',
              }}>
                没找到合适的{category.name}工具？
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem',
              }}>
                欢迎提交你发现的优质AI工具，帮助更多人找到合适的AI助手
              </p>
              <Link href="/submit" className="btn-primary" style={{ padding: '0.625rem 1.75rem' }}>
                提交工具
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
