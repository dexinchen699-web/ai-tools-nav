'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Category } from '@/lib/types'

interface Props {
  categories: Category[]
  totalCount: number
}

export function CategorySidebar({ categories, totalCount }: Props) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const sections = categories.map(c => document.getElementById(`cat-${c.slug}`)).filter(Boolean) as HTMLElement[]
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )

    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [categories])

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
    }
  }

  return (
    <aside className="w-52 shrink-0 hidden lg:block">
      <div className="fixed top-20 w-52 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">工具分类</span>
        </div>
        <nav className="py-1 max-h-[calc(100vh-160px)] overflow-y-auto">
          <Link
            href="/tools"
            className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors group"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">🔥</span>
              <span className="font-medium">全部工具</span>
            </span>
            <span className="text-xs text-gray-400 group-hover:text-brand-400">{totalCount}</span>
          </Link>
          {categories.map(cat => {
            const sectionId = `cat-${cat.slug}`
            const isActive = activeId === sectionId
            return (
              <button
                key={cat.slug}
                onClick={() => scrollTo(sectionId)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors group text-left ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 font-medium'
                    : 'text-gray-700 hover:bg-brand-50 hover:text-brand-600'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.name}</span>
                </span>
                <span className={`text-xs ${isActive ? 'text-brand-400' : 'text-gray-400 group-hover:text-brand-400'}`}>
                  {cat.toolCount}
                </span>
              </button>
            )
          })}
        </nav>
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <Link
            href="/submit"
            className="block w-full text-center text-xs font-medium text-brand-600 hover:text-brand-700 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
          >
            + 提交工具
          </Link>
        </div>
      </div>
    </aside>
  )
}
