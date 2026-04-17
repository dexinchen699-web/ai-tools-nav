'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const NAV_LINKS = [
  { href: '/compare',   label: '工具对比' },
  { href: '/news',      label: 'AI资讯' },
  { href: '/articles',  label: 'AI文章' },
  { href: '/models',    label: '模型榜单' },
  { href: '/glossary',  label: '术语表' },
  { href: '/tutorials', label: '教程' },
  { href: '/about',     label: '关于' },
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
    <header className="sticky top-0 z-50" style={{ background: 'var(--bg-header)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="container-content">
        <div className="flex items-center gap-4 h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              AI
            </div>
            <span className="font-bold text-white text-sm hidden sm:block tracking-tight">
              工具导航
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-sm relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索 AI 工具..."
              className="search-input"
            />
          </form>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} className="btn-ghost">
                {link.label}
              </Link>
            ))}
            <Link href="/submit" className="ml-2 btn-primary text-xs py-1.5 px-3">
              + 提交工具
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.7)' }}
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
          <nav className="lg:hidden py-3 flex flex-wrap gap-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} className="btn-ghost text-sm" onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/submit" className="btn-primary text-xs py-1.5 px-3" onClick={() => setMenuOpen(false)}>
              + 提交工具
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
