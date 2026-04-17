import Link from 'next/link'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'AI教程 — AI工具导航',
  description: '精选 AI 工具使用教程，从入门到进阶，帮你快速掌握 ChatGPT、Midjourney、Claude 等热门 AI 工具。',
}

const CATEGORY_META: Record<string, { emoji: string; label: string }> = {
  'AI对话': { emoji: '💬', label: 'AI 对话' },
  'AI绘图': { emoji: '🎨', label: 'AI 绘图' },
  'AI编程': { emoji: '💻', label: 'AI 编程' },
  'AI效率': { emoji: '⚡', label: 'AI 效率' },
}

const DIFFICULTY_STYLE: Record<string, string> = {
  beginner:     'bg-emerald-50 text-emerald-700 border border-emerald-200',
  intermediate: 'bg-amber-50 text-amber-700 border border-amber-200',
  advanced:     'bg-rose-50 text-rose-700 border border-rose-200',
}

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
}

interface TutorialRow {
  slug: string
  title: string
  summary: string | null
  category: string
  difficulty: string
  duration_minutes: number | null
  is_featured: boolean
}

export default async function TutorialsPage() {
  const { data: tutorials } = await supabase
    .from('tutorials')
    .select('slug, title, summary, category, difficulty, duration_minutes, is_featured')
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  const rows: TutorialRow[] = tutorials ?? []

  // Group by category, preserving order
  const grouped = Object.keys(CATEGORY_META).reduce<Record<string, TutorialRow[]>>((acc, cat) => {
    acc[cat] = rows.filter(r => r.category === cat)
    return acc
  }, {})

  const featured = rows.filter(r => r.is_featured).slice(0, 3)
  const totalCount = rows.length

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white">
        <div className="container-content py-12 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">AI 工具教程</h1>
          <p className="text-brand-100 text-sm max-w-lg mx-auto">
            精选实用教程，帮你快速掌握各类 AI 工具，从入门到进阶一站搞定
          </p>
          {totalCount > 0 && (
            <p className="mt-3 text-brand-200 text-xs">共 {totalCount} 篇教程</p>
          )}
        </div>
      </section>

      <div className="container-content py-8 pb-16 space-y-12">

        {/* Featured */}
        {featured.length > 0 && (
          <section>
            <h2 className="section-title mb-4">⭐ 精选教程</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map(t => (
                <TutorialCard key={t.slug} tutorial={t} />
              ))}
            </div>
          </section>
        )}

        {/* By category */}
        {Object.entries(grouped).map(([cat, items]) => {
          if (items.length === 0) return null
          const meta = CATEGORY_META[cat]
          return (
            <section key={cat}>
              <h2 className="section-title flex items-center gap-2 mb-4">
                <span>{meta.emoji}</span>
                {meta.label}
                <span className="text-sm font-normal text-gray-400 ml-1">({items.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(t => (
                  <TutorialCard key={t.slug} tutorial={t} />
                ))}
              </div>
            </section>
          )
        })}

        {/* Empty state */}
        {totalCount === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">📚</p>
            <p className="text-sm">教程内容即将上线，敬请期待</p>
          </div>
        )}
      </div>
    </div>
  )
}

function TutorialCard({ tutorial }: { tutorial: TutorialRow }) {
  const diffStyle = DIFFICULTY_STYLE[tutorial.difficulty] ?? DIFFICULTY_STYLE.beginner
  const diffLabel = DIFFICULTY_LABEL[tutorial.difficulty] ?? '入门'

  return (
    <Link
      href={`/tutorials/${tutorial.slug}`}
      className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow group"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-indigo-600 transition-colors">
          {tutorial.title}
        </h3>
        <span className={`badge flex-shrink-0 text-xs px-2 py-0.5 rounded-full border ${diffStyle}`}>
          {diffLabel}
        </span>
      </div>

      {tutorial.summary && (
        <p className="text-xs text-gray-500 flex-1 line-clamp-2">{tutorial.summary}</p>
      )}

      <div className="flex items-center justify-between mt-auto">
        {tutorial.duration_minutes != null ? (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            约 {tutorial.duration_minutes} 分钟
          </span>
        ) : <span />}
        <span className="text-xs text-indigo-500 font-medium group-hover:underline">阅读 →</span>
      </div>
    </Link>
  )
}
