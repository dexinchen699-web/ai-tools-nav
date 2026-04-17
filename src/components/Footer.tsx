import Link from 'next/link'

const FOOTER_LINKS = [
  {
    title: '工具分类',
    links: [
      { href: '/category/chat',         label: 'AI 对话' },
      { href: '/category/image',        label: 'AI 绘图' },
      { href: '/category/coding',       label: 'AI 编程' },
      { href: '/category/writing',      label: 'AI 写作' },
      { href: '/category/video',        label: 'AI 视频' },
      { href: '/category/productivity', label: 'AI 效率' },
    ],
  },
  {
    title: '更多分类',
    links: [
      { href: '/category/search',  label: 'AI 搜索' },
      { href: '/category/design',  label: 'AI 设计' },
      { href: '/category/audio',   label: 'AI 音频' },
      { href: '/category/seo',     label: 'AI SEO' },
    ],
  },
  {
    title: '关于',
    links: [
      { href: '/about',       label: '关于我们' },
      { href: '/submit',      label: '提交工具' },
      { href: '/compare',     label: '工具对比' },
      { href: '/feedback',    label: '问题反馈' },
      { href: '/sitemap.xml', label: '网站地图' },
    ],
  },
]

export function Footer() {
  return (
    <footer style={{ background: 'var(--bg-footer)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="container-content py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ background: 'var(--accent)', color: '#fff' }}>
                AI
              </div>
              <span className="font-bold text-white text-sm">AI工具导航</span>
            </Link>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              精选最实用的 AI 工具，帮助你找到最适合的 AI 助手，提升工作效率。
            </p>
          </div>

          {/* Link groups */}
          {FOOTER_LINKS.map(group => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold mb-4 uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.5)' }}>
                {group.title}
              </h3>
              <ul className="space-y-2.5">
                {group.links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs transition-colors footer-link"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            © {new Date().getFullYear()} AI工具导航 · 发现最好用的 AI 工具
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            收录 86+ 款 AI 工具 · 持续更新中
          </p>
        </div>
      </div>
    </footer>
  )
}
