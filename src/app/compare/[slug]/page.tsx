import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllComparisons, getComparisonBySlug, getToolBySlug } from '@/lib/data'
import { buildMetadata } from '@/lib/metadata'
import { JsonLd } from '@/components/JsonLd'
import { Breadcrumb } from '@/components/Breadcrumb'
import { buildComparisonSchema } from '@/lib/schema'
import type { AITool } from '@/lib/types'

export const revalidate = 86400 // 24h ISR

export async function generateStaticParams() {
  const comparisons = await getAllComparisons()
  return comparisons.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const cmp = await getComparisonBySlug(slug)
  if (!cmp) return {}
  return buildMetadata({
    title: cmp.title,
    description: cmp.description,
    path: `/compare/${slug}`,
  })
}

function toolStub(slug: string): AITool {
  const name = slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  return {
    id: '',
    slug,
    name,
    tagline: '',
    description: '',
    category: '',
    pricing: 'freemium',
    pricingDetail: '',
    rating: 0,
    reviewCount: 0,
    tags: [],
    pros: [],
    cons: [],
    features: [],
    useCases: [],
    faqs: [],
    howToSteps: [],
    website: '',
    logoUrl: '',
    isFeatured: false,
    isNew: false,
  } as AITool
}

const KNOWN_DOMAINS: Record<string, string> = {
  chatgpt: 'chat.openai.com',
  openai: 'openai.com',
  claude: 'claude.ai',
  gemini: 'gemini.google.com',
  deepseek: 'deepseek.com',
  midjourney: 'midjourney.com',
  'dall-e': 'openai.com',
  'stable-diffusion': 'stability.ai',
  perplexity: 'perplexity.ai',
  cursor: 'cursor.sh',
  'github-copilot': 'github.com',
  copilot: 'github.com',
  grok: 'x.ai',
  llama: 'meta.com',
  mistral: 'mistral.ai',
  notion: 'notion.so',
  grammarly: 'grammarly.com',
  jasper: 'jasper.ai',
  runway: 'runwayml.com',
  sora: 'openai.com',
  pika: 'pika.art',
  elevenlabs: 'elevenlabs.io',
  synthesia: 'synthesia.io',
  heygen: 'heygen.com',
  kling: 'klingai.com',
}

function toolFavicon(slug: string) {
  const domain = KNOWN_DOMAINS[slug] ?? `${slug.replace(/-/g, '')}.com`
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
}

function pricingLabel(p: string) {
  const map: Record<string, string> = {
    free: '免费',
    freemium: '免费+付费',
    paid: '付费',
    enterprise: '企业版',
  }
  return map[p] ?? p
}

function pricingColor(p: string) {
  const map: Record<string, string> = {
    free: 'var(--accent-cyan)',
    freemium: 'var(--accent-purple)',
    paid: 'var(--accent-pink)',
    enterprise: '#f59e0b',
  }
  return map[p] ?? 'var(--text-secondary)'
}

function RatingBar({ value }: { value: number }) {
  const pct = Math.round((value / 5) * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{
        flex: 1,
        height: 6,
        borderRadius: 999,
        background: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: 999,
          background: 'var(--grad-brand)',
        }} />
      </div>
      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', minWidth: '2rem' }}>
        {value > 0 ? value.toFixed(1) : '—'}
      </span>
    </div>
  )
}

export default async function CompareDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cmp = await getComparisonBySlug(slug)
  if (!cmp) notFound()

  const toolA = (await getToolBySlug(cmp.toolASlug)) ?? toolStub(cmp.toolASlug)
  const toolB = (await getToolBySlug(cmp.toolBSlug)) ?? toolStub(cmp.toolBSlug)

  const prosA: string[] = cmp.pros_cons?.tool1_pros ?? toolA.pros ?? []
  const consA: string[] = cmp.pros_cons?.tool1_cons ?? toolA.cons ?? []
  const prosB: string[] = cmp.pros_cons?.tool2_pros ?? toolB.pros ?? []
  const consB: string[] = cmp.pros_cons?.tool2_cons ?? toolB.cons ?? []

  const allFeatures = Array.from(
    new Set([...(toolA.features ?? []), ...(toolB.features ?? [])])
  )

  const schema = buildComparisonSchema({
    title: cmp.title,
    description: cmp.description,
    slug: cmp.slug,
    toolAName: toolA.name,
    toolBName: toolB.name,
    faqs: cmp.faqs,
  })

  const breadcrumbs = [
    { name: '首页', url: '/' },
    { name: 'AI工具对比', url: '/compare' },
    { name: cmp.title, url: '' },
  ]

  return (
    <>
      <JsonLd data={schema} />

      {/* ── Hero ── */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '2.5rem',
        paddingBottom: '2.5rem',
      }}>
        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />
        <div className="glow-orb glow-orb-purple" style={{ top: -80, left: '10%', width: 320, height: 320, opacity: 0.12 }} />
        <div className="glow-orb glow-orb-blue" style={{ bottom: -80, right: '10%', width: 280, height: 280, opacity: 0.1 }} />

        <div className="container-content" style={{ position: 'relative', zIndex: 1 }}>
          <Breadcrumb items={breadcrumbs} />

          {/* VS row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            marginTop: '1.5rem',
            flexWrap: 'wrap',
          }}>
            {[toolA, toolB].map((tool, i) => (
              <span key={tool.slug} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {i > 0 && (
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    padding: '0.25rem 0.625rem',
                    borderRadius: 999,
                    background: 'rgba(139,92,246,0.2)',
                    color: 'var(--accent-purple)',
                    border: '1px solid rgba(139,92,246,0.35)',
                  }}>VS</span>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={toolFavicon(tool.slug)}
                  alt={tool.name}
                  width={40}
                  height={40}
                  style={{ borderRadius: 10, background: 'rgba(255,255,255,0.06)', padding: 4 }}
                />
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{tool.name}</span>
              </span>
            ))}
          </div>

          <h1 style={{
            textAlign: 'center',
            fontSize: '1.125rem',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            marginTop: '0.75rem',
            fontFamily: 'var(--font-body)',
          }}>{cmp.title}</h1>
        </div>
      </div>

      <div className="container-content" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>

        {/* ── Quick Stats ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.875rem',
          marginBottom: '2rem',
        }}>
          {[
            { tool: toolA, slug: cmp.toolASlug },
            { tool: toolB, slug: cmp.toolBSlug },
          ].map(({ tool }) => (
            <div key={tool.slug} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={toolFavicon(tool.slug)} alt={tool.name} width={24} height={24} style={{ borderRadius: 6 }} />
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{tool.name}</span>
              </div>

              {/* Rating */}
              <div>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>综合评分</p>
                <RatingBar value={tool.rating ?? 0} />
              </div>

              {/* Pricing */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>定价</span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.125rem 0.5rem',
                  borderRadius: 999,
                  background: `${pricingColor(tool.pricing ?? '')}18`,
                  color: pricingColor(tool.pricing ?? ''),
                  border: `1px solid ${pricingColor(tool.pricing ?? '')}30`,
                }}>{pricingLabel(tool.pricing ?? '')}</span>
              </div>

              {/* Tagline */}
              {tool.tagline && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontFamily: 'var(--font-body)' }}>
                  {tool.tagline}
                </p>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                {tool.website && (
                  <a href={tool.website} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.875rem' }}>
                    访问官网
                  </a>
                )}
                <Link href={`/tools/${tool.slug}`} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.875rem' }}>
                  查看详情
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* ── Feature Comparison Grid ── */}
        {allFeatures.length > 0 && (
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>功能对比</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>功能</th>
                    {[toolA, toolB].map((t) => (
                      <th key={t.slug} style={{ textAlign: 'center', padding: '0.5rem 0.75rem', color: 'var(--text-primary)', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', minWidth: 100 }}>
                        {t.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allFeatures.map((feat, i) => (
                    <tr key={feat} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>{feat}</td>
                      {[toolA, toolB].map((t) => (
                        <td key={t.slug} style={{ textAlign: 'center', padding: '0.5rem 0.75rem' }}>
                          {(t.features ?? []).includes(feat)
                            ? <span style={{ color: 'var(--accent-cyan)', fontSize: '1rem' }}>✓</span>
                            : <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>—</span>
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Pros & Cons ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '2rem' }}>
          {[
            { tool: toolA, pros: prosA, cons: consA },
            { tool: toolB, pros: prosB, cons: consB },
          ].map(({ tool, pros, cons }) => (
            <div key={tool.slug} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Pros */}
              <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(6,182,212,0.2)' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span>✦</span> {tool.name} 优点
                </h3>
                {pros.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {pros.map((p, i) => (
                      <li key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                        <span style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: 2 }}>+</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>暂无数据</p>
                )}
              </div>

              {/* Cons */}
              <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(236,72,153,0.2)' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-pink)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span>✦</span> {tool.name} 缺点
                </h3>
                {cons.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {cons.map((c, i) => (
                      <li key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                        <span style={{ color: 'var(--accent-pink)', flexShrink: 0, marginTop: 2 }}>−</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>暂无数据</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Verdict ── */}
        {cmp.verdict && (
          <div style={{
            padding: '1.5rem',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.12) 100%)',
            border: '1px solid rgba(139,92,246,0.25)',
            marginBottom: '2rem',
          }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚖️</span> 总结
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, fontFamily: 'var(--font-body)' }}>
              {cmp.verdict}
            </p>
          </div>
        )}

        {/* ── FAQ ── */}
        {cmp.faqs && cmp.faqs.length > 0 && (
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>常见问题</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {cmp.faqs.map((item, i) => (
                <details key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
                  <summary style={{
                    cursor: 'pointer',
                    padding: '0.625rem 0',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    listStyle: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    {item.question}
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>▾</span>
                  </summary>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.7, padding: '0.5rem 0 0.25rem', fontFamily: 'var(--font-body)' }}>
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer row ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Link href="/compare" style={{ fontSize: '0.8125rem', color: 'var(--accent-purple)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            ← 返回对比列表
          </Link>
          {cmp.updatedAt && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              更新于 {new Date(cmp.updatedAt).toLocaleDateString('zh-CN')}
            </span>
          )}
        </div>
      </div>
    </>
  )
}
