import type { Metadata } from 'next'
import glossaryData from '@/data/glossary.json'

export const metadata: Metadata = {
  title: 'AI 术语表 — AI工具导航',
  description: 'AI术语速查表，涵盖Token、RAG、MCP、Agent、Transformer等40+核心词汇，每个术语配有简明解释，帮你快速读懂AI。',
}

interface GlossaryItem {
  term: string
  oneliner: string
  keywords: string
}

const items = glossaryData as GlossaryItem[]

export default function GlossaryPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white">
        <div className="container-content py-12 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">AI 术语表</h1>
          <p className="text-brand-100 text-sm max-w-lg mx-auto">
            Token、RAG、MCP、Agent……{items.length}+ 核心 AI 术语，一页读懂
          </p>
        </div>
      </section>

      <div className="container-content py-8 pb-16 max-w-3xl mx-auto">
        <div className="space-y-3">
          {items.map(item => (
            <div
              key={item.term}
              className="card p-5"
            >
              <h2 className="text-sm font-bold mb-1" style={{ color: 'var(--accent)' }}>
                {item.term}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {item.oneliner}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
