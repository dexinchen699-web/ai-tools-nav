'use client'

import { useState } from 'react'
import Link from 'next/link'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

const CATEGORIES = [
  'AI对话助手', 'AI绘图', 'AI写作', 'AI编程', 'AI视频',
  'AI音频', 'AI效率', 'AI搜索', 'AI教育', 'AI商业', '其他',
]

const PRICING_OPTIONS = [
  { value: 'free', label: '完全免费' },
  { value: 'freemium', label: '免费+付费' },
  { value: 'paid', label: '付费订阅' },
  { value: 'one-time', label: '一次性付费' },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  fontSize: '0.875rem',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
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

export default function SubmitPage() {
  const [form, setForm] = useState({
    toolName: '', website: '', category: '', pricing: '',
    tagline: '', description: '', submitterEmail: '',
  })
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
      await new Promise(resolve => setTimeout(resolve, 900))
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
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '48px 40px',
          textAlign: 'center',
          maxWidth: 440,
          width: '100%',
          boxShadow: '0 4px 24px rgba(26,47,94,0.08)',
        }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>提交成功！</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>
            感谢你的推荐，我们会尽快审核并决定是否收录。
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn-primary" style={{ padding: '9px 22px', fontSize: '0.875rem' }}>
              返回首页
            </Link>
            <button
              onClick={() => { setForm({ toolName: '', website: '', category: '', pricing: '', tagline: '', description: '', submitterEmail: '' }); setState('idle') }}
              className="btn-ghost"
              style={{ padding: '9px 22px', fontSize: '0.875rem', cursor: 'pointer' }}
            >
              再提交一个
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
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(26,47,94,0.06) 0%, transparent 70%)',
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
            提交 AI 工具
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            发现了好用的 AI 工具？推荐给更多人
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Guidelines */}
        <div style={{
          background: 'rgba(37,99,235,0.05)',
          border: '1px solid rgba(37,99,235,0.18)',
          borderRadius: 10,
          padding: '14px 18px',
          marginBottom: 28,
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
        }}>
          <strong style={{ color: 'var(--accent-blue)' }}>收录说明：</strong>
          我们优先收录与 AI 直接相关、有实际可用功能、支持中文的工具。提交后通常在 3 个工作日内完成审核。
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Tool Name */}
          <div>
            <label style={labelStyle}>工具名称 <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="text"
              name="toolName"
              value={form.toolName}
              onChange={handleChange}
              required
              placeholder="例如：ChatGPT"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'var(--accent-navy)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Website */}
          <div>
            <label style={labelStyle}>官方网站 <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
              required
              placeholder="https://example.com"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'var(--accent-navy)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Category + Pricing */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>工具分类 <span style={{ color: '#dc2626' }}>*</span></label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                style={{ ...inputStyle, appearance: 'none' }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent-navy)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              >
                <option value="">选择分类</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>定价模式 <span style={{ color: '#dc2626' }}>*</span></label>
              <select
                name="pricing"
                value={form.pricing}
                onChange={handleChange}
                required
                style={{ ...inputStyle, appearance: 'none' }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent-navy)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              >
                <option value="">选择定价</option>
                {PRICING_OPTIONS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label style={labelStyle}>一句话介绍 <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="text"
              name="tagline"
              value={form.tagline}
              onChange={handleChange}
              required
              placeholder="用一句话描述这个工具的核心功能"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'var(--accent-navy)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>详细描述</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              maxLength={500}
              placeholder="介绍工具的主要功能、适用场景、优缺点等（选填）"
              style={{ ...inputStyle, resize: 'none' }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent-navy)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>
              {form.description.length}/500
            </p>
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>你的邮箱</label>
            <input
              type="email"
              name="submitterEmail"
              value={form.submitterEmail}
              onChange={handleChange}
              placeholder="审核结果通知（选填）"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'var(--accent-navy)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Error */}
          {state === 'error' && (
            <div style={{
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 8,
              padding: '12px 16px',
              fontSize: '0.875rem',
              color: '#dc2626',
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
              background: state === 'submitting' ? 'rgba(26,47,94,0.4)' : 'var(--grad-brand)',
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
            ) : '提交工具'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 20 }}>
          有问题？
          <Link href="/feedback" style={{ color: 'var(--accent-navy)', textDecoration: 'none', margin: '0 4px' }}>联系我们</Link>
        </p>
      </div>
    </div>
  )
}
