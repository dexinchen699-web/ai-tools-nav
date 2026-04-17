import type { Metadata } from 'next'
import modelsData from '@/data/models.json'

export const metadata: Metadata = {
  title: '主流 AI 模型榜单 — AI工具导航',
  description: '2026年主流大模型综合能力排行榜，对比 Claude、GPT、Gemini、DeepSeek 等主流模型的能力评分、上下文长度与定价。',
}

interface Model {
  rank: number
  name: string
  maker: string
  score: number
  context: string
  params: string
  multimodal: boolean
  reasoning: boolean
  code: boolean
  free: boolean
}

const models = modelsData as Model[]

const MAKER_COLOR: Record<string, string> = {
  Anthropic: 'bg-orange-50 text-orange-700 border-orange-200',
  OpenAI:    'bg-green-50 text-green-700 border-green-200',
  Google:    'bg-blue-50 text-blue-700 border-blue-200',
  DeepSeek:  'bg-sky-50 text-sky-700 border-sky-200',
  Meta:      'bg-indigo-50 text-indigo-700 border-indigo-200',
}

export default function ModelsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white">
        <div className="container-content py-12 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">主流 AI 模型榜单</h1>
          <p className="text-brand-100 text-sm max-w-lg mx-auto">
            基于综合能力评测排名（2026年），持续更新
          </p>
        </div>
      </section>

      <div className="container-content py-8 pb-16">

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
                {['排名', '模型', '厂商', '综合评分', '上下文', '参数', '多模态', '推理', '代码', '免费'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold"
                    style={{ color: 'var(--text-secondary)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {models.map((m, i) => (
                <tr key={m.rank}
                  style={{
                    background: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-card)',
                    borderBottom: '1px solid var(--border-card)'
                  }}>
                  <td className="px-4 py-3 font-bold text-center w-12" style={{ color: m.rank <= 3 ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {m.rank <= 3 ? ['🥇','🥈','🥉'][m.rank - 1] : m.rank}
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{m.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${MAKER_COLOR[m.maker] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {m.maker}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${m.score}%`, background: 'var(--accent)' }} />
                      </div>
                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{m.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{m.context}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{m.params}</td>
                  {[m.multimodal, m.reasoning, m.code, m.free].map((v, j) => (
                    <td key={j} className="px-4 py-3 text-center text-sm">
                      {v ? '✅' : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden space-y-3">
          {models.map(m => (
            <div key={m.rank} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold" style={{ color: m.rank <= 3 ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {m.rank <= 3 ? ['🥇','🥈','🥉'][m.rank - 1] : `#${m.rank}`}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${MAKER_COLOR[m.maker] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  {m.maker}
                </span>
              </div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{m.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${m.score}%`, background: 'var(--accent)' }} />
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{m.score}分</span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>上下文 {m.context}</span>
                {m.multimodal && <span className="text-emerald-600">多模态</span>}
                {m.reasoning && <span className="text-emerald-600">推理</span>}
                {m.free && <span className="text-emerald-600">有免费版</span>}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          数据持续更新中 · 评分综合多项基准测试结果
        </p>
      </div>
    </div>
  )
}
