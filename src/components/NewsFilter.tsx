'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { NewsItem, NewsCategory } from '@/lib/types'

// ── Category accent colors (dark-theme tokens) ────────────────────────────────
const CATEGORY_STYLE: Record<NewsCategory, { bg: string; color: string; border: string }> = {
  '行业动态': { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  '产品发布': { bg: 'rgba(16,185,129,0.12)',  color: '#34d399', border: 'rgba(16,185,129,0.3)' },
  '研究论文': { bg: 'rgba(139,92,246,0.12)',  color: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
  '公司新闻': { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  '政策法规': { bg: 'rgba(236,72,153,0.12)',  color: '#f472b6', border: 'rgba(236,72,153,0.3)' },
}

const ALL_CATEGORIES: NewsCategory[] = ['行业动态', '产品发布', '研究论文', '公司新闻', '政策法规']

function toDateKey(iso: string): string { return iso.slice(0, 10) }
function formatGroupDate(key: string): string {
  const [y, m, d] = key.split('-')
  return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`
}
function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

export function NewsFilter({ allNews }: { allNews: NewsItem[] }) {
  const [activeCategory, setActiveCategory] = useState<NewsCategory | null>(null)

  const filtered = activeCategory
    ? allNews.filter(n => n.category === activeCategory)
    : allNews

  // Group by date
  const groups: { dateKey: string; items: NewsItem[] }[] = []
  const groupMap = new Map<string, NewsItem[]>()
  for (const item of filtered) {
    const key = toDateKey(item.publishedAt)
    if (!groupMap.has(key)) {
      groupMap.set(key, [])
      groups.push({ dateKey: key, items: groupMap.get(key)! })
    }
    groupMap.get(key)!.push(item)
  }

  return (
    <div>
      {/* ── Category filter pills ── */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveCategory(null)}
          style={{
            padding: '0.375rem 1rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
            border: activeCategory === null
              ? '1px solid rgba(59,130,246,0.5)'
              : '1px solid rgba(255,255,255,0.1)',
            background: activeCategory === null
              ? 'rgba(59,130,246,0.18)'
              : 'rgba(255,255,255,0.04)',
            color: activeCategory === null
              ? '#60a5fa'
              : 'var(--text-secondary)',
          }}
        >
          全部 ({allNews.length})
        </button>

        {ALL_CATEGORIES.map(cat => {
          const s = CATEGORY_STYLE[cat]
          const isActive = activeCategory === cat
          const count = allNews.filter(n => n.category === cat).length
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(isActive ? null : cat)}
              style={{
                padding: '0.375rem 1rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                border: isActive ? `1px solid ${s.border}` : '1px solid rgba(255,255,255,0.08)',
                background: isActive ? s.bg : 'rgba(255,255,255,0.04)',
                color: isActive ? s.color : 'var(--text-secondary)',
              }}
            >
              {cat} ({count})
            </button>
          )
        })}
      </div>

      {/* ── Date groups ── */}
      {groups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
          <p style={{ fontSize: '0.9rem' }}>暂无相关资讯</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {groups.map(({ dateKey, items }) => (
            <section key={dateKey}>
              {/* Date header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--accent-cyan)',
                  letterSpacing: '0.05em',
                  fontFamily: 'var(--font-display)',
                }}>
                  {formatGroupDate(dateKey)}
                </span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(6,182,212,0.15)' }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {items.length} 条
                </span>
              </div>

              {/* News items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {items.map(item => {
                  const cs = CATEGORY_STYLE[item.category]
                  return (
                    <a
                      key={item.id}
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        padding: '1rem 1.25rem',
                        borderRadius: '10px',
                        background: 'var(--bg-card)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        textDecoration: 'none',
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.3)'
                        ;(e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.06)'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'
                        ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        {/* Time */}
                        <span style={{
                          flexShrink: 0,
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                          marginTop: '0.2rem',
                          fontVariantNumeric: 'tabular-nums',
                          minWidth: '2.5rem',
                        }}>
                          {formatTime(item.publishedAt)}
                        </span>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                            {/* Category badge */}
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              background: cs.bg,
                              color: cs.color,
                              border: `1px solid ${cs.border}`,
                              flexShrink: 0,
                            }}>
                              {item.category}
                            </span>
                            {/* Source */}
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {item.source}
                            </span>
                          </div>

                          {/* Title */}
                          <p style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            lineHeight: 1.5,
                            marginBottom: item.summary ? '0.35rem' : 0,
                          }}>
                            {item.title}
                          </p>

                          {/* Summary */}
                          {item.summary && (
                            <p style={{
                              fontSize: '0.8rem',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.6,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}>
                              {item.summary}
                            </p>
                          )}
                        </div>

                        {/* Arrow */}
                        <span style={{
                          flexShrink: 0,
                          color: 'var(--text-muted)',
                          fontSize: '0.8rem',
                          marginTop: '0.15rem',
                        }}>
                          ↗
                        </span>
                      </div>
                    </a>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
