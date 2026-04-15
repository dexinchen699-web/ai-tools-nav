'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

const FEEDBACK_TYPES = [
  { value: 'bug', label: '🐛 页面/功能异常' },
  { value: 'wrong-info', label: '📝 工具信息有误' },
  { value: 'suggest', label: '💡 功能建议' },
  { value: 'other', label: '💬 其他' },
]

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
      // 暂时模拟提交（后续可接入真实 API）
      await new Promise(resolve => setTimeout(resolve, 800))
      setState('success')
    } catch {
      setState('error')
      setErrorMsg('提交失败，请稍后重试')
    }
  }

  if (state === 'success') {
    return (
      <div className="container-content py-16 max-w-lg mx-auto text-center">
        <div className="card p-10">
          <div className="text-5xl mb-4">🙏</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">感谢你的反馈！</h1>
          <p className="text-gray-500 text-sm mb-6">
            我们已收到你的反馈，会尽快处理并改进。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn-primary px-6 py-2.5">返回首页</Link>
            <button
              onClick={() => { setForm({ type: '', content: '', contact: '' }); setState('idle') }}
              className="btn-secondary px-6 py-2.5"
            >
              再提交一条
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white">
        <div className="container-content py-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">问题反馈</h1>
          <p className="text-brand-100 text-sm max-w-md mx-auto">
            遇到问题或有好的建议？告诉我们，帮助我们做得更好
          </p>
        </div>
      </section>

      <div className="container-content py-10 max-w-xl mx-auto pb-16">
        <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              反馈类型 <span className="text-rose-500">*</span>
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-white"
            >
              <option value="">请选择反馈类型</option>
              {FEEDBACK_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              反馈内容 <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              required
              rows={5}
              maxLength={1000}
              placeholder="请详细描述你遇到的问题或建议，包括页面地址、操作步骤等..."
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{form.content.length}/1000</p>
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              联系方式
            </label>
            <input
              type="text"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              placeholder="邮箱或微信，方便我们回复你（选填）"
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
            ) : '提交反馈'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          也可以直接
          <Link href="/submit" className="text-brand-500 hover:underline mx-1">提交新工具</Link>
          或查看
          <Link href="/tutorials" className="text-brand-500 hover:underline mx-1">AI教程</Link>
        </p>
      </div>
    </div>
  )
}
