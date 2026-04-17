import Link from 'next/link'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'AI教程 — AI工具导航',
  description: '精选 AI 工具使用教程，从入门到进阶，帮你快速掌握 ChatGPT、Midjourney、Claude 等热门 AI 工具。',
}

const CATEGORY_META: Record<string, { icon: string; label: string; desc: string }> = {
  'AI对话': { icon: '◎', label: 'AI 对话', desc: 'ChatGPT · Claude · Gemini' },
  'AI绘图': { icon: '◈', label: 'AI 绘图', desc: 'Midjourney · Stable Diffusion' },
  'AI编程': { icon: '◉', label: 'AI 编程', desc: 'Copilot · Cursor · Codeium' },
  'AI效率': { icon: '◐', label: 'AI 效率', desc: 'Notion AI · 自动化工作流' },
}

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  beginner:     { label: '入门', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  intermediate: { label: '进阶', color: 'text-amber-400',   dot: 'bg-amber-400'   },
  advanced:     { label: '高级', color: 'text-rose-400',    dot: 'bg-rose-400'    },
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
    <div style={{ background: '#0d0d0f', minHeight: '100vh' }}>
      {/* ── Hero ── */}
      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }} className="relative overflow-hidden">
        {/* grid texture */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, opacity: 0.04,
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="container-content relative py-16 px-4">
          <div className="max-w-2xl">
            <p style={{ color: '#f59e0b', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.2em' }} className="mb-4 uppercase">
              TUTORIALS / 教程库
            </p>
            <h1
              style={{
                fontFamily: "'Noto Serif SC', 'Source Han Serif CN', serif",
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 700,
                color: '#f5f0e8',
                lineHeight: 1.15,
                letterSpacing: '-0.01em',
              }}
            >
              掌握 AI 工具<br />
              <span style={{ color: '#f59e0b' }}>从这里开始</span>
            </h1>
            <p style={{ color: 'rgba(245,240,232,0.5)', fontSize: '0.95rem', marginTop: '1rem', lineHeight: 1.7 }}>
              精选实用教程，覆盖对话、绘图、编程、效率四大方向
              {totalCount > 0 && <span style={{ color: 'rgba(245,240,232,0.3)' }}>，共 {totalCount} 篇</span>}
            </p>
          </div>
        </div>
      </section>

      <div className="container-content px-4 py-12 space-y-16">

        {/* ── Featured ── */}
        {featured.length > 0 && (
          <section>
            <SectionHeading label="精选教程" sub="FEATURED" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
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
            <section key={cat}>
              <SectionHeading label={meta.label} sub={meta.icon + '  ' + meta.desc} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
                {items.map(t => (
                  <TutorialCard key={t.slug} tutorial={t} />
                ))}
              </div>
            </section>
          )
        })}

        {totalCount === 0 && (
          <div className="text-center py-24" style={{ color: 'rgba(245,240,232,0.2)' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>◎</p>
            <p style={{ fontSize: '0.875rem' }}>教程内容即将上线，敬请期待</p>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Noto+Sans+SC:wght@400;500&display=swap');

        .tut-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
          text-decoration: none;
          position: relative;
          overflow: hidden;
        }
        .tut-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(245,158,11,0.06) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .tut-card:hover {
          border-color: rgba(245,158,11,0.3);
          background: rgba(255,255,255,0.05);
          transform: translateY(-2px);
        }
        .tut-card:hover::before { opacity: 1; }

        .feat-card {
          background: rgba(245,158,11,0.05);
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
          text-decoration: none;
          position: relative;
          overflow: hidden;
        }
        .feat-card:hover {
          border-color: rgba(245,158,11,0.5);
          background: rgba(245,158,11,0.08);
          transform: translateY(-3px);
        }
      `}</style>
    </div>
  )
}

/* ── Sub-components ── */

function SectionHeading({ label, sub }: { label: string; sub: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
      <h2
        style={{
          fontFamily: "'Noto Serif SC', serif",
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#f5f0e8',
        }}
      >
        {label}
      </h2>
      <span style={{ fontSize: '0.7rem', color: 'rgba(245,240,232,0.3)', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
        {sub}
      </span>
    </div>
  )
}

function FeaturedCard({ tutorial, index }: { tutorial: TutorialRow; index: number }) {
  const diff = DIFFICULTY_CONFIG[tutorial.difficulty] ?? DIFFICULTY_CONFIG.beginner
  const nums = ['①', '②', '③']

  return (
    <Link href={`/tutorials/${tutorial.slug}`} className="feat-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '1.5rem', color: 'rgba(245,158,11,0.4)', fontFamily: 'monospace' }}>
          {nums[index] ?? '★'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem' }} className={diff.color}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', display: 'inline-block' }} className={diff.dot} />
          {diff.label}
        </span>
      </div>

      <h3
        style={{
          fontFamily: "'Noto Serif SC', serif",
          fontSize: '1rem',
          fontWeight: 700,
          color: '#f5f0e8',
          lineHeight: 1.4,
        }}
      >
        {tutorial.title}
      </h3>

      {tutorial.summary && (
        <p style={{ fontSize: '0.8rem', color: 'rgba(245,240,232,0.45)', lineHeight: 1.6 }} className="line-clamp-2">
          {tutorial.summary}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        {tutorial.duration_minutes != null ? (
          <span style={{ fontSize: '0.7rem', color: 'rgba(245,240,232,0.3)', fontFamily: 'monospace' }}>
            {tutorial.duration_minutes} min
          </span>
        ) : <span />}
        <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontFamily: 'monospace' }}>READ →</span>
      </div>
    </Link>
  )
}

function TutorialCard({ tutorial }: { tutorial: TutorialRow }) {
  const diff = DIFFICULTY_CONFIG[tutorial.difficulty] ?? DIFFICULTY_CONFIG.beginner

  return (
    <Link href={`/tutorials/${tutorial.slug}`} className="tut-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <h3
          style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#f5f0e8',
            lineHeight: 1.45,
          }}
        >
          {tutorial.title}
        </h3>
        <span
          style={{
            flexShrink: 0,
            fontSize: '0.65rem',
            padding: '0.15rem 0.5rem',
            borderRadius: '999px',
            border: '1px solid currentColor',
            fontFamily: 'monospace',
          }}
          className={diff.color}
        >
          {diff.label}
        </span>
      </div>

      {tutorial.summary && (
        <p style={{ fontSize: '0.75rem', color: 'rgba(245,240,232,0.35)', lineHeight: 1.6 }} className="line-clamp-2">
          {tutorial.summary}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        {tutorial.duration_minutes != null ? (
          <span style={{ fontSize: '0.68rem', color: 'rgba(245,240,232,0.25)', fontFamily: 'monospace' }}>
            ◷ {tutorial.duration_minutes} min
          </span>
        ) : <span />}
        <span style={{ fontSize: '0.7rem', color: 'rgba(245,158,11,0.6)', fontFamily: 'monospace' }}>→</span>
      </div>
    </Link>
  )
}
