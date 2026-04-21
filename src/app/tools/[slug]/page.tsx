import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllTools, getToolBySlug, getCategoryBySlug, getAllComparisons } from '@/lib/data'
import { supabase } from '@/lib/supabase'
import { JsonLd } from '@/components/JsonLd'
import { ToolLogo } from '@/components/ToolLogo'
import { generatedTools } from '@/data/generated_data'
import { RatingReview } from '@/components/RatingReview'
import { FavoriteButton } from '@/components/FavoriteButton'

export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const { data } = await supabase.from('tools').select('slug')
    if (data?.length) return data.map((r: { slug: string }) => ({ slug: r.slug }))
  } catch { /* fall through */ }
  return generatedTools.map(t => ({ slug: t.slug }))
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

const PRICING_LABEL: Record<string, string> = {
  free: '免费',
  freemium: '免费+付费',
  paid: '付费',
  enterprise: '企业版',
}

const PRICING_COLOR: Record<string, string> = {
  free: '#059669',
  freemium: 'var(--accent-blue)',
  paid: '#d97706',
  enterprise: 'var(--accent-navy)',
}

function StarRating({ rating, count }: { rating: number; count?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
      <span style={{ color: '#f59e0b' }}>
        {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
      </span>
      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{rating.toFixed(1)}</span>
      {count && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({count})</span>}
    </span>
  )
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tool = await getToolBySlug(slug)
  if (!tool) notFound()

  const [category, allComparisons] = await Promise.all([
    getCategoryBySlug(tool.category),
    getAllComparisons(),
  ])

  const relatedComparisons = allComparisons.filter(
    c => c.toolASlug === tool.slug || c.toolBSlug === tool.slug
  )

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.name,
      description: tool.description,
      url: tool.website,
      applicationCategory: 'AIApplication',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: tool.rating,
        reviewCount: tool.reviewCount,
        bestRating: 5,
      },
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
  ]

  const pricingColor = PRICING_COLOR[tool.pricing] ?? 'var(--accent-navy)'

  return (
    <div className="animate-fade-in">
      <JsonLd data={jsonLd} />

      {/* Breadcrumb */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container-content" style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>首页</Link>
            <span>/</span>
            <Link href={`/category/${tool.category}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              {category?.name ?? tool.category}
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--text-secondary)' }}>{tool.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-content" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* ── Hero card ── */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
              <ToolLogo
                website={tool.website}
                alt={tool.name}
                width={72}
                height={72}
                className="tool-logo"
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                  <h1 style={{
                    fontSize: '1.625rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.02em',
                  }}>
                    {tool.name}
                  </h1>
                  {tool.isNew && (
                    <span className="badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.25)' }}>NEW</span>
                  )}
                  {tool.isFeatured && (
                    <span className="badge" style={{ background: 'rgba(201,168,76,0.12)', color: 'var(--accent-gold)', border: '1px solid rgba(201,168,76,0.3)' }}>精选</span>
                  )}
                </div>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontFamily: 'var(--font-body)' }}>
                  {tool.tagline}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <StarRating rating={tool.rating} count={tool.reviewCount} />
                  <span style={{
                    padding: '0.2rem 0.625rem',
                    borderRadius: 999,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: 'var(--bg-secondary)',
                    color: pricingColor,
                    border: '1px solid var(--border)',
                  }}>
                    {PRICING_LABEL[tool.pricing]}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <FavoriteButton slug={tool.slug} />
                <Link
                  href={`/go/${tool.slug}`}
                  className="btn-primary"
                  style={{ padding: '0.625rem 1.5rem', fontSize: '0.875rem' }}
                >
                  访问官网 ↗
                </Link>
              </div>
            </div>
          </div>

          {/* ── Two-column layout ── */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Main column */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Description */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.875rem', fontFamily: 'var(--font-display)' }}>
                  工具介绍
                </h2>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                  {tool.description}
                </p>
              </div>

              {/* Screenshot */}
              {(tool.screenshotUrl || (tool.imageUrl && !tool.imageUrl.includes('clearbit'))) && (
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
                    产品截图
                  </h2>
                  <div style={{ borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img
                      src={tool.screenshotUrl || tool.imageUrl}
                      alt={`${tool.name} 界面截图`}
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                      loading="lazy"
                    />
                  </div>
                </div>
              )}

              {/* Features */}
              {tool.features?.length > 0 && (
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
                    核心功能
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.625rem' }}>
                    {tool.features.map((f, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                        padding: '0.75rem',
                        borderRadius: '0.625rem',
                        background: 'rgba(26,47,94,0.04)',
                        border: '1px solid var(--border)',
                      }}>
                        <span style={{ color: 'var(--accent-navy)', flexShrink: 0, marginTop: 2 }}>✦</span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pros & Cons */}
              {(tool.pros?.length > 0 || tool.cons?.length > 0) && (
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
                    优缺点分析
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                    {tool.pros?.length > 0 && (
                      <div style={{
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        background: 'rgba(5,150,105,0.05)',
                        border: '1px solid rgba(5,150,105,0.2)',
                      }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#059669', marginBottom: '0.75rem' }}>👍 优点</h3>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {tool.pros.map((p, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                              <span style={{ color: '#059669', flexShrink: 0 }}>✓</span>{p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {tool.cons?.length > 0 && (
                      <div style={{
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        background: 'rgba(239,68,68,0.05)',
                        border: '1px solid rgba(239,68,68,0.2)',
                      }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#dc2626', marginBottom: '0.75rem' }}>👎 缺点</h3>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {tool.cons.map((c, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                              <span style={{ color: '#dc2626', flexShrink: 0 }}>✗</span>{c}
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
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
                    如何使用
                  </h2>
                  <ol style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    {tool.howToSteps.map((step, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                        <span style={{
                          flexShrink: 0,
                          width: 28, height: 28,
                          borderRadius: '50%',
                          background: 'rgba(26,47,94,0.08)',
                          border: '1px solid rgba(26,47,94,0.2)',
                          color: 'var(--accent-navy)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {i + 1}
                        </span>
                        <div style={{ paddingTop: '0.25rem', fontFamily: 'var(--font-body)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{step.name}</span>
                          {step.text && <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}> — {step.text}</span>}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* FAQ */}
              {tool.faqs?.length > 0 && (
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
                    常见问题
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {tool.faqs.map((faq, i) => (
                      <div key={i} style={{
                        paddingBottom: '1rem',
                        borderBottom: i < tool.faqs.length - 1 ? '1px solid var(--border)' : 'none',
                      }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-body)' }}>
                          Q: {faq.question}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, fontFamily: 'var(--font-body)' }}>
                          A: {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating & Reviews */}
              <RatingReview toolSlug={tool.slug} toolName={tool.name} />
            </div>

            {/* Sidebar */}
            <aside style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Basic info */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>基本信息</h2>
                <dl style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <dt style={{ color: 'var(--text-muted)' }}>定价</dt>
                    <dd style={{ color: pricingColor, fontWeight: 600 }}>{PRICING_LABEL[tool.pricing]}</dd>
                  </div>
                  {tool.pricingDetail && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <dt style={{ color: 'var(--text-muted)', flexShrink: 0 }}>价格</dt>
                      <dd style={{ color: 'var(--text-secondary)', textAlign: 'right' }}>{tool.pricingDetail}</dd>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <dt style={{ color: 'var(--text-muted)' }}>评分</dt>
                    <dd style={{ color: '#f59e0b', fontWeight: 600 }}>{tool.rating.toFixed(1)} / 5.0</dd>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <dt style={{ color: 'var(--text-muted)' }}>分类</dt>
                    <dd>
                      <Link href={`/category/${tool.category}`} style={{ color: 'var(--accent-navy)', textDecoration: 'none', fontSize: '0.8125rem' }}>
                        {category?.name ?? tool.category}
                      </Link>
                    </dd>
                  </div>
                </dl>
                <div className="divider" />
                <Link
                  href={`/go/${tool.slug}`}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', width: '100%', padding: '0.625rem' }}
                >
                  免费试用 ↗
                </Link>
              </div>

              {/* Pricing tiers */}
              {(tool as any).pricingTiers?.length > 0 && (
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.875rem' }}>产品定价</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {(tool as any).pricingTiers.map((tier: { name: string; price: string; features: string[] }, i: number) => (
                      <div key={i} style={{
                        padding: '0.75rem',
                        borderRadius: '0.625rem',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-secondary)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>{tier.name}</span>
                          <span style={{ color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.8125rem' }}>{tier.price}</span>
                        </div>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {tier.features.map((f, j) => (
                            <li key={j} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                              <span style={{ color: '#059669' }}>✓</span>{f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {tool.tags?.length > 0 && (
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>标签</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {tool.tags.map(tag => (
                      <span key={tag} className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Use cases */}
              {tool.useCases?.length > 0 && (
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>适用场景</h2>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {tool.useCases.map((uc, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                        <span style={{ color: 'var(--accent-blue)', flexShrink: 0 }}>▸</span>{uc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Compare CTA */}
              <div className="glass-card" style={{ padding: '1.25rem', background: 'rgba(26,47,94,0.04)', border: '1px solid rgba(26,47,94,0.12)' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>工具对比</h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.875rem', fontFamily: 'var(--font-body)' }}>
                  想知道 {tool.name} 和其他工具的区别？
                </p>
                {relatedComparisons.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {relatedComparisons.slice(0, 3).map(c => (
                      <Link
                        key={c.slug}
                        href={`/compare/${c.slug}`}
                        className="btn-ghost"
                        style={{ display: 'block', textAlign: 'center', fontSize: '0.75rem', padding: '0.5rem' }}
                      >
                        {c.title} →
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link href="/compare" className="btn-ghost" style={{ display: 'block', textAlign: 'center', fontSize: '0.75rem', padding: '0.5rem' }}>
                    查看对比 →
                  </Link>
                )}
              </div>

            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
