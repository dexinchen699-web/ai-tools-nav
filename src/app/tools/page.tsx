import Link from 'next/link'
import { ToolLogo } from '@/components/ToolLogo'
import type { Metadata } from 'next'
import { getAllTools, getAllCategories } from '@/lib/data'
import { Breadcrumb } from '@/components/Breadcrumb'
import type { AITool } from '@/lib/types'

export const metadata: Metadata = {
  title: '全部AI工具 — AI工具导航',
  description: '浏览收录的全部AI工具，支持按分类、定价筛选，按评分和最新排序。',
}

const PRICING_BADGE: Record<string, string> = {
  free: 'badge-free',
  freemium: 'badge-freemium',
  paid: 'badge-paid',
  enterprise: 'badge-enterprise',
}

const PRICING_LABEL: Record<string, string> = {
  free: '免费',
  freemium: '免费+付费',
  paid: '付费',
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
          website={tool.website}
          alt={tool.name}
          width={40}
          height={40}
          className="tool-logo w-10 h-10"
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
              <span className="badge bg-amber-50 text-amber-600 border border-amber-200 text-[10px]">精选</span>
            )}
          </div>
          <span className={`${PRICING_BADGE[tool.pricing]} mt-0.5`}>
            {PRICING_LABEL[tool.pricing]}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed flex-1">{tool.tagline}</p>
      <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
        <StarRating rating={tool.rating} />
        <span className="text-xs text-brand-600 font-medium group-hover:underline">查看详情 →</span>
      </div>
    </Link>
  )
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

  // Filter
  let tools = allTools
  if (query) {
    tools = tools.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.tagline.toLowerCase().includes(query) ||
      t.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }
  if (catFilter !== 'all') {
    tools = tools.filter(t => t.category === catFilter)
  }
  if (pricingFilter !== 'all') {
    tools = tools.filter(t => t.pricing === pricingFilter)
  }

  // Sort
  if (sortKey === 'rating') {
    tools = [...tools].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
  } else if (sortKey === 'reviews') {
    tools = [...tools].sort((a, b) => b.reviewCount - a.reviewCount)
  } else if (sortKey === 'newest') {
    // isNew first, then isFeatured, then by rating
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
    { key: 'all', label: '全部定价' },
    { key: 'free', label: '免费' },
    { key: 'freemium', label: '免费+付费' },
    { key: 'paid', label: '付费' },
    { key: 'enterprise', label: '企业版' },
  ]

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-content py-8">
          <Breadcrumb items={[{ name: '首页', url: '/' }, { name: '全部工具', url: '/tools' }]} />
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900">全部AI工具</h1>
            <p className="text-gray-500 text-sm mt-1">
              共收录 <strong className="text-gray-900">{allTools.length}</strong> 款AI工具，覆盖 {categories.length} 个分类
            </p>
          </div>
        </div>
      </div>

      <div className="container-content py-6">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Category tabs — scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1 flex-1 min-w-0">
            <Link
              href={buildUrl({ cat: 'all' })}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                catFilter === 'all'
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              全部 ({allTools.length})
            </Link>
            {categories.map(cat => (
              <Link
                key={cat.slug}
                href={buildUrl({ cat: cat.slug })}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  catFilter === cat.slug
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-600'
                }`}
              >
                {cat.icon} {cat.name} ({cat.toolCount})
              </Link>
            ))}
          </div>

          {/* Pricing + Sort — right side */}
          <div className="flex gap-2 shrink-0">
            <select
              disabled
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white hidden"
            />
            {/* Pricing filter as links */}
            <div className="flex gap-1">
              {pricingOptions.map(opt => (
                <Link
                  key={opt.key}
                  href={buildUrl({ pricing: opt.key })}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    pricingFilter === opt.key
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sort bar */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            找到 <strong className="text-gray-900">{tools.length}</strong> 款工具
          </p>
          <div className="flex gap-1">
            {sortOptions.map(opt => (
              <Link
                key={opt.key}
                href={buildUrl({ sort: opt.key })}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sortKey === opt.key
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Grid */}
        {tools.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <span className="text-5xl block mb-4">🔍</span>
            <p>没有找到符合条件的工具</p>
            <Link href="/tools" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
              清除筛选
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tools.map(tool => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
