'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, Menu, X, Sparkles } from 'lucide-react'

const NAV_LINKS = [
  { href: '/tools',     label: 'AI工具' },
  { href: '/compare',   label: '对比评测' },
  { href: '/tutorials', label: '教程' },
  { href: '/articles',  label: '文章' },
  { href: '/news',      label: '资讯' },
]

export default function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [search,   setSearch]     = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      window.location.href = `/tools?q=${encodeURIComponent(search.trim())}`
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_0_0_#e8e6e0] py-0'
          : 'bg-[#FAFAF8]/90 backdrop-blur-sm py-0'
      }`}
    >
      <div className="container-content">
        <div className="flex items-center h-14 gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-7 h-7 rounded-lg bg-[#1a2f5e] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Sparkles className="w-3.5 h-3.5 text-[#c9a84c]" />
            </div>
            <span
              className="text-[0.9375rem] font-bold text-[#1a2f5e] tracking-tight"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              AI导航
            </span>
          </Link>

          {/* Search — desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xs relative"
          >
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af] pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索 AI 工具…"
              className="search-input"
            />
          </form>

          {/* Nav — desktop */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-auto">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-md text-[0.8125rem] font-medium transition-colors ${
                    active
                      ? 'text-[#1a2f5e] bg-[#1a2f5e]/06'
                      : 'text-[#4b5563] hover:text-[#1a2f5e] hover:bg-[#F4F3EF]'
                  }`}
                  style={{ fontFamily: 'var(--font-syne)' }}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* CTA */}
          <Link
            href="/submit"
            className="btn-primary hidden sm:inline-flex ml-2 text-xs px-3 py-1.5"
          >
            提交工具
          </Link>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden ml-auto p-1.5 rounded-md text-[#4b5563] hover:bg-[#F4F3EF] transition-colors"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="菜单"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-[#e8e6e0] bg-white/98 backdrop-blur-md">
          {/* Mobile search */}
          <div className="container-content py-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af] pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索 AI 工具…"
                className="search-input"
              />
            </form>
          </div>
          {/* Mobile nav */}
          <nav className="container-content pb-4 flex flex-col gap-0.5">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'text-[#1a2f5e] bg-[#1a2f5e]/06 font-semibold'
                      : 'text-[#4b5563] hover:text-[#1a2f5e] hover:bg-[#F4F3EF]'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
            <Link
              href="/submit"
              className="btn-primary mt-2 justify-center text-sm"
            >
              提交工具
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
