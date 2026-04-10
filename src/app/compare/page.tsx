import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllComparisons, getToolBySlug, getAllTools } from '@/lib/data'
import { buildMetadata } from '@/lib/metadata'

export const metadata: Metadata = buildMetadata({
  title: 'AI工具对比',
  description: '对比主流AI工具的功能、价格和适用场景，帮你快速找到最适合的AI工具。',
  path: '/compare',
})

export default async function ComparePage() {
  const [comparisons, allTools] = await Promise.all([getAllComparisons(), getAllTools()])

  // Build a quick lookup
  const toolMap = Object.fromEntries(allTools.map((t) => [t.slug, t]))

  return (
    <main className="container-content py-10">
      <h1 className="section-title mb-2">AI工具对比</h1>
      <p className="text-gray-500 mb-8 text-sm">精选热门AI工具横向对比，帮你快速做出选择。</p>

      {comparisons.length === 0 ? (
        <p className="text-gray-400 text-sm">暂无对比内容，敬请期待。</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {comparisons.map((cmp) => {
            const toolA = toolMap[cmp.toolASlug]
            const toolB = toolMap[cmp.toolBSlug]
            return (
              <Link
                key={cmp.slug}
                href={`/compare/${cmp.slug}`}
                className="card card-p flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  {[toolA, toolB].map((tool, i) =>
                    tool ? (
                      <span key={i} className="flex items-center gap-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${new URL(tool.website).hostname}&sz=32`}
                          alt={tool.name}
                          width={20}
                          height={20}
                          className="rounded-sm"
                        />
                        <span className="font-medium text-sm text-gray-900">{tool.name}</span>
                      </span>
                    ) : null
                  ).reduce<React.ReactNode[]>((acc, el, i) => {
                    if (i === 0) return [el]
                    return [...acc, <span key="vs" className="text-gray-500 text-xs">vs</span>, el]
                  }, [])}
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{cmp.description}</p>
                <span className="text-brand-600 text-xs font-medium mt-auto">查看对比 →</span>
              </Link>
            )
          })}
        </div>
      )}

      {/* Suggest more comparisons */}
      <div className="mt-12 rounded-xl border border-dashed border-gray-200 p-6 text-center">
        <p className="text-sm text-gray-500 mb-3">没找到你想要的对比？</p>
        <p className="text-xs text-gray-400">更多对比内容持续更新中，也欢迎在工具详情页点击「对比」发起对比。</p>
      </div>
    </main>
  )
}
