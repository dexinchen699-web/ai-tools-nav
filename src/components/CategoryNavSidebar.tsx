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

  useEffect(() => {
    const sectionIds = ['featured', 'new-tools', ...categories.map(c => `cat-${c.slug}`)]

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) setActiveAnchor(visible[0].target.id)
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
    const top = el.getBoundingClientRect().top + window.scrollY - 72
    window.scrollTo({ top, behavior: 'smooth' })
    setActiveAnchor(id)
  }

  const navItem = (
    id: string,
    icon: string,
    label: string,
    count?: number,
  ) => {
    const isActive = activeAnchor === id || (!activeAnchor && id === `cat-${activeSlug}`)
    return (
      <button
        key={id}
        onClick={() => scrollTo(id)}
        className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
      >
        {isActive && <span className="nav-indicator" />}

        <span className="nav-item-inner">
          <span className={`nav-icon ${isActive ? 'nav-icon-active' : ''}`}>
            {icon}
          </span>
          <span className="nav-label">{label}</span>
        </span>

        {count !== undefined && (
          <span className={`nav-count ${isActive ? 'nav-count-active' : ''}`}>
            {count}
          </span>
        )}
      </button>
    )
  }

  return (
    <>
      <aside className="lg-sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <span className="sidebar-header-label">工具分类</span>
          <span className="sidebar-header-count">{categories.length}</span>
        </div>

        {/* Scrollable nav */}
        <nav className="sidebar-nav">
          {navItem('featured', '⭐', '精选推荐')}
          {navItem('new-tools', '🆕', '最新收录')}

          <div className="sidebar-divider" />

          {navItem('cat-' + (categories[0]?.slug ?? ''), '🔥', '全部工具', totalCount)}

          <div className="sidebar-divider" />

          {categories.map(cat =>
            navItem(`cat-${cat.slug}`, cat.icon ?? '🔧', cat.name, cat.toolCount)
          )}
        </nav>

        {/* Footer CTA */}
        <div className="sidebar-footer">
          <Link href="/submit" className="sidebar-submit-btn">
            <span>＋</span>
            <span>提交工具</span>
          </Link>
        </div>
      </aside>

      {/* Spacer */}
      <div className="hidden lg:block w-56 shrink-0" />

      <style>{`
        @media (min-width: 1024px) {
          .lg-sidebar { display: flex !important; }
        }
        .lg-sidebar {
          display: none;
          position: fixed;
          left: 0;
          top: 3.5rem;
          bottom: 0;
          width: 14rem;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          z-index: 40;
          flex-direction: column;
        }
        .sidebar-header {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .sidebar-header-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-family: var(--font-display);
        }
        .sidebar-header-count {
          font-size: 0.65rem;
          color: var(--text-muted);
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 0.1rem 0.4rem;
          border-radius: 999px;
        }
        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 0.375rem 0;
        }
        .sidebar-divider {
          margin: 0.375rem 1rem;
          height: 1px;
          background: var(--border);
        }
        .sidebar-footer {
          padding: 0.75rem;
          border-top: 1px solid var(--border);
          flex-shrink: 0;
        }
        .sidebar-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          width: 100%;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--accent-navy);
          padding: 0.5rem;
          border-radius: 8px;
          border: 1px solid rgba(26,47,94,0.25);
          background: rgba(26,47,94,0.06);
          text-decoration: none;
          transition: background 0.15s, border-color 0.15s;
        }
        .sidebar-submit-btn:hover {
          background: rgba(26,47,94,0.12);
          border-color: rgba(26,47,94,0.4);
        }
        .nav-item {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.45rem 1rem;
          font-size: 0.82rem;
          cursor: pointer;
          text-align: left;
          background: transparent;
          color: var(--text-secondary);
          border: none;
          transition: background 0.15s, color 0.15s;
        }
        .nav-item:hover {
          background: rgba(26,47,94,0.05);
          color: var(--text-primary);
        }
        .nav-item-active {
          font-weight: 600;
          background: rgba(26,47,94,0.08) !important;
          color: var(--accent-navy) !important;
        }
        .nav-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 2px;
          height: 1.25rem;
          background: var(--accent-navy);
          border-radius: 0 2px 2px 0;
        }
        .nav-item-inner {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          min-width: 0;
        }
        .nav-icon {
          width: 1.75rem;
          height: 1.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          font-size: 0.9rem;
          flex-shrink: 0;
        }
        .nav-icon-active {
          background: rgba(26,47,94,0.1);
          border-color: rgba(26,47,94,0.2);
        }
        .nav-label {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .nav-count {
          font-size: 0.65rem;
          font-variant-numeric: tabular-nums;
          flex-shrink: 0;
          margin-left: 0.25rem;
          padding: 0.1rem 0.4rem;
          border-radius: 999px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-muted);
        }
        .nav-count-active {
          background: rgba(26,47,94,0.1);
          border-color: rgba(26,47,94,0.2);
          color: var(--accent-navy);
        }
      `}</style>
    </>
  )
}
