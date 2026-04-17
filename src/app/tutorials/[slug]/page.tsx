import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { buildMetadata } from '@/lib/metadata'

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

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; dot: string; border: string }> = {
  beginner:     { label: '入门级', color: '#34d399', dot: '#34d399', border: 'rgba(52,211,153,0.25)'  },
  intermediate: { label: '进阶级', color: '#fbbf24', dot: '#fbbf24', border: 'rgba(251,191,36,0.25)'  },
  advanced:     { label: '高级',   color: '#f87171', dot: '#f87171', border: 'rgba(248,113,113,0.25)' },
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

  return (
    <div style={{ background: '#0d0d0f', minHeight: '100vh', fontFamily: "'Noto Sans SC', sans-serif" }}>

      {/* ── Hero ── */}
      <section
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* grid bg */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, opacity: 0.04,
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* amber glow */}
        <div
          aria-hidden
          style={{
            position: 'absolute', top: '-80px', right: '-80px',
            width: '400px', height: '400px',
            background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container-content relative px-4 py-14">
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            {[
              { href: '/', label: '首页' },
              { href: '/tutorials', label: '教程' },
              { href: null, label: tutorial.category ?? '教程' },
            ].map((item, i, arr) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {item.href ? (
                  <Link
                    href={item.href}
                    style={{ fontSize: '0.75rem', color: 'rgba(245,240,232,0.35)', textDecoration: 'none', fontFamily: 'monospace' }}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'rgba(245,240,232,0.6)', fontFamily: 'monospace' }}>
                    {item.label}
                  </span>
                )}
                {i < arr.length - 1 && (
                  <span style={{ color: 'rgba(245,240,232,0.2)', fontSize: '0.7rem' }}>›</span>
                )}
              </span>
            ))}
          </nav>

          {/* Meta badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {diff && (
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  fontSize: '0.7rem', padding: '0.25rem 0.75rem',
                  borderRadius: '999px', border: `1px solid ${diff.border}`,
                  color: diff.color, fontFamily: 'monospace', letterSpacing: '0.05em',
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: diff.dot, display: 'inline-block' }} />
                {diff.label}
              </span>
            )}
            {tutorial.duration_minutes != null && (
              <span
                style={{
                  fontSize: '0.7rem', padding: '0.25rem 0.75rem',
                  borderRadius: '999px', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(245,240,232,0.4)', fontFamily: 'monospace',
                }}
              >
                ◷ {tutorial.duration_minutes} min
              </span>
            )}
            {steps.length > 0 && (
              <span
                style={{
                  fontSize: '0.7rem', padding: '0.25rem 0.75rem',
                  borderRadius: '999px', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(245,240,232,0.4)', fontFamily: 'monospace',
                }}
              >
                {steps.length} 步骤
              </span>
            )}
          </div>

          <h1
            style={{
              fontFamily: "'Noto Serif SC', 'Source Han Serif CN', serif",
              fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
              fontWeight: 700,
              color: '#f5f0e8',
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
              maxWidth: '720px',
              marginBottom: '1rem',
            }}
          >
            {tutorial.title}
          </h1>

          {tutorial.summary && (
            <p style={{ color: 'rgba(245,240,232,0.5)', fontSize: '0.95rem', maxWidth: '600px', lineHeight: 1.7 }}>
              {tutorial.summary}
            </p>
          )}

          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.25rem' }}>
              {tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    fontSize: '0.68rem', padding: '0.2rem 0.6rem',
                    borderRadius: '4px', background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(245,240,232,0.35)', fontFamily: 'monospace',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Body ── */}
      <div className="container-content px-4 py-12">
        <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>

          {/* ── Sidebar TOC ── */}
          {steps.length > 0 && (
            <aside
              style={{
                width: '200px',
                flexShrink: 0,
                position: 'sticky',
                top: '2rem',
                display: 'none',
              }}
              className="tut-sidebar"
            >
              <p
                style={{
                  fontSize: '0.65rem', color: 'rgba(245,240,232,0.25)',
                  letterSpacing: '0.15em', fontFamily: 'monospace',
                  textTransform: 'uppercase', marginBottom: '1rem',
                }}
              >
                CONTENTS
              </p>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {steps.map((step, i) => (
                  <a
                    key={i}
                    href={`#step-${i}`}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                      padding: '0.4rem 0.5rem', borderRadius: '6px',
                      textDecoration: 'none', transition: 'background 0.15s',
                    }}
                    className="toc-link"
                  >
                    <span
                      style={{
                        flexShrink: 0, width: '18px', height: '18px',
                        borderRadius: '50%', border: '1px solid rgba(245,158,11,0.3)',
                        color: 'rgba(245,158,11,0.6)', fontSize: '0.6rem',
                        fontFamily: 'monospace', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginTop: '1px',
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem', color: 'rgba(245,240,232,0.35)',
                        lineHeight: 1.4,
                      }}
                    >
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
              <section style={{ marginBottom: '3rem' }}>
                <h2
                  style={{
                    fontFamily: "'Noto Serif SC', serif",
                    fontSize: '1.1rem', fontWeight: 700,
                    color: '#f5f0e8', marginBottom: '2rem',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                  }}
                >
                  <span
                    style={{
                      width: '3px', height: '1.1rem',
                      background: 'linear-gradient(to bottom, #f59e0b, #d97706)',
                      borderRadius: '2px', display: 'inline-block',
                    }}
                  />
                  操作步骤
                </h2>

                <div style={{ position: 'relative' }}>
                  {/* vertical line */}
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute', left: '19px', top: '20px',
                      bottom: '20px', width: '1px',
                      background: 'linear-gradient(to bottom, rgba(245,158,11,0.4), rgba(245,158,11,0.05))',
                    }}
                  />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {steps.map((step, i) => (
                      <div
                        key={i}
                        id={`step-${i}`}
                        style={{ display: 'flex', gap: '1.25rem', scrollMarginTop: '2rem' }}
                      >
                        {/* Number bubble */}
                        <div
                          style={{
                            flexShrink: 0, width: '38px', height: '38px',
                            borderRadius: '50%',
                            background: 'rgba(245,158,11,0.1)',
                            border: '1px solid rgba(245,158,11,0.35)',
                            color: '#f59e0b',
                            fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative', zIndex: 1,
                          }}
                        >
                          {i + 1}
                        </div>

                        {/* Step card */}
                        <div
                          style={{
                            flex: 1, minWidth: 0,
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '10px',
                            padding: '1.25rem 1.5rem',
                            transition: 'border-color 0.2s',
                          }}
                          className="step-card"
                        >
                          <h3
                            style={{
                              fontFamily: "'Noto Sans SC', sans-serif",
                              fontSize: '0.9rem', fontWeight: 500,
                              color: '#f5f0e8', marginBottom: '0.6rem',
                            }}
                          >
                            {step.title}
                          </h3>
                          <p
                            style={{
                              fontSize: '0.82rem',
                              color: 'rgba(245,240,232,0.45)',
                              lineHeight: 1.75,
                              whiteSpace: 'pre-line',
                            }}
                          >
                            {step.content}
                          </p>
                          {step.image_url && (
                            <img
                              src={step.image_url}
                              alt={step.title}
                              style={{
                                marginTop: '1rem', borderRadius: '8px',
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
              <section
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px',
                  padding: '2rem',
                  marginBottom: '2.5rem',
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Noto Serif SC', serif",
                    fontSize: '1.1rem', fontWeight: 700,
                    color: '#f5f0e8', marginBottom: '1.5rem',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                  }}
                >
                  <span
                    style={{
                      width: '3px', height: '1.1rem',
                      background: 'linear-gradient(to bottom, #a78bfa, #7c3aed)',
                      borderRadius: '2px', display: 'inline-block',
                    }}
                  />
                  详细说明
                </h2>
                <div
                  style={{ fontSize: '0.875rem', color: 'rgba(245,240,232,0.5)', lineHeight: 1.8 }}
                  dangerouslySetInnerHTML={{ __html: simpleMarkdown(tutorial.content_md) }}
                />
              </section>
            )}

            {/* Footer nav */}
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Link
                href="/tutorials"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  fontSize: '0.8rem', color: 'rgba(245,240,232,0.35)',
                  textDecoration: 'none', fontFamily: 'monospace',
                  transition: 'color 0.15s',
                }}
                className="back-link"
              >
                ← 返回教程列表
              </Link>
              <span style={{ fontSize: '0.7rem', color: 'rgba(245,240,232,0.2)', fontFamily: 'monospace' }}>
                {tutorial.category ?? 'TUTORIAL'}
              </span>
            </div>
          </main>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Noto+Sans+SC:wght@400;500&display=swap');

        @media (min-width: 1024px) {
          .tut-sidebar { display: block !important; }
        }

        .toc-link:hover {
          background: rgba(245,158,11,0.06);
        }
        .toc-link:hover span:first-child {
          border-color: rgba(245,158,11,0.6);
          color: #f59e0b;
        }
        .toc-link:hover span:last-child {
          color: rgba(245,240,232,0.6);
        }

        .step-card:hover {
          border-color: rgba(245,158,11,0.2);
        }

        .back-link:hover {
          color: #f59e0b;
        }
      `}</style>
    </div>
  )
}
