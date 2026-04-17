import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllComparisons, getComparisonBySlug, getToolBySlug } from '@/lib/data'
import { buildMetadata } from '@/lib/metadata'
import { JsonLd } from '@/components/JsonLd'
import { Breadcrumb } from '@/components/Breadcrumb'
import { buildComparisonSchema } from '@/lib/schema'
import type { AITool } from '@/lib/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const comparisons = await getAllComparisons()
  return comparisons.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cmp = await getComparisonBySlug(slug)
  if (!cmp) return {}
  return buildMetadata({
    title: cmp.title,
    description: cmp.description,
    path: `/compare/${cmp.slug}`,
  })
}

// ── helpers ──────────────────────────────────────────────────────────────────

const pricingLabel: Record<string, string> = {
  free: '免费',
  freemium: '免费+付费',
  paid: '付费',
  enterprise: '企业版',
}

function pricingBadgeClass(pricing: string) {
  return `badge badge-${pricing}`
}

function faviconUrl(website: string) {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(website).hostname}&sz=64`
  } catch {
    return '/images/tools/placeholder.png'
  }
}

// ── sub-components ────────────────────────────────────────────────────────────

function ToolHeroCard({ tool }: { tool: AITool }) {
  return (
    <div className="card card-p flex flex-col items-center text-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={faviconUrl(tool.website)} alt={tool.name} width={56} height={56} className="tool-logo" />
      <div>
        <h2 className="font-bold text-lg">{tool.name}</h2>
        <p className="text-xs text-gray-500 mt-0.5">{tool.tagline}</p>
      </div>
      <span className={pricingBadgeClass(tool.pricing)}>{pricingLabel[tool.pricing]}</span>
      <div className="flex items-center gap-1 text-sm">
        <span className="text-yellow-400">★</span>
        <span className="font-medium">{tool.rating.toFixed(1)}</span>
        <span className="text-gray-400 text-xs">({tool.reviewCount})</span>
      </div>
      <Link href={`/tools/${tool.slug}`} className="btn-ghost text-xs w-full text-center">
        查看详情
      </Link>
      <Link href={`/go/${tool.slug}`} className="btn-primary text-xs w-full text-center">
        访问官网 ↗
      </Link>
    </div>
  )
}

function CompareRow({ label, a, b }: { label: string; a: React.ReactNode; b: React.ReactNode }) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-3 pr-4 text-xs text-gray-500 font-medium w-24 align-top">{label}</td>
      <td className="py-3 pr-4 text-sm align-top">{a}</td>
      <td className="py-3 text-sm align-top">{b}</td>
    </tr>
  )
}

function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <span key={t} className="badge">{t}</span>
      ))}
    </div>
  )
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex gap-1.5 text-xs text-gray-700">
          <span className="text-green-500 mt-0.5">✓</span>
          {item}
        </li>
      ))}
    </ul>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default async function ComparisonDetailPage({ params }: Props) {
  const { slug } = await params
  const cmp = await getComparisonBySlug(slug)
  if (!cmp) notFound()

  const [toolARaw, toolBRaw] = await Promise.all([
    getToolBySlug(cmp.toolASlug),
    getToolBySlug(cmp.toolBSlug),
  ])

  // Build minimal stub for tools not yet in the database
  function toolStub(slug: string): AITool {
    const name = slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    return {
      id: slug, slug, name, tagline: '', description: '',
      category: '', tags: [], website: `https://${slug.replace(/-/g, '')}.com`,
      pricing: 'freemium', pricingDetail: '', rating: 0, reviewCount: 0,
      features: [], pros: [], cons: [], useCases: [], faqs: [], howToSteps: [],
      imageUrl: '/images/tools/placeholder.png', logoUrl: '/images/tools/placeholder.png',
      createdAt: '', updatedAt: '', isFeatured: false, isNew: false,
    }
  }

  const toolA = toolARaw ?? toolStub(cmp.toolASlug)
  const toolB = toolBRaw ?? toolStub(cmp.toolBSlug)

  const schema = buildComparisonSchema({
    title: cmp.title,
    description: cmp.description,
    slug: cmp.slug,
    toolAName: toolA.name,
    toolBName: toolB.name,
    faqs: cmp.faqs,
  })

  return (
    <>
      <JsonLd data={schema} />
      <main className="container-content py-10">
        <Breadcrumb
          items={[
            { name: '首页', url: '/' },
            { name: '工具对比', url: '/compare' },
            { name: cmp.title, url: `/compare/${cmp.slug}` },
          ]}
        />

        <h1 className="section-title mt-4 mb-2">{cmp.title}</h1>
        <p className="text-gray-500 text-sm mb-8">{cmp.description}</p>

        {/* Hero cards */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <ToolHeroCard tool={toolA} />
          <ToolHeroCard tool={toolB} />
        </div>

        {/* Comparison table */}
        <section className="mb-10">
          <h2 className="font-semibold text-base mb-4">功能对比</h2>
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-2 pr-4 text-left text-xs text-gray-400 font-normal w-24">维度</th>
                  <th className="py-2 pr-4 text-left text-sm font-semibold">{toolA.name}</th>
                  <th className="py-2 text-left text-sm font-semibold">{toolB.name}</th>
                </tr>
              </thead>
              <tbody>
                <CompareRow
                  label="定价"
                  a={<span className={pricingBadgeClass(toolA.pricing)}>{pricingLabel[toolA.pricing]}</span>}
                  b={<span className={pricingBadgeClass(toolB.pricing)}>{pricingLabel[toolB.pricing]}</span>}
                />
                <CompareRow
                  label="价格详情"
                  a={<span className="text-gray-600">{toolA.pricingDetail}</span>}
                  b={<span className="text-gray-600">{toolB.pricingDetail}</span>}
                />
                <CompareRow
                  label="评分"
                  a={
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      {toolA.rating.toFixed(1)}
                      <span className="text-gray-400 text-xs">({toolA.reviewCount})</span>
                    </span>
                  }
                  b={
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      {toolB.rating.toFixed(1)}
                      <span className="text-gray-400 text-xs">({toolB.reviewCount})</span>
                    </span>
                  }
                />
                <CompareRow label="标签" a={<TagList tags={toolA.tags} />} b={<TagList tags={toolB.tags} />} />
                <CompareRow
                  label="核心功能"
                  a={<CheckList items={toolA.features.slice(0, 4)} />}
                  b={<CheckList items={toolB.features.slice(0, 4)} />}
                />
                <CompareRow
                  label="适用场景"
                  a={<CheckList items={toolA.useCases.slice(0, 3)} />}
                  b={<CheckList items={toolB.useCases.slice(0, 3)} />}
                />
              </tbody>
            </table>
          </div>
        </section>

        {/* Pros / Cons */}
        {(toolA.pros.length > 0 || toolB.pros.length > 0 || toolA.cons.length > 0 || toolB.cons.length > 0) && (
          <section className="mb-10">
            <h2 className="font-semibold text-base mb-4">优势 &amp; 劣势对比</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Tool A */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={faviconUrl(toolA.website)} alt={toolA.name} width={20} height={20} className="rounded" />
                  <span className="font-semibold text-sm">{toolA.name}</span>
                </div>
                {toolA.pros.length > 0 && (
                  <div className="card card-p border-l-4 border-green-400 bg-green-50">
                    <p className="text-xs font-semibold text-green-700 mb-2 uppercase tracking-wide">优势</p>
                    <ul className="space-y-1.5">
                      {toolA.pros.slice(0, 4).map((item, i) => (
                        <li key={i} className="flex gap-2 text-xs text-gray-700">
                          <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {toolA.cons.length > 0 && (
                  <div className="card card-p border-l-4 border-red-300 bg-red-50">
                    <p className="text-xs font-semibold text-red-600 mb-2 uppercase tracking-wide">劣势</p>
                    <ul className="space-y-1.5">
                      {toolA.cons.slice(0, 4).map((item, i) => (
                        <li key={i} className="flex gap-2 text-xs text-gray-700">
                          <span className="text-red-400 shrink-0 mt-0.5">✗</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Tool B */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={faviconUrl(toolB.website)} alt={toolB.name} width={20} height={20} className="rounded" />
                  <span className="font-semibold text-sm">{toolB.name}</span>
                </div>
                {toolB.pros.length > 0 && (
                  <div className="card card-p border-l-4 border-green-400 bg-green-50">
                    <p className="text-xs font-semibold text-green-700 mb-2 uppercase tracking-wide">优势</p>
                    <ul className="space-y-1.5">
                      {toolB.pros.slice(0, 4).map((item, i) => (
                        <li key={i} className="flex gap-2 text-xs text-gray-700">
                          <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {toolB.cons.length > 0 && (
                  <div className="card card-p border-l-4 border-red-300 bg-red-50">
                    <p className="text-xs font-semibold text-red-600 mb-2 uppercase tracking-wide">劣势</p>
                    <ul className="space-y-1.5">
                      {toolB.cons.slice(0, 4).map((item, i) => (
                        <li key={i} className="flex gap-2 text-xs text-gray-700">
                          <span className="text-red-400 shrink-0 mt-0.5">✗</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Verdict */}
        {cmp.verdict && (
          <section className="mb-10">
            <h2 className="font-semibold text-base mb-3">总结建议</h2>
            <div className="card card-p bg-brand-50 border-brand-100">
              <p className="text-sm text-gray-700 leading-relaxed">{cmp.verdict}</p>
            </div>
          </section>
        )}

        {/* FAQs */}
        {cmp.faqs && cmp.faqs.length > 0 && (
          <section className="mb-10">
            <h2 className="font-semibold text-base mb-4">常见问题</h2>
            <div className="space-y-4">
              {cmp.faqs.map((faq, i) => (
                <div key={i} className="card card-p">
                  <p className="font-medium text-sm mb-1">{faq.question}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Back link */}
        <div className="divider" />
        <Link href="/compare" className="btn-ghost text-sm">
          ← 返回对比列表
        </Link>
      </main>
    </>
  )
}
