import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI教程 — AI工具导航',
  description: '精选 AI 工具使用教程，从入门到进阶，帮你快速掌握 ChatGPT、Midjourney、Claude 等热门 AI 工具。',
}

const TUTORIALS = [
  {
    category: 'AI 对话',
    emoji: '💬',
    items: [
      { title: 'ChatGPT 完全入门指南', desc: '从注册到高级 Prompt 技巧，10 分钟上手 ChatGPT', level: '入门', mins: 10 },
      { title: '如何写出高质量的 Prompt', desc: '掌握提示词工程核心原则，让 AI 输出更精准', level: '进阶', mins: 15 },
      { title: 'Claude vs ChatGPT 使用对比', desc: '两大 AI 助手的优劣势分析与适用场景', level: '入门', mins: 8 },
    ],
  },
  {
    category: 'AI 绘图',
    emoji: '🎨',
    items: [
      { title: 'Midjourney 新手快速上手', desc: '从第一张图到风格控制，Midjourney 完整教程', level: '入门', mins: 12 },
      { title: 'Stable Diffusion 本地部署', desc: '免费在本地运行 AI 绘图，完整安装配置指南', level: '进阶', mins: 20 },
      { title: 'AI 绘图 Prompt 关键词大全', desc: '收录 200+ 常用风格词汇，快速提升出图质量', level: '入门', mins: 6 },
    ],
  },
  {
    category: 'AI 编程',
    emoji: '💻',
    items: [
      { title: 'GitHub Copilot 使用技巧', desc: '10 个让 Copilot 效率翻倍的实用技巧', level: '进阶', mins: 10 },
      { title: '用 Cursor 构建全栈应用', desc: '从零开始，用 AI 编辑器完成一个完整项目', level: '进阶', mins: 25 },
    ],
  },
  {
    category: 'AI 效率',
    emoji: '⚡',
    items: [
      { title: 'Notion AI 办公自动化', desc: '用 Notion AI 处理会议记录、写报告、整理知识库', level: '入门', mins: 8 },
      { title: '用 AI 工具打造个人知识库', desc: '结合 ChatGPT + Obsidian 构建第二大脑', level: '进阶', mins: 18 },
    ],
  },
]

const LEVEL_STYLE: Record<string, string> = {
  '入门': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  '进阶': 'bg-amber-50 text-amber-700 border border-amber-200',
}

export default function TutorialsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white">
        <div className="container-content py-12 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">AI 工具教程</h1>
          <p className="text-brand-100 text-sm max-w-lg mx-auto">
            精选实用教程，帮你快速掌握各类 AI 工具，从入门到进阶一站搞定
          </p>
        </div>
      </section>

      {/* Coming soon banner */}
      <div className="container-content py-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          教程内容持续更新中，以下为预览目录。欢迎
          <Link href="/feedback" className="underline underline-offset-2 font-medium">提交建议</Link>
          告诉我们你想学什么。
        </div>
      </div>

      {/* Tutorial list */}
      <div className="container-content py-6 space-y-10 pb-16">
        {TUTORIALS.map(section => (
          <div key={section.category}>
            <h2 className="section-title flex items-center gap-2 mb-4">
              <span>{section.emoji}</span>
              {section.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map(item => (
                <div key={item.title} className="card p-5 flex flex-col gap-3 opacity-80 cursor-default">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug">{item.title}</h3>
                    <span className={`badge flex-shrink-0 ${LEVEL_STYLE[item.level]}`}>{item.level}</span>
                  </div>
                  <p className="text-xs text-gray-500 flex-1">{item.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      约 {item.mins} 分钟
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">即将上线</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
