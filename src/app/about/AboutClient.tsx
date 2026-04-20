'use client'

import Link from 'next/link'

const STATS = [
  { value: '200+', label: '收录工具' },
  { value: '20+', label: '工具分类' },
  { value: '每日', label: '内容更新' },
  { value: '免费', label: '永久使用' },
]

const VALUES = [
  {
    emoji: '🎯',
    title: '精选而非堆砌',
    desc: '我们不追求数量，每个收录的工具都经过实际测试，确保对用户真正有价值。',
  },
  {
    emoji: '🇨🇳',
    title: '中文用户优先',
    desc: '所有内容以中文呈现，优先收录支持中文的工具，降低使用门槛。',
  },
  {
    emoji: '🔄',
    title: '持续保持更新',
    desc: 'AI 领域日新月异，我们每天跟踪最新动态，确保信息的时效性和准确性。',
  },
  {
    emoji: '🆓',
    title: '完全免费开放',
    desc: '导航本身永久免费，不设付费墙，让每个人都能平等地发现好工具。',
  },
]

const CRITERIA = [
  '工具需与 AI / 机器学习技术直接相关',
  '有可正常访问的官方网站或产品页面',
  '具备实际可用的功能，非纯概念或演示项目',
  '优先收录支持中文界面或中文内容的工具',
  '免费或有免费试用额度的工具优先展示',
]

export default function AboutClient() {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.15) 50%, rgba(6,182,212,0.1) 100%)',
        borderBottom: '1px solid rgba(139,92,246,0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '64px 24px', textAlign: 'center', position: 'relative' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🤖</div>
          <h1 style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: 12,
            fontFamily: 'var(--font-display)',
          }}>
            关于 AI工具导航
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            我们是一个专注于 AI 工具发现与评测的中文导航站，帮助你在 AI 爆炸时代找到真正好用的工具。
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '36px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, textAlign: 'center' }}>
            {STATS.map(s => (
              <div key={s.label}>
                <div style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  background: 'var(--grad-brand)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: 'var(--font-display)',
                }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Mission */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{
            fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)',
            marginBottom: 16, fontFamily: 'var(--font-display)',
          }}>
            我们的使命
          </h2>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: '24px 28px',
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: 12 }}>
              AI 工具的数量正在以每周数百个的速度增长，但真正好用、适合中文用户的工具却淹没在信息噪音中。
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: 12 }}>
              AI工具导航的使命很简单：
              <strong style={{ color: 'var(--text-primary)' }}>帮你节省筛选时间，直接找到最适合你的 AI 工具。</strong>
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8 }}>
              我们不是工具的搬运工，而是经过筛选和测试的推荐者。每一个收录的工具，都代表我们认为它值得你花时间了解。
            </p>
          </div>
        </section>

        {/* Values */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{
            fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)',
            marginBottom: 16, fontFamily: 'var(--font-display)',
          }}>
            我们的理念
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {VALUES.map(v => (
              <div key={v.title} style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '20px 22px',
                transition: 'border-color 0.2s, background 0.2s',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)'
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(139,92,246,0.3)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card)'
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)'
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{v.emoji}</div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{v.title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Criteria */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{
            fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)',
            marginBottom: 16, fontFamily: 'var(--font-display)',
          }}>
            收录标准
          </h2>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: '24px 28px',
          }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {CRITERIA.map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ color: 'var(--accent-purple)', flexShrink: 0, marginTop: 2 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.08) 100%)',
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: 16,
          padding: '40px 32px',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)',
            marginBottom: 8, fontFamily: 'var(--font-display)',
          }}>
            一起建设更好的导航
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
            发现了好工具？遇到了问题？我们都想听到你的声音。
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/submit" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 24px', borderRadius: 8, fontSize: '0.88rem', fontWeight: 600,
              background: 'var(--grad-brand)', color: '#fff',
              textDecoration: 'none', transition: 'opacity 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '1'}
            >
              提交工具
            </Link>
            <Link href="/feedback" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 24px', borderRadius: 8, fontSize: '0.88rem', fontWeight: 600,
              background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)',
              border: '1px solid rgba(255,255,255,0.12)',
              textDecoration: 'none', transition: 'background 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)'}
            >
              问题反馈
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
