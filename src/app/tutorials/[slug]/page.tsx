import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { buildMetadata } from '@/lib/metadata'
import { Breadcrumb } from '@/components/Breadcrumb'

interface Step {
  title: string
  content: string
  image_url?: string
}

interface Tutorial {
  id: string
  slug: string
  title: string
  meta_description: string | null
  category: string | null
  tool_slug: string | null
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null
  duration_minutes: number | null
  cover_image_url: string | null
  summary: string | null
  content_md: string | null
  steps: Step[] | null
  tags: string[] | null
  is_featured: boolean
  is_published: boolean
  created_at: string
  updated_at: string
}

export const revalidate = 86400 // 24h ISR

export async function generateStaticParams() {
  const { data } = await supabase
    .from('tutorials')
    .select('slug')
    .eq('is_published', true)
  return (data ?? []).map((row: { slug: string }) => ({ slug: row.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data } = await supabase
    .from('tutorials')
    .select('title, meta_description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  if (!data) return {}
  return buildMetadata({ title: data.title, description: data.meta_description ?? undefined })
}

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; border: string }> = {
  beginner:     { label: '入门级', color: 'var(--accent-cyan)',   border: 'rgba(6,182,212,0.25)'   },
  intermediate: { label: '进阶级', color: '#f59e0b',              border: 'rgba(245,158,11,0.25)'  },
  advanced:     { label: '高级',   color: 'var(--accent-pink)',   border: 'rgba(236,72,153,0.25)'  },
}

function simpleMarkdown(md: string): string {
  return '<p>' + md.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>'
}

export default async function TutorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: tutorial } = await supabase
    .from('tutorials')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single<Tutorial>()

  if (!tutorial) notFound()

  const diff = tutorial.difficulty ? DIFFICULTY_CONFIG[tutorial.difficulty] : DIFFICULTY_CONFIG.beginner
  const steps = tutorial.steps ?? []
  const tags = tutorial.tags ?? []

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ai-tools-nav-two.vercel.app'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: tutorial.title,
    description: tutorial.meta_description ?? tutorial.summary ?? '',
    url: `${BASE_URL}/tutorials/${tutorial.slug}`,
    ...(tutorial.duration_minutes && {
      totalTime: `PT${tutorial.duration_minutes}M`,
    }),
    ...(tutorial.cover_image_url && { image: tutorial.cover_image_url }),
    ...(steps.length > 0 && {
      step: steps.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.title,
        text: s.content,
        ...(s.image_url && { image: s.image_url }),
      })),
    }),
  }

  const breadcrumbs = [
    { name: '首页', url: '/' },
    { name: '教程', url: '/tutorials' },
    { name: tutorial.category ?? '教程' },
  ]

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ── */}
      <section style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '2.5rem',
        paddingBottom: '2.5rem',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />
        <div className="glow-orb glow-orb-purple" style={{ top: -80, right: '5%', width: 360, height: 360, opacity: 0.1 }} />

        <div className="container-content" style={{ position: 'relative', zIndex: 1 }}>
          <Breadcrumb items={breadcrumbs} />

          {/* Meta badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.25rem', marginBottom: '1rem' }}>
            {diff && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.6875rem', padding: '0.25rem 0.75rem',
                borderRadius: 999, border: `1px solid ${diff.border}`,
                color: diff.color, fontFamily: 'monospace',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: diff.color, display: 'inline-block' }} />
                {diff.label}
              </span>
            )}
            {tutorial.duration_minutes != null && (
              <span style={{
                fontSize: '0.6875rem', padding: '0.25rem 0.75rem',
                borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-muted)', fontFamily: 'monospace',
              }}>
                ◷ {tutorial.duration_minutes} min
              </span>
            )}
            {steps.length > 0 && (
              <span style={{
                fontSize: '0.6875rem', padding: '0.25rem 0.75rem',
                borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-muted)', fontFamily: 'monospace',
              }}>
                {steps.length} 步骤
              </span>
            )}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.25,
            letterSpacing: '-0.01em',
            maxWidth: '720px',
            marginBottom: '0.875rem',
          }}>
            {tutorial.title}
          </h1>

          {tutorial.summary && (
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9375rem',
              maxWidth: '600px',
              lineHeight: 1.7,
              fontFamily: 'var(--font-body)',
            }}>
              {tutorial.summary}
            </p>
          )}

          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
              {tags.map(tag => (
                <span key={tag} style={{
                  fontSize: '0.6875rem', padding: '0.2rem 0.6rem',
                  borderRadius: 4, background: 'rgba(255,255,255,0.05)',
                  color: 'var(--text-muted)', fontFamily: 'monospace',
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Body ── */}
      <div className="container-content" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>

          {/* ── Sidebar TOC ── */}
          {steps.length > 0 && (
            <aside style={{
              width: '200px',
              flexShrink: 0,
              position: 'sticky',
              top: '2rem',
              display: 'none',
            }} className="tut-sidebar">
              <p style={{
                fontSize: '0.625rem', color: 'var(--text-muted)',
                letterSpacing: '0.15em', fontFamily: 'monospace',
                textTransform: 'uppercase', marginBottom: '0.875rem',
              }}>
                CONTENTS
              </p>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {steps.map((step, i) => (
                  <a key={i} href={`#step-${i}`} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                    padding: '0.375rem 0.5rem', borderRadius: 6,
                    textDecoration: 'none', transition: 'background 0.15s',
                  }} className="toc-link">
                    <span style={{
                      flexShrink: 0, width: 18, height: 18,
                      borderRadius: '50%', border: '1px solid rgba(139,92,246,0.3)',
                      color: 'var(--accent-purple)', fontSize: '0.5625rem',
                      fontFamily: 'monospace', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginTop: 1,
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {step.title}
                    </span>
                  </a>
                ))}
              </nav>
            </aside>
          )}

          {/* ── Main content ── */}
          <main style={{ flex: 1, minWidth: 0 }}>

            {/* Steps timeline */}
            {steps.length > 0 && (
              <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem', fontWeight: 700,
                  color: 'var(--text-primary)', marginBottom: '1.75rem',
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                }}>
                  <span style={{
                    width: 3, height: '1rem',
                    background: 'var(--grad-brand)',
                    borderRadius: 2, display: 'inline-block',
                  }} />
                  操作步骤
                </h2>

                <div style={{ position: 'relative' }}>
                  {/* vertical line */}
                  <div aria-hidden style={{
                    position: 'absolute', left: 19, top: 20,
                    bottom: 20, width: 1,
                    background: 'linear-gradient(to bottom, rgba(139,92,246,0.4), rgba(139,92,246,0.05))',
                  }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {steps.map((step, i) => (
                      <div key={i} id={`step-${i}`} style={{ display: 'flex', gap: '1.125rem', scrollMarginTop: '2rem' }}>
                        {/* Number bubble */}
                        <div style={{
                          flexShrink: 0, width: 38, height: 38,
                          borderRadius: '50%',
                          background: 'rgba(139,92,246,0.1)',
                          border: '1px solid rgba(139,92,246,0.35)',
                          color: 'var(--accent-purple)',
                          fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          position: 'relative', zIndex: 1,
                        }}>
                          {i + 1}
                        </div>

                        {/* Step card */}
                        <div className="glass-card step-card" style={{ flex: 1, minWidth: 0, padding: '1.125rem 1.375rem' }}>
                          <h3 style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.875rem', fontWeight: 600,
                            color: 'var(--text-primary)', marginBottom: '0.5rem',
                          }}>
                            {step.title}
                          </h3>
                          <p style={{
                            fontSize: '0.8125rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.75,
                            whiteSpace: 'pre-line',
                            fontFamily: 'var(--font-body)',
                          }}>
                            {step.content}
                          </p>
                          {step.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={step.image_url}
                              alt={step.title}
                              style={{
                                marginTop: '0.875rem', borderRadius: 8,
                                border: '1px solid rgba(255,255,255,0.08)',
                                maxWidth: '100%',
                              }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Full content */}
            {tutorial.content_md && (
              <section className="glass-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem', fontWeight: 700,
                  color: 'var(--text-primary)', marginBottom: '1.25rem',
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                }}>
                  <span style={{
                    width: 3, height: '1rem',
                    background: 'linear-gradient(to bottom, var(--accent-purple), var(--accent-blue))',
                    borderRadius: 2, display: 'inline-block',
                  }} />
                  详细说明
                </h2>
                <div
                  style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8, fontFamily: 'var(--font-body)' }}
                  dangerouslySetInnerHTML={{ __html: simpleMarkdown(tutorial.content_md) }}
                />
              </section>
            )}

            {/* Footer nav */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              <Link href="/tutorials" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                fontSize: '0.8125rem', color: 'var(--accent-purple)',
                textDecoration: 'none',
              }}>
                ← 返回教程列表
              </Link>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                {tutorial.category ?? 'TUTORIAL'}
              </span>
            </div>
          </main>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .tut-sidebar { display: block !important; }
        }
        .toc-link:hover { background: rgba(139,92,246,0.06); }
        .step-card:hover { border-color: rgba(139,92,246,0.25) !important; }
      `}</style>
    </div>
  )
}
