export const dynamic = 'force-dynamic'

import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllComparisons } from '@/lib/data'
import { buildMetadata } from '@/lib/metadata'

export const metadata: Metadata = buildMetadata({
  title: 'AI工具对比',
  description: '对比主流AI工具的功能、价格和适用场景，帮你快速找到最适合的AI工具。',
  path: '/compare',
})

// Derive a display name from a tool slug: "github-copilot" → "Github Copilot"
function slugToName(slug: string) {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// Best-effort favicon: use known domain map, else guess from slug
const KNOWN_DOMAINS: Record<string, string> = {
  chatgpt: 'chat.openai.com',
  openai: 'openai.com',
  claude: 'claude.ai',
  gemini: 'gemini.google.com',
  deepseek: 'deepseek.com',
  midjourney: 'midjourney.com',
  'dall-e': 'openai.com',
  'stable-diffusion': 'stability.ai',
  perplexity: 'perplexity.ai',
  cursor: 'cursor.sh',
  'github-copilot': 'github.com',
  copilot: 'github.com',
  grok: 'x.ai',
  llama: 'meta.com',
  mistral: 'mistral.ai',
  notion: 'notion.so',
  grammarly: 'grammarly.com',
  jasper: 'jasper.ai',
  runway: 'runwayml.com',
  sora: 'openai.com',
  pika: 'pika.art',
  elevenlabs: 'elevenlabs.io',
  synthesia: 'synthesia.io',
  heygen: 'heygen.com',
  kling: 'klingai.com',
}

function toolFavicon(slug: string) {
  const domain = KNOWN_DOMAINS[slug] ?? `${slug.replace(/-/g, '')}.com`
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
}

interface ToolChip {
  slug: string
  name: string
  favicon: string
}

export default async function ComparePage() {
  const comparisons = await getAllComparisons()

  return (
    <main className="container-content py-10">
      <h1 className="section-title mb-2">AI工具对比</h1>
      <p className="text-gray-500 mb-8 text-sm">精选热门AI工具横向对比，帮你快速做出选择。</p>

      {comparisons.length === 0 ? (
        <p className="text-gray-400 text-sm">暂无对比内容，敬请期待。</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {comparisons.map((cmp) => {
            const chips: ToolChip[] = [cmp.toolASlug, cmp.toolBSlug].map((s) => ({
              slug: s,
              name: slugToName(s),
              favicon: toolFavicon(s),
            }))
            return (
              <Link
                key={cmp.slug}
                href={`/compare/${cmp.slug}`}
                className="card card-p flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {chips.map((chip, i) => (
                    <span key={chip.slug} className="flex items-center gap-1.5">
                      {i > 0 && <span className="text-gray-400 text-xs">vs</span>}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={chip.favicon} alt={chip.name} width={18} height={18} className="rounded-sm" />
                      <span className="font-medium text-sm text-gray-900">{chip.name}</span>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{cmp.description}</p>
                <span className="text-brand-600 text-xs font-medium mt-auto">查看对比 →</span>
              </Link>
            )
          })}
        </div>
      )}

      <div className="mt-12 rounded-xl border border-dashed border-gray-200 p-6 text-center">
        <p className="text-sm text-gray-500 mb-3">没找到你想要的对比？</p>
        <p className="text-xs text-gray-400">更多对比内容持续更新中，也欢迎在工具详情页点击「对比」发起对比。</p>
      </div>
    </main>
  )
}
