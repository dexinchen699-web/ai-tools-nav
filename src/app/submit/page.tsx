'use client'

import { useState } from 'react'
import Link from 'next/link'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

const CATEGORIES = [
  { value: 'ai-writing', label: 'AI 写作' },
  { value: 'ai-image', label: 'AI 图像生成' },
  { value: 'ai-video', label: 'AI 视频' },
  { value: 'ai-audio', label: 'AI 音频' },
  { value: 'ai-code', label: 'AI 编程' },
  { value: 'ai-chat', label: 'AI 对话' },
  { value: 'ai-search', label: 'AI 搜索' },
  { value: 'ai-productivity', label: 'AI 效率' },
  { value: 'ai-design', label: 'AI 设计' },
  { value: 'ai-data', label: 'AI 数据分析' },
  { value: 'other', label: '其他' },
]

const PRICING_OPTIONS = [
  { value: 'free', label: '免费' },
  { value: 'freemium', label: '免费 + 付费' },
  { value: 'paid', label: '付费' },
  { value: 'enterprise', label: '企业版' },
]

export default function SubmitPage() {
  const [form, setForm] = useState({
    toolName: '',
    website: '',
    category: '',
    pricing: '',
    tagline: '',
    description: '',
    submitterEmail: '',
  })
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    setState('submitting')
    setErrorMsg('')

    try {
      const website = form.website.startsWith('http://') || form.website.startsWith('https://')
        ? form.website
        : `https://${form.website}`
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, website }),
      })

      let data: { error?: string; success?: boolean }
      try {
        data = await res.json()
      } catch {
        throw new Error(`服务器响应异常 (${res.status})`)
      }

      if (!res.ok) throw new Error(data.error || `提交失败 (${res.status})`)
      setState('success')
    } catch (err) {
      setState('error')
      setErrorMsg(err instanceof Error ? err.message : '提交失败，请稍后重试')
    }
  }

  if (state === 'success') {
    return (
      <div className="animate-fade-in">
        <div className="container-content py-16 max-w-lg mx-auto text-center">
          <div className="card p-10">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">提交成功！</h1>
            <p className="text-gray-500 text-sm mb-6">
              感谢你的推荐，我们会尽快审核并收录这个工具。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/" className="btn-primary px-6 py-2.5">
                返回首页
              </Link>
              <button
                onClick={() => { setForm({ toolName: '', website: '', category: '', pricing: '', tagline: '', description: '', submitterEmail: '' }); setState('idle') }}
                className="btn-secondary px-6 py-2.5"
              >
                再提交一个
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white">
        <div className="container-content py-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">提交 AI 工具</h1>
          <p className="text-brand-100 text-sm max-w-md mx-auto">
            发现了好用的 AI 工具？推荐给大家，帮助更多人找到合适的 AI 助手
          </p>
        </div>
      </section>

      <div className="container-content py-10 max-w-2xl mx-auto">
        {/* Guidelines */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-700">
          <p className="font-semibold mb-1">📋 收录标准</p>
          <ul className="space-y-1 text-blue-600 text-xs">
            <li>• 工具需与 AI / 机器学习相关</li>
            <li>• 需有可访问的官方网站</li>
            <li>• 审核通过后通常在 3-5 个工作日内上线</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
          {/* Tool Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              工具名称 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="toolName"
              value={form.toolName}
              onChange={handleChange}
              required
              placeholder="例如：ChatGPT"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              官方网站 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={handleChange}
              required
              placeholder="example.com 或 https://example.com"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          {/* Category + Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                分类 <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-white"
              >
                <option value="">请选择分类</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                定价模式 <span className="text-rose-500">*</span>
              </label>
              <select
                name="pricing"
                value={form.pricing}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-white"
              >
                <option value="">请选择</option>
                {PRICING_OPTIONS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              一句话介绍 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="tagline"
              value={form.tagline}
              onChange={handleChange}
              required
              maxLength={100}
              placeholder="用一句话描述这个工具的核心功能"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              详细描述
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              maxLength={500}
              placeholder="介绍工具的主要功能、适用场景、特色亮点等（选填）"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/500</p>
          </div>

          {/* Submitter Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              你的邮箱
            </label>
            <input
              type="email"
              name="submitterEmail"
              value={form.submitterEmail}
              onChange={handleChange}
              placeholder="收录后我们会通知你（选填）"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          {/* Error */}
          {state === 'error' && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 text-sm text-rose-600">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={state === 'submitting'}
            className="btn-primary w-full justify-center py-3 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {state === 'submitting' ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                提交中...
              </span>
            ) : '提交工具'}
          </button>
        </form>
      </div>
    </div>
  )
}
