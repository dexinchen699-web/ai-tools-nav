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
    iconBg = 'rgba(255,255,255,0.06)'
  ) => {
    const isActive = activeAnchor === id || (!activeAnchor && id === `cat-${activeSlug}`)
    return (
      <button
        key={id}
        onClick={() => scrollTo(id)}
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.45rem 1rem',
          fontSize: '0.82rem',
          fontWeight: isActive ? 600 : 400,
          cursor: 'pointer',
          textAlign: 'left',
          background: isActive ? 'rgba(139,92,246,0.12)' : 'transparent',
          color: isActive ? 'var(--accent-purple)' : 'var(--text-secondary)',
          border: 'none',
          transition: 'background 0.15s, color 0.15s',
        }}
        onMouseEnter={e => {
          if (!isActive) {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
            ;(e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            (e.currentTarget as HTMLElement).style.background = 'transparent'
            ;(e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
          }
        }}
      >
        {/* Active indicator */}
        {isActive && (
          <span style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '2px',
            height: '1.25rem',
            background: 'var(--accent-purple)',
            borderRadius: '0 2px 2px 0',
          }} />
        )}

        <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
          <span style={{
            width: '1.75rem',
            height: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '7px',
            background: isActive ? 'rgba(139,92,246,0.2)' : iconBg,
            fontSize: '0.9rem',
            flexShrink: 0,
          }}>
            {icon}
          </span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {label}
          </span>
        </span>

        {count !== undefined && (
          <span style={{
            fontSize: '0.65rem',
            fontVariantNumeric: 'tabular-nums',
            flexShrink: 0,
            marginLeft: '0.25rem',
            padding: '0.1rem 0.4rem',
            borderRadius: '999px',
            background: isActive ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.06)',
            color: isActive ? 'var(--accent-purple)' : 'var(--text-muted)',
          }}>
            {count}
          </span>
        )}
      </button>
    )
  }

  return (
    <>
      <aside style={{
        display: 'none',
        position: 'fixed',
        left: 0,
        top: '3.5rem',
        bottom: 0,
        width: '14rem',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        zIndex: 40,
        flexDirection: 'column',
      }}
        className="lg-sidebar"
      >
        {/* Header */}
        <div style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-display)',
          }}>
            工具分类
          </span>
          <span style={{
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
            background: 'rgba(255,255,255,0.06)',
            padding: '0.1rem 0.4rem',
            borderRadius: '999px',
          }}>
            {categories.length}
          </span>
        </div>

        {/* Scrollable nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '0.375rem 0' }}>
          {navItem('featured', '⭐', '精选推荐', undefined, 'rgba(245,158,11,0.12)')}
          {navItem('new-tools', '🆕', '最新收录', undefined, 'rgba(236,72,153,0.1)')}

          <div style={{ margin: '0.375rem 1rem', height: '1px', background: 'rgba(255,255,255,0.06)' }} />

          {navItem('cat-' + (categories[0]?.slug ?? ''), '🔥', '全部工具', totalCount, 'rgba(239,68,68,0.1)')}

          <div style={{ margin: '0.375rem 1rem', height: '1px', background: 'rgba(255,255,255,0.06)' }} />

          {categories.map(cat =>
            navItem(`cat-${cat.slug}`, cat.icon ?? '🔧', cat.name, cat.toolCount)
          )}
        </nav>

        {/* Footer CTA */}
        <div style={{
          padding: '0.75rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          <Link
            href="/submit"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              width: '100%',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--accent-purple)',
              padding: '0.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(139,92,246,0.3)',
              background: 'rgba(139,92,246,0.08)',
              textDecoration: 'none',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.18)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.5)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.08)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.3)'
            }}
          >
            <span>＋</span>
            <span>提交工具</span>
          </Link>
        </div>
      </aside>

      {/* Spacer */}
      <div className="hidden lg:block w-56 shrink-0" />

      {/* Inline style to show aside on lg+ */}
      <style>{`
        @media (min-width: 1024px) {
          .lg-sidebar { display: flex !important; }
        }
      `}</style>
    </>
  )
}
