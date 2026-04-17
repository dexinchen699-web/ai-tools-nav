import type { Metadata } from 'next'
import { getAllNews } from '@/lib/data'
import { NewsFilter } from '@/components/NewsFilter'

export const revalidate = 600

export const metadata: Metadata = {
  title: 'AI 资讯 - 最新人工智能动态 | AI工具导航',
  description: '汇聚 AIBase、量子位、机器之心最新 AI 资讯，每日更新，涵盖行业动态、产品发布、研究论文等。',
}

export default async function NewsPage() {
  const allNews = await getAllNews()

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(180deg, rgba(59,130,246,0.12) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(59,130,246,0.15)',
        padding: '3rem 1rem 2.5rem',
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>

          {/* eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--accent-cyan)',
              background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
              padding: '0.25rem 0.75rem', borderRadius: '999px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              每日自动更新
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1.15,
            marginBottom: '0.75rem',
          }}>
            AI 资讯
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
            来自 <span style={{ color: 'var(--accent-blue)' }}>AIBase</span>
            {' · '}
            <span style={{ color: 'var(--accent-blue)' }}>量子位</span>
            {' · '}
            <span style={{ color: 'var(--accent-blue)' }}>机器之心</span>
            ，涵盖行业动态、产品发布、研究论文等
          </p>

          {/* stats row */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { label: '今日更新', value: allNews.filter(n => n.publishedAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).length + ' 条' },
              { label: '总资讯数', value: allNews.length + ' 条' },
              { label: '信息来源', value: '3 家' },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem 4rem' }}>
        <NewsFilter allNews={allNews} />
      </div>
    </main>
  )
}
