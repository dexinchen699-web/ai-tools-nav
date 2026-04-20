import type { Metadata } from 'next'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: '关于我们 — AI工具导航',
  description: '了解 AI工具导航的使命、收录标准和团队理念，我们致力于帮助中文用户发现最好用的 AI 工具。',
}

export default function AboutPage() {
  return <AboutClient />
}
