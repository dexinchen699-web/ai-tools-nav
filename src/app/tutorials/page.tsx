import Link from 'next/link'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'AI教程 — AI工具导航',
  description: '精选 AI 工具使用教程，从入门到进阶，帮你快速掌握 ChatGPT、Midjourney、Claude 等热门 AI 工具。',
}

const CATEGORY_META: Record<string, { icon: string; label: string; desc: string; accent: string }> = {
  'AI对话': { icon: '◎', label: 'AI 对话', desc: 'ChatGPT · Claude · Gemini',         accent: 'var(--accent-purple)' },
  'AI绘图': { icon: '◈', label: 'AI 绘图', desc: 'Midjourney · Stable Diffusion',      accent: 'var(--accent-pink)'   },
  'AI编程': { icon: '◉', label: 'AI 编程', desc: 'Copilot · Cursor · Codeium',         accent: 'var(--accent-cyan)'   },
  'AI效率': { icon: '◐', label: 'AI 效率', desc: 'Notion AI · 自动化工作流',            accent: 'var(--accent-blue)'   },
}

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  beginner:     { label: '入门', color: 'var(--accent-cyan)'   },
  intermediate: { label: '进阶', color: '#f59e0b'              },
  advanced:     { label: '高级', color: 'var(--accent-pink)'   },
}

interface TutorialRow {
  slug: string
  title: string
  summary: string | null
  category: string
  difficulty: string
  duration_minutes: number | null
  is_featured: boolean
}

export default async function TutorialsPage() {
  const { data: tutorials } = await supabase
    .from('tutorials')
    .select('slug, title, summary, category, difficulty, duration_minutes, is_featured')
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  const rows: TutorialRow[] = tutorials ?? []
  const grouped = Object.keys(CATEGORY_META).reduce<Record<string, TutorialRow[]>>((acc, cat) => {
    acc[cat] = rows.filter(r => r.category === cat)
    return acc
  }, {})
  const featured = rows.filter(r => r.is_featured).slice(0, 3)
  const totalCount = rows.length

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <section style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '3rem',
        paddingBottom: '3rem',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />
        <div className="glow-orb glow-orb-purple" style={{ top: -100, left: '5%', width: 360, height: 360, opacity: 0.1 }} />
        <div className="glow-orb glow-orb-blue" style={{ bottom: -80, right: '8%', width: 280, height: 280, opacity: 0.08 }} />

        <div className="container-content" style={{ position: 'relative', zIndex: 1 }}>
          <p className="section-label" style={{ marginBottom: '1rem' }}>TUTORIALS / 教程库</p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            marginBottom: '1rem',
          }}>
            掌握 AI 工具<br />
            <span className="gradient-text">从这里开始</span>
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9375rem',
            lineHeight: 1.7,
            fontFamily: 'var(--font-body)',
            maxWidth: '480px',
          }}>
            精选实用教程，覆盖对话、绘图、编程、效率四大方向
            {totalCount > 0 && (
              <span style={{ color: 'var(--text-muted)' }}>，共 {totalCount} 篇</span>
            )}
          </p>
        </div>
      </section>

      <div className="container-content" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>

        {/* ── Featured ── */}
        {featured.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <SectionHeading label="精选教程" sub="FEATURED" />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
              marginTop: '1.25rem',
            }}>
              {featured.map((t, i) => (
                <FeaturedCard key={t.slug} tutorial={t} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── By category ── */}
        {Object.entries(grouped).map(([cat, items]) => {
          if (items.length === 0) return null
          const meta = CATEGORY_META[cat]
          return (
            <section key={cat} style={{ marginBottom: '2.5rem' }}>
              <SectionHeading label={meta.label} sub={`${meta.icon}  ${meta.desc}`} accent={meta.accent} />
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '0.75rem',
                marginTop: '1rem',
              }}>
                {items.map(t => (
                  <TutorialCard key={t.slug} tutorial={t} accent={meta.accent} />
                ))}
              </div>
            </section>
          )
        })}

        {totalCount === 0 && (
          <div style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>◎</p>
            <p style={{ fontSize: '0.875rem', fontFamily: 'var(--font-body)' }}>教程内容即将上线，敬请期待</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Sub-components ── */

function SectionHeading({ label, sub, accent }: { label: string; sub: string; accent?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.125rem',
        fontWeight: 700,
        color: accent ?? 'var(--text-primary)',
      }}>
        {label}
      </h2>
      <span style={{
        fontSize: '0.6875rem',
        color: 'var(--text-muted)',
        letterSpacing: '0.1em',
        fontFamily: 'monospace',
      }}>
        {sub}
      </span>
    </div>
  )
}

function FeaturedCard({ tutorial, index }: { tutorial: TutorialRow; index: number }) {
  const diff = DIFFICULTY_CONFIG[tutorial.difficulty] ?? DIFFICULTY_CONFIG.beginner
  const nums = ['①', '②', '③']

  return (
    <Link href={`/tutorials/${tutorial.slug}`} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.875rem',
      padding: '1.5rem',
      borderRadius: '0.875rem',
      background: 'rgba(139,92,246,0.06)',
      border: '1px solid rgba(139,92,246,0.2)',
      textDecoration: 'none',
      transition: 'border-color 0.2s, background 0.2s, transform 0.2s',
    }}
      className="feat-tut-card"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '1.375rem', color: 'rgba(139,92,246,0.4)', fontFamily: 'monospace' }}>
          {nums[index] ?? '★'}
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
          fontSize: '0.6875rem', padding: '0.2rem 0.625rem',
          borderRadius: 999, border: `1px solid ${diff.color}40`,
          color: diff.color, fontFamily: 'monospace',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: diff.color, display: 'inline-block' }} />
          {diff.label}
        </span>
      </div>

      <h3 style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.9375rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        lineHeight: 1.4,
      }}>
        {tutorial.title}
      </h3>

      {tutorial.summary && (
        <p style={{
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          fontFamily: 'var(--font-body)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {tutorial.summary}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        {tutorial.duration_minutes != null ? (
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            ◷ {tutorial.duration_minutes} min
          </span>
        ) : <span />}
        <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontFamily: 'monospace' }}>READ →</span>
      </div>

      <style>{`
        .feat-tut-card:hover {
          border-color: rgba(139,92,246,0.45) !important;
          background: rgba(139,92,246,0.1) !important;
          transform: translateY(-3px);
        }
      `}</style>
    </Link>
  )
}

function TutorialCard({ tutorial, accent }: { tutorial: TutorialRow; accent: string }) {
  const diff = DIFFICULTY_CONFIG[tutorial.difficulty] ?? DIFFICULTY_CONFIG.beginner

  return (
    <Link href={`/tutorials/${tutorial.slug}`} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.625rem',
      padding: '1.125rem',
      borderRadius: '0.75rem',
      background: 'var(--bg-card)',
      border: '1px solid rgba(255,255,255,0.07)',
      textDecoration: 'none',
      transition: 'border-color 0.2s, background 0.2s, transform 0.2s',
      position: 'relative',
      overflow: 'hidden',
    }}
      className="tut-card-item"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <h3 style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1.45,
        }}>
          {tutorial.title}
        </h3>
        <span style={{
          flexShrink: 0,
          fontSize: '0.625rem',
          padding: '0.15rem 0.5rem',
          borderRadius: 999,
          border: `1px solid ${diff.color}40`,
          color: diff.color,
          fontFamily: 'monospace',
        }}>
          {diff.label}
        </span>
      </div>

      {tutorial.summary && (
        <p style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          fontFamily: 'var(--font-body)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {tutorial.summary}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        {tutorial.duration_minutes != null ? (
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            ◷ {tutorial.duration_minutes} min
          </span>
        ) : <span />}
        <span style={{ fontSize: '0.6875rem', color: accent, fontFamily: 'monospace', opacity: 0.7 }}>→</span>
      </div>

      <style>{`
        .tut-card-item:hover {
          border-color: rgba(255,255,255,0.14) !important;
          background: rgba(255,255,255,0.06) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </Link>
  )
}
