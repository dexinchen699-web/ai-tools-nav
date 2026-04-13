'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Category } from '@/lib/types'

interface Props {
  categories: Category[]
  totalCount: number
  activeSlug?: string
}

export function CategoryNavSidebar({ categories, totalCount, activeSlug }: Props) {
  const [activeAnchor, setActiveAnchor] = useState<string>('')

  // Highlight the section currently in viewport
  useEffect(() => {
    const sectionIds = ['featured', 'new-tools', ...categories.map(c => `cat-${c.slug}`)]

    const observer = new IntersectionObserver(
      entries => {
        // Pick the topmost visible section
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          setActiveAnchor(visible[0].target.id)
        }
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    )

    sectionIds.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [categories])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const offset = 72 // header height (56px) + a little breathing room
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
    setActiveAnchor(id)
  }

  return (
    <>
      {/* Fixed sidebar — full viewport height, left-aligned */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-14 bottom-0 w-56 bg-white border-r border-gray-200 shadow-sm z-40">

        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80 shrink-0 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">工具分类</span>
          <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{categories.length}</span>
        </div>

        {/* Nav list — scrollable */}
        <nav className="flex-1 overflow-y-auto py-1.5 scrollbar-hide">

          {/* Featured */}
          <button
            onClick={() => scrollTo('featured')}
            className={`relative w-full flex items-center justify-between px-4 py-2 text-sm transition-all duration-150 group text-left ${
              activeAnchor === 'featured'
                ? 'bg-brand-50 text-brand-700 font-semibold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {activeAnchor === 'featured' && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-500 rounded-r-full" />
            )}
            <span className="flex items-center gap-2.5">
              <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-50 text-base shrink-0">⭐</span>
              <span>精选推荐</span>
            </span>
          </button>

          {/* New tools */}
          <button
            onClick={() => scrollTo('new-tools')}
            className={`relative w-full flex items-center justify-between px-4 py-2 text-sm transition-all duration-150 group text-left ${
              activeAnchor === 'new-tools'
                ? 'bg-brand-50 text-brand-700 font-semibold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {activeAnchor === 'new-tools' && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-500 rounded-r-full" />
            )}
            <span className="flex items-center gap-2.5">
              <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-50 text-base shrink-0">🆕</span>
              <span>最新收录</span>
            </span>
          </button>

          {/* Divider */}
          <div className="mx-4 my-1 border-t border-gray-100" />

          {/* All tools anchor */}
          <button
            onClick={() => scrollTo(`cat-${categories[0]?.slug}`)}
            className="relative w-full flex items-center justify-between px-4 py-2 text-sm transition-all duration-150 group text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <span className="flex items-center gap-2.5">
              <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange-50 text-base shrink-0">🔥</span>
              <span className="font-medium">全部工具</span>
            </span>
            <span className="text-[11px] tabular-nums shrink-0 ml-1 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 group-hover:bg-gray-200">
              {totalCount}
            </span>
          </button>

          {/* Divider */}
          <div className="mx-4 my-1 border-t border-gray-100" />

          {/* Category items */}
          {categories.map(cat => {
            const anchorId = `cat-${cat.slug}`
            const isActive = activeAnchor === anchorId || (!activeAnchor && cat.slug === activeSlug)
            return (
              <button
                key={cat.slug}
                onClick={() => scrollTo(anchorId)}
                className={`relative w-full flex items-center justify-between px-4 py-2 text-sm transition-all duration-150 group text-left ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-500 rounded-r-full" />
                )}
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-base shrink-0 transition-colors ${
                    isActive ? 'bg-brand-100' : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    {cat.icon}
                  </span>
                  <span className="truncate">{cat.name}</span>
                </span>
                {cat.toolCount !== undefined && (
                  <span className={`text-[11px] tabular-nums shrink-0 ml-1 px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                  }`}>
                    {cat.toolCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer CTA */}
        <div className="px-3 py-3 border-t border-gray-100 bg-gray-50/80 shrink-0">
          <Link
            href="/submit"
            className="flex items-center justify-center gap-1.5 w-full text-xs font-medium text-brand-600 hover:text-white py-2 rounded-lg hover:bg-brand-500 border border-brand-200 hover:border-brand-500 transition-all duration-150"
          >
            <span>＋</span>
            <span>提交工具</span>
          </Link>
        </div>
      </aside>

      {/* Spacer — pushes main content right by sidebar width on lg+ */}
      <div className="hidden lg:block w-56 shrink-0" />
    </>
  )
}
