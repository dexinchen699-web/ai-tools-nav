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

// ── helpers ───────────────────────────────────────────────────────────────────

const pricingLabel: Record<string, string> = {
  free: '免费',
  freemium: '免费+付费',
  paid: '付费',
  enterprise: '企业版',
}

const pricingColor: Record<string, string> = {
  free:       'bg-emerald-100 text-emerald-700 border-emerald-200',
  freemium:   'bg-amber-100 text-amber-700 border-amber-200',
  paid:       'bg-rose-100 text-rose-700 border-rose-200',
  enterprise: 'bg-violet-100 text-violet-700 border-violet-200',
}

function faviconUrl(website: string) {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(website).hostname}&sz=64`
  } catch {
    return '/images/tools/placeholder.png'
  }
}

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

// ── RatingBar ─────────────────────────────────────────────────────────────────

function RatingBar({ rating, max = 5 }: { rating: number; max?: number }) {
  const pct = Math.round((rating / max) * 100)
  const color = rating >= 4.5 ? '#10b981' : rating >= 4.0 ? '#4f46e5' : rating >= 3.0 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>
        {rating > 0 ? rating.toFixed(1) : '—'}
      </span>
    </div>
  )
}

// ── StatPill ──────────────────────────────────────────────────────────────────

function StatPill({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">{label}</span>
      <span className="text-sm font-bold text-gray-900">{value}</span>
      {sub && <span className="text-[11px] text-gray-400">{sub}</span>}
    </div>
  )
}

// ── FeatureCell ───────────────────────────────────────────────────────────────

function FeatureCell({ value }: { value: boolean | string | undefined }) {
  if (value === true)
    return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold">✓</span>
  if (value === false)
    return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-50 text-gray-300 text-sm">✗</span>
  if (typeof value === 'string' && value)
    return <span className="text-xs text-gray-700 leading-snug">{value}</span>
  return <span className="text-gray-200 text-sm">—</span>
}


// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ComparisonDetailPage({ params }: Props) {
  const { slug } = await params
  const cmp = await getComparisonBySlug(slug)
  if (!cmp) notFound()

  const [toolARaw, toolBRaw] = await Promise.all([
    getToolBySlug(cmp.toolASlug),
    getToolBySlug(cmp.toolBSlug),
  ])

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

  const prosA = cmp.pros_cons?.tool1_pros ?? toolA.pros
  const consA = cmp.pros_cons?.tool1_cons ?? toolA.cons
  const prosB = cmp.pros_cons?.tool2_pros ?? toolB.pros
  const consB = cmp.pros_cons?.tool2_cons ?? toolB.cons

  const hasProsConsA = prosA.length > 0 || consA.length > 0
  const hasProsConsB = prosB.length > 0 || consB.length > 0

  return (
    <>
      <JsonLd data={schema} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-[#0f0f12] relative overflow-hidden">
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* glow blobs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

        <div className="container-content relative py-10 pb-12">
          <Breadcrumb
            items={[
              { name: '首页', url: '/' },
              { name: '工具对比', url: '/compare' },
              { name: cmp.title, url: `/compare/${cmp.slug}` },
            ]}
          />

          {/* Tool icons + VS badge */}
          <div className="flex items-center justify-center gap-5 mt-8 mb-6">
            <div className="flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={faviconUrl(toolA.website)}
                alt={toolA.name}
                width={64}
                height={64}
                className="rounded-2xl ring-2 ring-white/10 shadow-xl"
              />
              <span className="text-white/90 font-bold text-sm tracking-tight">{toolA.name}</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span
                className="text-[11px] font-black tracking-[0.2em] uppercase px-3 py-1 rounded-full border"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  borderColor: 'rgba(99,102,241,0.4)',
                  color: '#fff',
                  boxShadow: '0 0 20px rgba(99,102,241,0.35)',
                }}
              >
                VS
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={faviconUrl(toolB.website)}
                alt={toolB.name}
                width={64}
                height={64}
                className="rounded-2xl ring-2 ring-white/10 shadow-xl"
              />
              <span className="text-white/90 font-bold text-sm tracking-tight">{toolB.name}</span>
            </div>
          </div>

          <h1 className="text-center text-white font-extrabold text-2xl md:text-3xl tracking-tight leading-tight mb-3">
            {cmp.title}
          </h1>
          {cmp.description && (
            <p className="text-center text-white/50 text-sm max-w-xl mx-auto leading-relaxed">
              {cmp.description}
            </p>
          )}
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="container-content py-10 space-y-10">

        {/* ── Quick Stats ──────────────────────────────────────────────── */}
        <section>
          <div className="grid grid-cols-2 gap-4">
            {/* Tool A stats card */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={faviconUrl(toolA.website)} alt={toolA.name} width={28} height={28} className="rounded-lg" />
                <span className="font-bold text-sm text-gray-900">{toolA.name}</span>
                <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded border ${pricingColor[toolA.pricing] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {pricingLabel[toolA.pricing]}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">综合评分</span>
                    <span className="text-[10px] text-gray-400">({toolA.reviewCount} 评价)</span>
                  </div>
                  <RatingBar rating={toolA.rating} />
                </div>

                {toolA.pricingDetail && (
                  <StatPill label="价格详情" value={toolA.pricingDetail} />
                )}

                {toolA.tagline && (
                  <p className="text-xs text-gray-500 leading-relaxed italic">&ldquo;{toolA.tagline}&rdquo;</p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <Link href={`/tools/${toolA.slug}`} className="flex-1 text-center text-xs font-medium py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                  查看详情
                </Link>
                <Link href={toolA.website} target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-xs font-semibold py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                  访问官网 ↗
                </Link>
              </div>
            </div>

            {/* Tool B stats card */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={faviconUrl(toolB.website)} alt={toolB.name} width={28} height={28} className="rounded-lg" />
                <span className="font-bold text-sm text-gray-900">{toolB.name}</span>
                <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded border ${pricingColor[toolB.pricing] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {pricingLabel[toolB.pricing]}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">综合评分</span>
                    <span className="text-[10px] text-gray-400">({toolB.reviewCount} 评价)</span>
                  </div>
                  <RatingBar rating={toolB.rating} />
                </div>

                {toolB.pricingDetail && (
                  <StatPill label="价格详情" value={toolB.pricingDetail} />
                )}

                {toolB.tagline && (
                  <p className="text-xs text-gray-500 leading-relaxed italic">&ldquo;{toolB.tagline}&rdquo;</p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <Link href={`/tools/${toolB.slug}`} className="flex-1 text-center text-xs font-medium py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                  查看详情
                </Link>
                <Link href={toolB.website} target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-xs font-semibold py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                  访问官网 ↗
                </Link>
              </div>
            </div>
          </div>
        </section>


        {/* ── Feature Comparison Grid ───────────────────────────────────── */}
        {(toolA.features.length > 0 || toolB.features.length > 0) && (() => {
          // Build unified feature list
          const allFeatures = Array.from(new Set([...toolA.features, ...toolB.features]))
          const setA = new Set(toolA.features)
          const setB = new Set(toolB.features)
          return (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="section-label">⚡ 功能对比</span>
              </div>
              <div className="card overflow-hidden">
                {/* header row */}
                <div className="grid grid-cols-[1fr_80px_80px] bg-gray-50 border-b border-gray-100 px-4 py-2.5">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">功能</span>
                  <div className="flex items-center gap-1.5 justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={faviconUrl(toolA.website)} alt={toolA.name} width={14} height={14} className="rounded" />
                    <span className="text-[10px] font-bold text-gray-600 truncate">{toolA.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={faviconUrl(toolB.website)} alt={toolB.name} width={14} height={14} className="rounded" />
                    <span className="text-[10px] font-bold text-gray-600 truncate">{toolB.name}</span>
                  </div>
                </div>
                {allFeatures.slice(0, 12).map((feat, i) => (
                  <div
                    key={feat}
                    className={`grid grid-cols-[1fr_80px_80px] px-4 py-2.5 items-center ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} border-b border-gray-50 last:border-0`}
                  >
                    <span className="text-xs text-gray-700 leading-snug">{feat}</span>
                    <div className="flex justify-center">
                      <FeatureCell value={setA.has(feat)} />
                    </div>
                    <div className="flex justify-center">
                      <FeatureCell value={setB.has(feat)} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })()}

        {/* ── Pros & Cons ───────────────────────────────────────────────── */}
        {(hasProsConsA || hasProsConsB) && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="section-label">⚖️ 优势 &amp; 劣势对比</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Tool A pros/cons */}
              <div className="space-y-3">
                {/* A pros */}
                {prosA.length > 0 && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-emerald-100 bg-emerald-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={faviconUrl(toolA.website)} alt={toolA.name} width={14} height={14} className="rounded" />
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">{toolA.name} · 优势</span>
                    </div>
                    <ul className="px-4 py-3 space-y-2">
                      {prosA.slice(0, 4).map((p) => (
                        <li key={p} className="flex items-start gap-2 text-xs text-emerald-800 leading-snug">
                          <span className="mt-0.5 text-emerald-500 shrink-0">✓</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* A cons */}
                {consA.length > 0 && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50/60 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-rose-100 bg-rose-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={faviconUrl(toolA.website)} alt={toolA.name} width={14} height={14} className="rounded" />
                      <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">{toolA.name} · 劣势</span>
                    </div>
                    <ul className="px-4 py-3 space-y-2">
                      {consA.slice(0, 4).map((c) => (
                        <li key={c} className="flex items-start gap-2 text-xs text-rose-800 leading-snug">
                          <span className="mt-0.5 text-rose-400 shrink-0">✗</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Tool B pros/cons */}
              <div className="space-y-3">
                {/* B pros */}
                {prosB.length > 0 && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-emerald-100 bg-emerald-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={faviconUrl(toolB.website)} alt={toolB.name} width={14} height={14} className="rounded" />
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">{toolB.name} · 优势</span>
                    </div>
                    <ul className="px-4 py-3 space-y-2">
                      {prosB.slice(0, 4).map((p) => (
                        <li key={p} className="flex items-start gap-2 text-xs text-emerald-800 leading-snug">
                          <span className="mt-0.5 text-emerald-500 shrink-0">✓</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* B cons */}
                {consB.length > 0 && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50/60 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-rose-100 bg-rose-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={faviconUrl(toolB.website)} alt={toolB.name} width={14} height={14} className="rounded" />
                      <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">{toolB.name} · 劣势</span>
                    </div>
                    <ul className="px-4 py-3 space-y-2">
                      {consB.slice(0, 4).map((c) => (
                        <li key={c} className="flex items-start gap-2 text-xs text-rose-800 leading-snug">
                          <span className="mt-0.5 text-rose-400 shrink-0">✗</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}


        {/* ── Verdict ───────────────────────────────────────────────────── */}
        {cmp.verdict && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="section-label">🏆 编辑结论</span>
            </div>
            <div
              className="relative rounded-2xl overflow-hidden p-6"
              style={{
                background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
                border: '1px solid #c7d2fe',
              }}
            >
              {/* decorative quote mark */}
              <span
                className="absolute top-3 right-5 text-7xl font-black leading-none select-none pointer-events-none"
                style={{ color: 'rgba(99,102,241,0.08)' }}
              >
                &ldquo;
              </span>
              <div className="flex items-start gap-3 relative">
                <span className="text-2xl shrink-0 mt-0.5">🏆</span>
                <p className="text-sm text-indigo-900 leading-relaxed font-medium">{cmp.verdict}</p>
              </div>
            </div>
          </section>
        )}

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        {cmp.faqs && cmp.faqs.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="section-label">💬 常见问题</span>
            </div>
            <div className="space-y-3">
              {cmp.faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group card overflow-hidden"
                >
                  <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none select-none hover:bg-gray-50/80 transition-colors">
                    <span className="text-sm font-semibold text-gray-800 leading-snug">{faq.question}</span>
                    <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-xs font-bold transition-transform group-open:rotate-180">
                      ▾
                    </span>
                  </summary>
                  <div className="px-5 pb-4 pt-0">
                    <div className="h-px bg-gray-100 mb-3" />
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* ── Back link ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Link
            href="/compare"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium"
          >
            ← 返回对比列表
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>更新于</span>
            <span className="font-medium text-gray-500">
              {cmp.updatedAt ? new Date(cmp.updatedAt).toLocaleDateString('zh-CN') : '—'}
            </span>
          </div>
        </div>

      </main>
    </>
  )
}
