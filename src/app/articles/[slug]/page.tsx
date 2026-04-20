import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { buildMetadata } from '@/lib/metadata'
import { Breadcrumb } from '@/components/Breadcrumb'

interface Article {
  id: string
  slug: string
  title: string
  meta_description: string | null
  summary: string | null
  content_html: string | null
  cover_image_url: string | null
  category: string | null
  tags: string[] | null
  date_published: string | null
  is_published: boolean
}

const CATEGORY_ACCENT: Record<string, string> = {
  'AI工具教程': 'var(--accent-purple)',
  'AI科普':     'var(--accent-cyan)',
  'AI技术解析': 'var(--accent-blue)',
  'AI行业洞察': 'var(--accent-pink)',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

export async function generateStaticParams() {
  const { data } = await supabase
    .from('articles')
    .select('slug')
    .eq('is_published', true)
  return (data ?? []).map((row: { slug: string }) => ({ slug: row.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data } = await supabase
    .from('articles')
    .select('title, meta_description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  if (!data) return {}
  return buildMetadata({
    title: data.title,
    description: data.meta_description ?? '',
    path: `/articles/${slug}`,
  })
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single<Article>()

  if (!article) notFound()

  const tags = article.tags ?? []
  const accent = article.category ? (CATEGORY_ACCENT[article.category] ?? 'var(--accent-purple)') : 'var(--accent-purple)'

  const breadcrumbs = [
    { name: '首页', url: '/' },
    { name: '文章', url: '/articles' },
    { name: article.category ?? '文章' },
  ]

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

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
            {article.category && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.6875rem', padding: '0.25rem 0.75rem',
                borderRadius: 999, border: `1px solid ${accent}40`,
                color: accent, fontFamily: 'monospace',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: accent, display: 'inline-block' }} />
                {article.category}
              </span>
            )}
            {article.date_published && (
              <span style={{
                fontSize: '0.6875rem', padding: '0.25rem 0.75rem',
                borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-muted)', fontFamily: 'monospace',
              }}>
                {formatDate(article.date_published)}
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
            {article.title}
          </h1>

          {article.summary && (
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9375rem',
              maxWidth: '600px',
              lineHeight: 1.7,
              fontFamily: 'var(--font-body)',
            }}>
              {article.summary}
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

        {/* Cover image */}
        {article.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.cover_image_url}
            alt={article.title}
            style={{
              width: '100%',
              maxHeight: '420px',
              objectFit: 'cover',
              borderRadius: '0.875rem',
              border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: '2rem',
              display: 'block',
            }}
          />
        )}

        {/* Article content */}
        {article.content_html ? (
          <article
            className="glass-card article-html-content"
            style={{ padding: '1.75rem 2rem', marginBottom: '2rem' }}
            dangerouslySetInnerHTML={{ __html: article.content_html }}
          />
        ) : (
          <div className="glass-card" style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            marginBottom: '2rem',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-body)',
          }}>
            内容即将发布
          </div>
        )}

        {/* Footer nav */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <Link href="/articles" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            fontSize: '0.8125rem', color: 'var(--accent-purple)',
            textDecoration: 'none',
          }}>
            ← 返回文章列表
          </Link>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            {article.category ?? 'ARTICLE'}
          </span>
        </div>
      </div>
    </div>
  )
}
