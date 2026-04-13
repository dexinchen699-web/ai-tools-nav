import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllTools, getToolBySlug, getCategoryBySlug, getRelatedTools, getAllComparisons } from '@/lib/data'
import { JsonLd } from '@/components/JsonLd'
import { Breadcrumb } from '@/components/Breadcrumb'
import { ToolLogo } from '@/components/ToolLogo'

export async function generateStaticParams() {
  const tools = await getAllTools()
  return tools.map(t => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tool = await getToolBySlug(slug)
  if (!tool) return {}
  return {
    title: `${tool.name} 评测 — ${tool.tagline} | AI工具导航`,
    description: tool.description.slice(0, 155),
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

function StarRating({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="flex items-center gap-1 text-amber-400 text-sm">
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
      <span className="text-gray-600 font-medium ml-1">{rating.toFixed(1)}</span>
      {count && <span className="text-gray-400 text-xs">({count} 评价)</span>}
    </span>
  )
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tool = await getToolBySlug(slug)
  if (!tool) notFound()

  const [category, relatedTools, allComparisons] = await Promise.all([
    getCategoryBySlug(tool.category),
    getRelatedTools(tool.slug, 4),
    getAllComparisons(),
  ])

  // Find comparisons that include this tool
  const relatedComparisons = allComparisons.filter(
    c => c.toolASlug === tool.slug || c.toolBSlug === tool.slug
  )

  const breadcrumbs = [
    { name: '首页', url: '/' },
    { name: category?.name ?? tool.category, url: `/category/${tool.category}` },
    { name: tool.name, url: `/tools/${tool.slug}` },
  ]

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.name,
      description: tool.description,
      url: tool.website,
      applicationCategory: 'AIApplication',
      offers: { '@type': 'Offer', price: tool.pricing === 'free' ? '0' : undefined, priceCurrency: 'USD' },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: tool.rating,
        reviewCount: tool.reviewCount,
        bestRating: 5,
      },
    },
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
    ...(tool.faqs?.length ? [{
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: tool.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    }] : []),
    ...(tool.howToSteps?.length ? [{
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `如何使用 ${tool.name}`,
      step: tool.howToSteps.map((step, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: step.name,
        text: step.text,
      })),
    }] : []),
  ]

  const logoSrc = tool.logoUrl || tool.imageUrl || '/images/tools/placeholder.png'

  return (
    <div className="animate-fade-in">
      <JsonLd data={jsonLd} />

      {/* Breadcrumb bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-content py-3">
          <Breadcrumb items={breadcrumbs} />
        </div>
      </div>

      <div className="container-content py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Main Column ── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Hero card */}
            <div className="card p-6">
              <div className="flex items-start gap-4">
                <ToolLogo
                  src={logoSrc}
                  alt={tool.name}
                  width={64}
                  height={64}
                  className="tool-logo w-16 h-16 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900">{tool.name}</h1>
                    {tool.isNew && (
                      <span className="badge bg-rose-50 text-rose-600 border border-rose-200">NEW</span>
                    )}
                    {tool.isFeatured && (
                      <span className="badge bg-amber-50 text-amber-700 border border-amber-200">精选</span>
                    )}
                  </div>
                  <p className="text-gray-500 mt-1 text-sm">{tool.tagline}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <StarRating rating={tool.rating} count={tool.reviewCount} />
                    <span className={PRICING_BADGE[tool.pricing]}>{PRICING_LABEL[tool.pricing]}</span>
                  </div>
                </div>
                <Link
                  href={`/go/${tool.slug}`}
                  className="btn-primary flex-shrink-0 hidden sm:inline-flex items-center gap-1.5"
                >
                  访问官网
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
              <Link
                href={`/go/${tool.slug}`}
                className="btn-primary w-full justify-center mt-4 sm:hidden items-center gap-1.5"
              >
                访问官网
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="section-title mb-3">工具介绍</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{tool.description}</p>
            </div>

            {/* Screenshot */}
            {(tool.screenshotUrl || (tool.imageUrl && !tool.imageUrl.includes('clearbit'))) && (
              <div className="card p-6">
                <h2 className="section-title mb-4">产品截图</h2>
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <img
                    src={tool.screenshotUrl || tool.imageUrl}
                    alt={`${tool.name} 界面截图`}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {/* Features */}
            {tool.features?.length > 0 && (
              <div className="card p-6">
                <h2 className="section-title mb-4">核心功能</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tool.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg">
                      <span className="text-brand-500 mt-0.5 flex-shrink-0">✦</span>
                      <span className="text-sm text-gray-700">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pros & Cons */}
            {(tool.pros?.length > 0 || tool.cons?.length > 0) && (
              <div className="card p-6">
                <h2 className="section-title mb-4">优缺点分析</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tool.pros?.length > 0 && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-1.5">
                        <span>👍</span> 优点
                      </h3>
                      <ul className="space-y-2">
                        {tool.pros.map((p, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-emerald-800">
                            <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {tool.cons?.length > 0 && (
                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-rose-700 mb-3 flex items-center gap-1.5">
                        <span>👎</span> 缺点
                      </h3>
                      <ul className="space-y-2">
                        {tool.cons.map((c, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-rose-800">
                            <span className="text-rose-400 mt-0.5 flex-shrink-0">✗</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* How to use */}
            {tool.howToSteps?.length > 0 && (
              <div className="card p-6">
                <h2 className="section-title mb-4">如何使用</h2>
                <ol className="space-y-3">
                  {tool.howToSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div className="text-sm text-gray-700 leading-relaxed pt-0.5">
                        <span className="font-medium text-gray-900">{step.name}</span>
                        {step.text && <span className="text-gray-600"> — {step.text}</span>}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* FAQ */}
            {tool.faqs?.length > 0 && (
              <div className="card p-6">
                <h2 className="section-title mb-4">常见问题</h2>
                <div className="space-y-4">
                  {tool.faqs.map((faq, i) => (
                    <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Q: {faq.question}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">A: {faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-4">

            {/* Basic info */}
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">基本信息</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">定价</dt>
                  <dd className={PRICING_BADGE[tool.pricing]}>{PRICING_LABEL[tool.pricing]}</dd>
                </div>
                {tool.pricingDetail && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">价格详情</dt>
                    <dd className="text-gray-700 text-right max-w-[160px]">{tool.pricingDetail}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">评分</dt>
                  <dd className="text-amber-500 font-medium">{tool.rating.toFixed(1)} / 5.0</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">分类</dt>
                  <dd>
                    <Link href={`/category/${tool.category}`} className="text-brand-600 hover:underline">
                      {category?.name ?? tool.category}
                    </Link>
                  </dd>
                </div>
              </dl>
              <div className="divider" />
              <Link
                href={`/go/${tool.slug}`}
                className="btn-primary w-full justify-center flex items-center gap-1.5"
              >
                免费试用
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>

            {/* Tags */}
            {tool.tags?.length > 0 && (
              <div className="card p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">标签</h2>
                <div className="flex flex-wrap gap-1.5">
                  {tool.tags.map(tag => (
                    <span key={tag} className="badge bg-gray-100 text-gray-600 border border-gray-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Use cases */}
            {tool.useCases?.length > 0 && (
              <div className="card p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">适用场景</h2>
                <ul className="space-y-2">
                  {tool.useCases.map((uc, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-brand-400 mt-0.5 flex-shrink-0">▸</span>
                      {uc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Compare CTA */}
            <div className="card p-5 bg-brand-50 border-brand-100">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">工具对比</h2>
              <p className="text-xs text-gray-500 mb-3">想知道 {tool.name} 和其他工具的区别？</p>
              {relatedComparisons.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {relatedComparisons.slice(0, 3).map(c => (
                    <Link
                      key={c.slug}
                      href={`/compare/${c.slug}`}
                      className="btn-secondary w-full justify-center text-xs"
                    >
                      {c.title} →
                    </Link>
                  ))}
                </div>
              ) : (
                <Link href="/compare" className="btn-secondary w-full justify-center text-xs">
                  查看对比 →
                </Link>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
