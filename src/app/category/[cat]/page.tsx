import Link from 'next/link'
import { ToolLogo } from '@/components/ToolLogo'
import { notFound } from 'next/navigation'
import { getAllCategories, getCategoryBySlug, getToolsByCategory } from '@/lib/data'
import { JsonLd } from '@/components/JsonLd'
import { Breadcrumb } from '@/components/Breadcrumb'
import type { AITool } from '@/lib/types'

export async function generateStaticParams() {
  const categories = await getAllCategories()
  return categories.map(c => ({ cat: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params
  const category = await getCategoryBySlug(cat)
  if (!category) return {}
  return {
    title: `${category.name}工具大全 — AI工具导航`,
    description: `精选 ${category.toolCount} 款${category.name}工具，${category.description}`,
  }
}

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

export default async function CategoryPage({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params
  const [category, tools] = await Promise.all([
    getCategoryBySlug(cat),
    getToolsByCategory(cat),
  ])

  if (!category) notFound()

  const breadcrumbs = [
    { name: '首页', url: '/' },
    { name: category.name, url: `/category/${cat}` },
  ]

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.name,
        item: `https://ai-tools-nav.vercel.app${b.url}`,
      })),
    },
  ]

  // Group by pricing for filter display
  const freeCount = tools.filter(t => t.pricing === 'free' || t.pricing === 'freemium').length

  return (
    <div className="animate-fade-in">
      <JsonLd data={jsonLd} />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-content py-8">
          <Breadcrumb items={breadcrumbs} />
          <div className="mt-4 flex items-center gap-4">
            <span className="text-4xl">{category.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{category.name}工具大全</h1>
              <p className="text-gray-500 text-sm mt-1">{category.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 text-sm text-gray-500">
            <span>共 <strong className="text-gray-900">{tools.length}</strong> 款工具</span>
            <span>·</span>
            <span><strong className="text-gray-900">{freeCount}</strong> 款免费/免费试用</span>
          </div>
        </div>
      </div>

      {/* Tool Grid */}
      <div className="container-content py-8">
        {tools.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <span className="text-5xl block mb-4">🔍</span>
            <p>该分类暂无工具，敬请期待</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map(tool => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
