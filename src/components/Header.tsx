'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const NAV_LINKS = [
  { href: '/category/chat',         label: 'AI对话' },
  { href: '/category/image',        label: 'AI绘图' },
  { href: '/category/coding',       label: 'AI编程' },
  { href: '/category/writing',      label: 'AI写作' },
  { href: '/category/video',        label: 'AI视频' },
  { href: '/category/productivity', label: 'AI效率' },
  { href: '/news',                  label: 'AI资讯' },
]

export function Header() {
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q) router.push(`/tools?q=${encodeURIComponent(q)}`)
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container-content lg:pl-56">
        <div className="flex items-center gap-4 h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🤖</span>
            <span className="font-bold text-gray-900 text-base hidden sm:block">AI工具导航</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索AI工具..."
              className="search-input"
            />
          </form>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} className="btn-ghost text-xs font-medium">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Submit tool CTA */}
          <Link href="/submit" className="btn-primary hidden sm:inline-flex flex-shrink-0 text-xs">
            提交工具
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="菜单"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="lg:hidden border-t border-gray-100 py-2 flex flex-wrap gap-1 pb-3">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="btn-ghost text-sm"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/submit" className="btn-primary text-xs ml-auto" onClick={() => setMenuOpen(false)}>
              提交工具
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
