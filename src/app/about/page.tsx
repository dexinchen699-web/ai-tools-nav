import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '关于我们 — AI工具导航',
  description: '了解 AI工具导航的使命、收录标准和团队理念，我们致力于帮助中文用户发现最好用的 AI 工具。',
}

const STATS = [
  { value: '200+', label: '收录工具' },
  { value: '20+', label: '工具分类' },
  { value: '每日', label: '内容更新' },
  { value: '免费', label: '永久使用' },
]

const VALUES = [
  {
    emoji: '🎯',
    title: '精选而非堆砌',
    desc: '我们不追求数量，每个收录的工具都经过实际测试，确保对用户真正有价值。',
  },
  {
    emoji: '🇨🇳',
    title: '中文用户优先',
    desc: '所有内容以中文呈现，优先收录支持中文的工具，降低使用门槛。',
  },
  {
    emoji: '🔄',
    title: '持续保持更新',
    desc: 'AI 领域日新月异，我们每天跟踪最新动态，确保信息的时效性和准确性。',
  },
  {
    emoji: '🆓',
    title: '完全免费开放',
    desc: '导航本身永久免费，不设付费墙，让每个人都能平等地发现好工具。',
  },
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white">
        <div className="container-content py-14 text-center">
          <div className="text-5xl mb-4">🤖</div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">关于 AI工具导航</h1>
          <p className="text-brand-100 text-sm max-w-lg mx-auto leading-relaxed">
            我们是一个专注于 AI 工具发现与评测的中文导航站，帮助你在 AI 爆炸时代找到真正好用的工具。
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-100 bg-white">
        <div className="container-content py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {STATS.map(s => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-brand-600">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-content py-12 max-w-3xl mx-auto space-y-12 pb-16">
        {/* Mission */}
        <section>
          <h2 className="section-title mb-4">我们的使命</h2>
          <div className="card p-6 text-sm text-gray-600 leading-relaxed space-y-3">
            <p>
              AI 工具的数量正在以每周数百个的速度增长，但真正好用、适合中文用户的工具却淹没在信息噪音中。
            </p>
            <p>
              AI工具导航的使命很简单：<strong className="text-gray-900">帮你节省筛选时间，直接找到最适合你的 AI 工具。</strong>
            </p>
            <p>
              我们不是工具的搬运工，而是经过筛选和测试的推荐者。每一个收录的工具，都代表我们认为它值得你花时间了解。
            </p>
          </div>
        </section>

        {/* Values */}
        <section>
          <h2 className="section-title mb-4">我们的理念</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VALUES.map(v => (
              <div key={v.title} className="card p-5">
                <div className="text-2xl mb-2">{v.emoji}</div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{v.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Criteria */}
        <section>
          <h2 className="section-title mb-4">收录标准</h2>
          <div className="card p-6">
            <ul className="space-y-3 text-sm text-gray-600">
              {[
                '工具需与 AI / 机器学习技术直接相关',
                '有可正常访问的官方网站或产品页面',
                '具备实际可用的功能，非纯概念或演示项目',
                '优先收录支持中文界面或中文内容的工具',
                '免费或有免费试用额度的工具优先展示',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="section-title mb-2">一起建设更好的导航</h2>
          <p className="text-sm text-gray-500 mb-6">发现了好工具？遇到了问题？我们都想听到你的声音。</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/submit" className="btn-primary px-6 py-2.5">
              提交工具
            </Link>
            <Link href="/feedback" className="btn-secondary px-6 py-2.5">
              问题反馈
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
