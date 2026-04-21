import { Suspense } from 'react'
import { getAllTools, getAllCategories } from '@/lib/data'
import { ToolCard } from '@/components/ToolCard'
import SearchFilters from '@/components/SearchFilters'
import type { AITool } from '@/lib/types'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    pricing?: string
    tags?: string
  }>
}

function filterTools(
  tools: AITool[],
  q: string,
  category: string,
  pricing: string,
  tags: string,
): AITool[] {
  const query = q.trim().toLowerCase()
  const tagList = tags ? tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : []

  return tools.filter(tool => {
    // Text search
    if (query) {
      const haystack = [tool.name, tool.tagline, tool.description, ...(tool.tags ?? [])]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(query)) return false
    }

    // Category filter
    if (category && tool.category !== category) return false

    // Pricing filter
    if (pricing && tool.pricing !== pricing) return false

    // Tags filter (any match)
    if (tagList.length > 0) {
      const toolTags = (tool.tags ?? []).map(t => t.toLowerCase())
      if (!tagList.some(tag => toolTags.includes(tag))) return false
    }

    return true
  })
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '', category = '', pricing = '', tags = '' } = await searchParams

  const [allTools, categories] = await Promise.all([getAllTools(), getAllCategories()])
  const results = filterTools(allTools, q, category, pricing, tags)

  const hasQuery = q || category || pricing || tags

  return (
    <main style={{ paddingTop: '5rem', paddingBottom: '4rem', minHeight: '100vh' }}>
      <div className="container-content">
        {/* Page heading */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '0.25rem',
          }}>
            {q ? `"${q}" 的搜索结果` : '搜索 AI 工具'}
          </h1>
          {!hasQuery && (
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
              从 {allTools.length}+ 款 AI 工具中快速找到你需要的
            </p>
          )}
        </div>

        {/* Filters */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '0.75rem',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}>
          <Suspense fallback={null}>
            <SearchFilters categories={categories} totalCount={results.length} />
          </Suspense>
        </div>

        {/* Results grid */}
        {results.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
          }}>
            {results.map(tool => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '4rem 1rem',
            color: 'var(--text-secondary)',
          }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</p>
            <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              没有找到匹配的工具
            </p>
            <p style={{ fontSize: '0.9375rem' }}>
              试试换个关键词，或者清除筛选条件
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
