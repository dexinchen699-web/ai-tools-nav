'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { Category } from '@/lib/types'

const PRICING_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'free', label: '免费' },
  { value: 'freemium', label: '免费+' },
  { value: 'paid', label: '付费' },
  { value: 'enterprise', label: '企业' },
]

interface Props {
  categories: Category[]
  totalCount: number
}

export default function SearchFilters({ categories, totalCount }: Props) {
  const router = useRouter()
  const params = useSearchParams()

  const currentQ       = params.get('q') ?? ''
  const currentCat     = params.get('category') ?? ''
  const currentPricing = params.get('pricing') ?? ''

  const [inputValue, setInputValue] = useState(currentQ)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync input when URL changes (e.g. browser back/forward)
  useEffect(() => {
    setInputValue(params.get('q') ?? '')
  }, [params])

  function buildUrl(overrides: Record<string, string>) {
    const next = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(overrides)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    return `/search?${next.toString()}`
  }

  function pushQ(value: string) {
    router.push(buildUrl({ q: value }))
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setInputValue(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => pushQ(val), 300)
  }

  function handleInputBlur() {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    pushQ(inputValue)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      pushQ(inputValue)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Search input */}
      <div style={{ position: 'relative' }}>
        <svg
          style={{
            position: 'absolute', left: '0.75rem', top: '50%',
            transform: 'translateY(-50%)', width: '1rem', height: '1rem',
            color: 'var(--text-secondary)', pointerEvents: 'none',
          }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="search"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder="搜索 AI 工具名称、描述、标签…"
          style={{
            width: '100%',
            paddingLeft: '2.5rem',
            paddingRight: '1rem',
            paddingTop: '0.625rem',
            paddingBottom: '0.625rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            color: 'var(--text-primary)',
            fontSize: '0.9375rem',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Category + Pricing row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        {/* Category select */}
        <select
          value={currentCat}
          onChange={e => router.push(buildUrl({ category: e.target.value }))}
          style={{
            padding: '0.5rem 2rem 0.5rem 0.75rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.6rem center',
          }}
        >
          <option value="">全部分类</option>
          {categories.map(cat => (
            <option key={cat.slug} value={cat.slug}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>

        {/* Pricing pills */}
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {PRICING_OPTIONS.map(opt => {
            const active = currentPricing === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => router.push(buildUrl({ pricing: opt.value }))}
                style={{
                  padding: '0.375rem 0.875rem',
                  borderRadius: '9999px',
                  fontSize: '0.8125rem',
                  fontWeight: active ? 600 : 400,
                  border: active ? '1.5px solid var(--accent-navy)' : '1px solid var(--border)',
                  background: active ? 'var(--accent-navy)' : 'var(--bg-card)',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Result count */}
        <span style={{
          marginLeft: 'auto',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          whiteSpace: 'nowrap',
        }}>
          找到 <strong style={{ color: 'var(--text-primary)' }}>{totalCount}</strong> 款工具
        </span>
      </div>
    </div>
  )
}
