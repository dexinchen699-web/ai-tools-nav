'use client'

import { useEffect, useState } from 'react'

interface Comment {
  id: string
  author_name: string
  content: string
  created_at: string
}

interface Props {
  contentType: 'article' | 'comparison'
  contentSlug: string
}

const LIKED_KEY = (type: string, slug: string) => `liked_${type}_${slug}`

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function LikeCommentSection({ contentType, contentSlug }: Props) {
  const [likeCount, setLikeCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)

  const [comments, setComments] = useState<Comment[]>([])
  const [authorName, setAuthorName] = useState('')
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    setLiked(!!localStorage.getItem(LIKED_KEY(contentType, contentSlug)))
    fetch(`/api/likes?type=${contentType}&slug=${contentSlug}`)
      .then(r => r.json()).then(d => setLikeCount(d.count ?? 0))
    fetch(`/api/comments?type=${contentType}&slug=${contentSlug}`)
      .then(r => r.json()).then(d => setComments(d.comments ?? []))
  }, [contentType, contentSlug])

  async function handleLike() {
    if (liked || likeLoading) return
    setLikeLoading(true)
    const res = await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: contentType, slug: contentSlug }),
    })
    const data = await res.json()
    if (res.ok) {
      setLikeCount(data.count)
      setLiked(true)
      localStorage.setItem(LIKED_KEY(contentType, contentSlug), '1')
    }
    setLikeLoading(false)
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError('')
    if (!authorName.trim() || !commentText.trim()) {
      setSubmitError('请填写昵称和评论内容')
      return
    }
    setSubmitting(true)
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: contentType, slug: contentSlug, author_name: authorName, content: commentText }),
    })
    const data = await res.json()
    if (res.ok) {
      setComments(prev => [data.comment, ...prev])
      setCommentText('')
      setSubmitSuccess(true)
      setTimeout(() => setSubmitSuccess(false), 3000)
    } else {
      setSubmitError(data.error ?? '提交失败，请重试')
    }
    setSubmitting(false)
  }

  return (
    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* 点赞 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={handleLike}
          disabled={liked || likeLoading}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1.25rem', borderRadius: 999, cursor: liked ? 'default' : 'pointer',
            border: `1px solid ${liked ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.12)'}`,
            background: liked ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
            color: liked ? 'var(--accent-purple)' : 'var(--text-secondary)',
            fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s',
          }}
        >
          <span style={{ fontSize: '1rem' }}>{liked ? '♥' : '♡'}</span>
          {liked ? '已点赞' : '觉得有用'}
          <span style={{
            padding: '0.1rem 0.5rem', borderRadius: 999, fontSize: '0.75rem',
            background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)',
          }}>{likeCount}</span>
        </button>
      </div>

      {/* 评论区 */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
          评论 {comments.length > 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8125rem' }}>({comments.length})</span>}
        </h3>

        {/* 评论表单 */}
        <form onSubmit={handleSubmitComment} style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="你的昵称"
            value={authorName}
            onChange={e => setAuthorName(e.target.value)}
            maxLength={30}
            style={{
              padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none',
              fontFamily: 'var(--font-body)',
            }}
          />
          <textarea
            placeholder="写下你的想法..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            maxLength={500}
            rows={3}
            style={{
              padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', resize: 'vertical',
              fontFamily: 'var(--font-body)',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1.25rem' }}
            >
              {submitting ? '提交中...' : '发表评论'}
            </button>
            {submitError && <span style={{ fontSize: '0.8125rem', color: 'var(--accent-pink)' }}>{submitError}</span>}
            {submitSuccess && <span style={{ fontSize: '0.8125rem', color: 'var(--accent-cyan)' }}>评论成功！</span>}
          </div>
        </form>

        {/* 评论列表 */}
        {comments.length === 0 ? (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>暂无评论，来发表第一条吧</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {comments.map(c => (
              <div key={c.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c.author_name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(c.created_at)}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontFamily: 'var(--font-body)', margin: 0 }}>
                  {c.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
