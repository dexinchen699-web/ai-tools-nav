'use client'

import { useEffect, useState } from 'react'
import { ToolCard } from '@/components/ToolCard'
import type { AITool } from '@/lib/types'

const STORAGE_KEY = 'ai_nav_favorites'

function getFavoriteSlugs(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export default function FavoritesPage() {
  const [tools, setTools] = useState<AITool[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const slugs = getFavoriteSlugs()
    if (!slugs.length) {
      setLoading(false)
      return
    }

    fetch('/api/tools/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slugs }),
    })
      .then((r) => r.json())
      .then((data) => setTools(data.tools ?? []))
      .catch(() => setTools([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="max-w-6xl mx-auto px-4 pt-24 pb-10">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">收藏的工具</h1>

      {loading ? (
        <div className="text-[var(--text-secondary)] text-sm">加载中...</div>
      ) : tools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <span className="text-5xl">🤍</span>
          <p className="text-[var(--text-secondary)] text-base">还没有收藏任何工具</p>
          <a
            href="/"
            className="mt-2 text-sm text-[var(--accent-navy)] hover:underline"
          >
            去发现好工具
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}
    </main>
  )
}
