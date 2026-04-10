import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllCategories, getCategoryBySlug, getToolsByCategory, getAllTools } from '@/lib/data'
import { buildCategoryMetadata } from '@/lib/metadata'
import { Breadcrumb } from '@/components/Breadcrumb'
import { ToolLogo } from '@/components/ToolLogo'
import { JsonLd } from '@/components/JsonLd'
import { CategoryNavSidebar } from '@/components/CategoryNavSidebar'
import type { AITool } from '@/lib/types'

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

// ── Shared constants ──────────────────────────────────────────────────────────

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

// ── Sub-components ────────────────────────────────────────────────────────────

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
            {tool.isFeatured && (
              <span className="badge bg-amber-50 text-amber-700 border border-amber-200 text-[10px]">精选</span>
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

// ── Sort + filter logic (server-side via searchParams) ────────────────────────

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

// ── Page ──────────────────────────────────────────────────────────────────────

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
    SORT_OPTIONS.some(o => o.value === sortParam)
      ? (sortParam as SortKey)
      : 'featured'

  const pricing: PricingFilter =
    PRICING_FILTERS.some(o => o.value === pricingParam)
      ? (pricingParam as PricingFilter)
      : 'all'

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

  return (
    <div className="animate-fade-in">
      <JsonLd data={jsonLd} />

      {/* ── Full-width layout: sidebar + content ── */}
      <div className="container-content">
        <div className="flex gap-6 items-start">

          {/* ── Left: full-height sticky category nav ── */}
          <CategoryNavSidebar
            categories={allCategories}
            totalCount={allTools.length}
            activeSlug={slug}
          />

          {/* ── Right: breadcrumb + hero + filter + grid ── */}
          <div className="flex-1 min-w-0">

            {/* Breadcrumb */}
            <div className="py-3 border-b border-gray-100">
              <Breadcrumb items={breadcrumbs} />
            </div>

            {/* Category hero */}
            <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white rounded-xl mt-4 px-6 py-8">
              <div className="flex items-center gap-4">
                <span className="text-5xl">{category.icon}</span>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{category.name}工具大全</h1>
                  <p className="text-brand-100 text-sm mt-1">{category.description}</p>
                  <p className="text-brand-200 text-xs mt-1">共收录 {rawTools.length} 款工具</p>
                </div>
              </div>
            </div>

            {/* Mobile category pills */}
            <div className="lg:hidden mt-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {allCategories.map(cat => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      cat.slug === slug
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-brand-50 hover:text-brand-600'
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Filter / sort bar */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 mb-4">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-gray-500 mr-1">定价：</span>
                {PRICING_FILTERS.map(opt => (
                  <Link
                    key={opt.value}
                    href={buildUrl(sort, opt.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      pricing === opt.value
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-1.5 sm:ml-auto flex-wrap">
                <span className="text-xs text-gray-500 mr-1">排序：</span>
                {SORT_OPTIONS.map(opt => (
                  <Link
                    key={opt.value}
                    href={buildUrl(opt.value, pricing)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      sort === opt.value
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Result count */}
            <p className="text-xs text-gray-400 mb-4">
              {pricing !== 'all'
                ? `筛选出 ${filteredTools.length} / ${rawTools.length} 款工具`
                : `共 ${filteredTools.length} 款工具`}
            </p>

            {/* Tool grid */}
            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredTools.map(tool => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-sm">该筛选条件下暂无工具</p>
                <Link href={`/category/${slug}`} className="mt-3 inline-block text-brand-600 text-sm hover:underline">
                  清除筛选
                </Link>
              </div>
            )}

            {/* CTA */}
            <div className="mt-10 mb-8 bg-gradient-to-r from-brand-50 to-blue-50 border border-brand-100 rounded-2xl p-8 text-center">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                没找到合适的{category.name}工具？
              </h2>
              <p className="text-gray-500 text-sm mb-5">
                欢迎提交你发现的优质AI工具，帮助更多人找到合适的AI助手
              </p>
              <Link href="/submit" className="btn-primary px-6 py-2.5">
                提交工具
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
