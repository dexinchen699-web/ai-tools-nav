import Link from 'next/link'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'AI文章 — AI工具导航',
  description: '精选 AI 领域深度文章，涵盖工具教程、科普入门、技术解析与行业洞察，持续更新。',
}

const CATEGORY_META: Record<string, { icon: string; label: string; desc: string; accent: string }> = {
  'AI工具教程':  { icon: '◎', label: 'AI 工具教程', desc: '上手指南 · 实操技巧',   accent: 'var(--accent-purple)' },
  'AI科普':      { icon: '◈', label: 'AI 科普',     desc: '大众科普 · 入门必读',   accent: 'var(--accent-cyan)'   },
  'AI技术解析':  { icon: '◉', label: 'AI 技术解析', desc: '原理剖析 · 深度技术',   accent: 'var(--accent-blue)'   },
  'AI行业洞察':  { icon: '◐', label: 'AI 行业洞察', desc: '趋势分析 · 产业动态',   accent: 'var(--accent-pink)'   },
}

interface ArticleRow {
  slug: string
  title: string
  summary: string | null
  category: string | null
  date_published: string | null
  cover_image_url: string | null
  tags: string[] | null
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function ArticlesPage() {
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, title, summary, category, date_published, cover_image_url, tags')
    .eq('is_published', true)
    .order('date_published', { ascending: false })

  const rows: ArticleRow[] = articles ?? []
  const totalCount = rows.length

  // Group by known categories, then "其他" for unmatched
  const knownCats = Object.keys(CATEGORY_META)
  const grouped = knownCats.reduce<Record<string, ArticleRow[]>>((acc, cat) => {
    acc[cat] = rows.filter(r => r.category === cat)
    return acc
  }, {})
  const others = rows.filter(r => !r.category || !knownCats.includes(r.category))

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
          <p className="section-label" style={{ marginBottom: '1rem' }}>ARTICLES / 文章库</p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            marginBottom: '1rem',
          }}>
            深度 AI 内容<br />
            <span className="gradient-text">洞见与解析</span>
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9375rem',
            lineHeight: 1.7,
            fontFamily: 'var(--font-body)',
            maxWidth: '480px',
          }}>
            精选 AI 领域深度文章，涵盖工具教程、科普入门、技术解析与行业洞察
            {totalCount > 0 && (
              <span style={{ color: 'var(--text-muted)' }}>，共 {totalCount} 篇</span>
            )}
          </p>
        </div>
      </section>

      <div className="container-content" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>

        {/* ── By category ── */}
        {knownCats.map(cat => {
          const items = grouped[cat]
          if (!items || items.length === 0) return null
          const meta = CATEGORY_META[cat]
          return (
            <section key={cat} style={{ marginBottom: '2.5rem' }}>
              <SectionHeading label={meta.label} sub={`${meta.icon}  ${meta.desc}`} accent={meta.accent} />
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '0.875rem',
                marginTop: '1.125rem',
              }}>
                {items.map(a => (
                  <ArticleCard key={a.slug} article={a} accent={meta.accent} />
                ))}
              </div>
            </section>
          )
        })}

        {/* ── Others ── */}
        {others.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <SectionHeading label="更多文章" sub="◎  OTHER" accent="var(--accent-purple)" />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '0.875rem',
              marginTop: '1.125rem',
            }}>
              {others.map(a => (
                <ArticleCard key={a.slug} article={a} accent="var(--accent-purple)" />
              ))}
            </div>
          </section>
        )}

        {totalCount === 0 && (
          <div style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>◎</p>
            <p style={{ fontSize: '0.875rem', fontFamily: 'var(--font-body)' }}>文章内容即将上线，敬请期待</p>
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

function ArticleCard({ article, accent }: { article: ArticleRow; accent: string }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="article-card-item"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        borderRadius: '0.875rem',
        background: 'var(--bg-card)',
        border: '1px solid rgba(255,255,255,0.07)',
        textDecoration: 'none',
        transition: 'border-color 0.2s, background 0.2s, transform 0.2s',
        overflow: 'hidden',
      }}
    >
      {/* Cover image */}
      {article.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.cover_image_url}
          alt={article.title}
          style={{
            width: '100%',
            height: '160px',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      )}

      <div style={{ padding: article.cover_image_url ? '0 1.125rem 1.125rem' : '1.125rem', display: 'flex', flexDirection: 'column', gap: '0.625rem', flex: 1 }}>
        {/* Category badge */}
        {article.category && (
          <span style={{
            alignSelf: 'flex-start',
            fontSize: '0.625rem',
            padding: '0.15rem 0.5rem',
            borderRadius: 999,
            border: `1px solid ${accent}40`,
            color: accent,
            fontFamily: 'monospace',
            letterSpacing: '0.05em',
          }}>
            {article.category}
          </span>
        )}

        <h3 style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: 1.45,
        }}>
          {article.title}
        </h3>

        {article.summary && (
          <p style={{
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            fontFamily: 'var(--font-body)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {article.summary}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          {article.date_published ? (
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {formatDate(article.date_published)}
            </span>
          ) : <span />}
          <span style={{ fontSize: '0.6875rem', color: accent, fontFamily: 'monospace', opacity: 0.8 }}>READ →</span>
        </div>
      </div>

      <style>{`
        .article-card-item:hover {
          border-color: rgba(255,255,255,0.14) !important;
          background: rgba(255,255,255,0.06) !important;
          transform: translateY(-3px);
        }
      `}</style>
    </Link>
  )
}
