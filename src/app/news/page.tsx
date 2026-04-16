import type { Metadata } from 'next'
import { getAllNews } from '@/lib/data'
import { NewsFilter } from '@/components/NewsFilter'

export const revalidate = 600

export const metadata: Metadata = {
  title: 'AI 资讯 - 最新人工智能动态 | AI工具导航',
  description: '汇聚 AIBase、量子位、机器之心最新 AI 资讯，每日更新，涵盖行业动态、产品发布、研究论文等。',
}

export default async function NewsPage() {
  const allNews = await getAllNews()

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-white border-b border-gray-200 py-10">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 资讯</h1>
          <p className="text-gray-500 text-base">
            来自 AIBase · 量子位 · 机器之心，每日自动更新
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <NewsFilter allNews={allNews} />
      </div>
    </main>
  )
}
