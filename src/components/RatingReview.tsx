'use client'

import { useEffect, useState, useCallback } from 'react'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
}

interface RatingStats {
  avgRating: number
  count: number
  reviews: Review[]
}

export function RatingReview({ toolSlug, toolName }: { toolSlug: string; toolName: string }) {
  const storageKey = `ai_nav_reviewed_${toolSlug}`

  const [stats, setStats] = useState<RatingStats | null>(null)
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?toolSlug=${encodeURIComponent(toolSlug)}`)
      if (res.ok) setStats(await res.json())
    } catch { /* ignore */ }
  }, [toolSlug])

  useEffect(() => {
    fetchStats()
    setAlreadyReviewed(!!localStorage.getItem(storageKey))
  }, [fetchStats, storageKey])

  async function handleSubmit() {
    if (!selected || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolSlug, rating: selected, comment: comment.trim() || undefined }),
      })
      if (res.ok) {
        localStorage.setItem(storageKey, '1')
        setAlreadyReviewed(true)
        setSubmitted(true)
        setSelected(0)
        setComment('')
        await fetchStats()
      }
    } finally {
      setLoading(false)
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const displayStars = hovered || selected

  return (
    <div
      className="glass-card"
      style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
    >
      <h2 style={{
        fontSize: '1rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-display)',
        margin: 0,
      }}>
        用户评价
      </h2>

      {/* Current stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {stats && stats.count > 0 ? (
          <>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-gold)', lineHeight: 1 }}>
              {stats.avgRating.toFixed(1)}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ color: 'var(--accent-gold)', fontSize: '1.125rem', letterSpacing: '0.05em' }}>
                {'★'.repeat(Math.round(stats.avgRating))}{'☆'.repeat(5 - Math.round(stats.avgRating))}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                共 {stats.count} 条评价
              </span>
            </div>
          </>
        ) : (
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            暂无评价，成为第一个评价 {toolName} 的用户
          </span>
        )}
      </div>

      {/* Rating input */}
      {alreadyReviewed ? (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '0.625rem',
          background: 'rgba(5,150,105,0.06)',
          border: '1px solid rgba(5,150,105,0.2)',
          fontSize: '0.875rem',
          color: '#059669',
        }}>
          ✓ 你已经评价过 {toolName} 了，感谢反馈！
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {/* Stars */}
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setSelected(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                aria-label={`${n} 星`}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.125rem',
                  fontSize: '1.75rem',
                  lineHeight: 1,
                  color: n <= displayStars ? 'var(--accent-gold)' : 'var(--border)',
                  transition: 'color 0.1s, transform 0.1s',
                  transform: n <= displayStars ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                ★
              </button>
            ))}
          </div>

          {/* Comment */}
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="分享你的使用体验...（选填）"
            rows={3}
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              borderRadius: '0.625rem',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-body)',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          <button
            onClick={handleSubmit}
            disabled={!selected || loading}
            className="btn-primary"
            style={{
              alignSelf: 'flex-start',
              padding: '0.5rem 1.25rem',
              fontSize: '0.875rem',
              opacity: !selected || loading ? 0.5 : 1,
              cursor: !selected || loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '提交中...' : submitted ? '已提交 ✓' : '提交评价'}
          </button>
        </div>
      )}

      {/* Review list */}
      {stats && stats.reviews.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div style={{ height: '1px', background: 'var(--border)' }} />
          {stats.reviews.map((r, i) => (
            <div
              key={r.id}
              style={{
                paddingBottom: i < stats.reviews.length - 1 ? '0.875rem' : 0,
                borderBottom: i < stats.reviews.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    匿名用户
                  </span>
                  <span style={{ color: 'var(--accent-gold)', fontSize: '0.875rem' }}>
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formatDate(r.createdAt)}
                </span>
              </div>
              {r.comment && (
                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  margin: 0,
                  fontFamily: 'var(--font-body)',
                }}>
                  {r.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
