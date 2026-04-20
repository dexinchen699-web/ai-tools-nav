export const dynamic = 'force-dynamic'

import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllComparisons } from '@/lib/data'

export const metadata: Metadata = {
  title: 'AI工具对比 — AI工具导航',
  description: '对比主流AI工具的功能、价格和适用场景，帮你快速找到最适合的AI工具。',
}

function slugToName(slug: string) {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
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
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
}

export default async function ComparePage() {
  const comparisons = await getAllComparisons()

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="glow-orb glow-orb-blue" style={{ top: -60, right: '15%', width: 280, height: 280, opacity: 0.1 }} />
        <div className="container-content" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
          <p className="section-label">COMPARE</p>
          <h1 className="section-title" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>AI 工具对比</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
            精选热门 AI 工具横向对比，帮你快速做出选择。共 <strong style={{ color: 'var(--text-primary)' }}>{comparisons.length}</strong> 篇对比
          </p>
        </div>
      </div>

      <div className="container-content" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        {comparisons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>⚖️</span>
            <p>暂无对比内容，敬请期待。</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '0.875rem',
          }}>
            {comparisons.map((cmp) => {
              const chips = [cmp.toolASlug, cmp.toolBSlug].map((s) => ({
                slug: s,
                name: slugToName(s),
                favicon: toolFavicon(s),
              }))
              return (
                <Link
                  key={cmp.slug}
                  href={`/compare/${cmp.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="glass-card" style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.875rem',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    height: '100%',
                  }}>
                    {/* Tool chips */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {chips.map((chip, i) => (
                        <span key={chip.slug} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          {i > 0 && (
                            <span style={{
                              fontSize: '0.625rem',
                              fontWeight: 800,
                              letterSpacing: '0.05em',
                              padding: '0.125rem 0.375rem',
                              borderRadius: 999,
                              background: 'rgba(139,92,246,0.15)',
                              color: 'var(--accent-purple)',
                              border: '1px solid rgba(139,92,246,0.25)',
                            }}>VS</span>
                          )}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={chip.favicon} alt={chip.name} width={18} height={18} style={{ borderRadius: 4 }} />
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{chip.name}</span>
                        </span>
                      ))}
                    </div>

                    {/* Description */}
                    <p style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontFamily: 'var(--font-body)',
                    }}>
                      {cmp.description}
                    </p>

                    {/* CTA */}
                    <span style={{
                      marginTop: 'auto',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--accent-purple)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}>
                      查看对比 →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{
          marginTop: '3rem',
          padding: '1.5rem',
          borderRadius: '1rem',
          border: '1px dashed rgba(255,255,255,0.1)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontFamily: 'var(--font-body)' }}>
            没找到你想要的对比？
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            更多对比内容持续更新中，也欢迎在工具详情页点击「对比」发起对比。
          </p>
        </div>
      </div>
    </div>
  )
}
