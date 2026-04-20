import Link from 'next/link'
import { Sparkles } from 'lucide-react'

const TOOL_LINKS = [
  { href: '/tools?category=写作',     label: 'AI写作' },
  { href: '/tools?category=图像生成', label: '图像生成' },
  { href: '/tools?category=编程',     label: 'AI编程' },
  { href: '/tools?category=视频',     label: 'AI视频' },
  { href: '/tools?category=音频',     label: 'AI音频' },
  { href: '/tools?category=效率',     label: '效率工具' },
]

const CONTENT_LINKS = [
  { href: '/compare',   label: '对比评测' },
  { href: '/tutorials', label: '使用教程' },
  { href: '/articles',  label: '深度文章' },
  { href: '/news',      label: 'AI资讯' },
]

const ABOUT_LINKS = [
  { href: '/about',    label: '关于我们' },
  { href: '/submit',   label: '提交工具' },
  { href: '/feedback', label: '意见反馈' },
]

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-footer)' }}>
      {/* Top divider */}
      <div className="divider" />

      <div className="container-content py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group w-fit">
              <div className="w-7 h-7 rounded-lg bg-[#c9a84c]/20 border border-[#c9a84c]/30 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#c9a84c]" />
              </div>
              <span
                className="text-[0.9375rem] font-bold text-white tracking-tight"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                AI导航
              </span>
            </Link>
            <p className="text-[0.8125rem] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              发现最好用的 AI 工具，提升你的工作效率。
            </p>
          </div>

          {/* Tool categories */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-syne)' }}
            >
              工具分类
            </h3>
            <ul className="space-y-2.5">
              {TOOL_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="footer-link text-[0.8125rem]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Content */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-syne)' }}
            >
              内容
            </h3>
            <ul className="space-y-2.5">
              {CONTENT_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="footer-link text-[0.8125rem]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-syne)' }}
            >
              关于
            </h3>
            <ul className="space-y-2.5">
              {ABOUT_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="footer-link text-[0.8125rem]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[0.75rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} AI导航. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about"    className="footer-link text-[0.75rem]">隐私政策</Link>
            <Link href="/feedback" className="footer-link text-[0.75rem]">联系我们</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
