'use client'

import { useState } from 'react'
import Link from 'next/link'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

const FEEDBACK_TYPES = [
  { value: 'bug', label: '🐛 页面/功能异常' },
  { value: 'wrong-info', label: '📝 工具信息有误' },
  { value: 'suggest', label: '💡 功能建议' },
  { value: 'other', label: '💬 其他' },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  fontSize: '0.875rem',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: 'var(--text-primary)',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: 6,
}

export default function FeedbackPage() {
  const [form, setForm] = useState({ type: '', content: '', contact: '' })
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('submitting')
    setErrorMsg('')
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      setState('success')
    } catch {
      setState('error')
      setErrorMsg('提交失败，请稍后重试')
    }
  }

  if (state === 'success') {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '48px 40px',
          textAlign: 'center',
          maxWidth: 440,
          width: '100%',
        }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🙏</div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>感谢你的反馈！</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>
            我们已收到你的反馈，会尽快处理并改进。
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{
              padding: '9px 22px', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600,
              background: 'var(--grad-brand)', color: '#fff', textDecoration: 'none',
            }}>
              返回首页
            </Link>
            <button
              onClick={() => { setForm({ type: '', content: '', contact: '' }); setState('idle') }}
              style={{
                padding: '9px 22px', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600,
                background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)',
                border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer',
              }}
            >
              再提交一条
            </button>
          </div>
        </div>
      </div>
    )
  }

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
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px', textAlign: 'center', position: 'relative' }}>
          <h1 style={{
            fontSize: 'clamp(1.4rem, 3.5vw, 1.9rem)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: 8,
            fontFamily: 'var(--font-display)',
          }}>
            问题反馈
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            遇到问题或有好的建议？告诉我们，帮助我们做得更好
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px 80px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Type */}
          <div>
            <label style={labelStyle}>
              反馈类型 <span style={{ color: '#f87171' }}>*</span>
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              style={{ ...inputStyle, appearance: 'none' }}
              onFocus={e => (e.target.style.borderColor = 'rgba(139,92,246,0.6)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            >
              <option value="" style={{ background: '#0a0a1a' }}>请选择反馈类型</option>
              {FEEDBACK_TYPES.map(t => (
                <option key={t.value} value={t.value} style={{ background: '#0a0a1a' }}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label style={labelStyle}>
              反馈内容 <span style={{ color: '#f87171' }}>*</span>
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              required
              rows={5}
              maxLength={1000}
              placeholder="请详细描述你遇到的问题或建议，包括页面地址、操作步骤等..."
              style={{ ...inputStyle, resize: 'none' }}
              onFocus={e => (e.target.style.borderColor = 'rgba(139,92,246,0.6)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>
              {form.content.length}/1000
            </p>
          </div>

          {/* Contact */}
          <div>
            <label style={labelStyle}>联系方式</label>
            <input
              type="text"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              placeholder="邮箱或微信，方便我们回复你（选填）"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(139,92,246,0.6)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>

          {/* Error */}
          {state === 'error' && (
            <div style={{
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 8,
              padding: '12px 16px',
              fontSize: '0.875rem',
              color: '#f87171',
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={state === 'submitting'}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              fontSize: '0.9rem',
              fontWeight: 600,
              background: state === 'submitting' ? 'rgba(139,92,246,0.5)' : 'var(--grad-brand)',
              color: '#fff',
              border: 'none',
              cursor: state === 'submitting' ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'opacity 0.2s',
            }}
          >
            {state === 'submitting' ? (
              <>
                <svg style={{ animation: 'spin 1s linear infinite', width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                提交中...
              </>
            ) : '提交反馈'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 20 }}>
          也可以直接
          <Link href="/submit" style={{ color: 'var(--accent-purple)', textDecoration: 'none', margin: '0 4px' }}>提交新工具</Link>
          或查看
          <Link href="/tutorials" style={{ color: 'var(--accent-purple)', textDecoration: 'none', margin: '0 4px' }}>AI教程</Link>
        </p>
      </div>
    </div>
  )
}
