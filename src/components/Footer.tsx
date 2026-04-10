import Link from 'next/link'

const FOOTER_LINKS = [
  {
    title: '工具分类',
    links: [
      { href: '/category/chat',         label: 'AI对话' },
      { href: '/category/image',        label: 'AI绘图' },
      { href: '/category/coding',       label: 'AI编程' },
      { href: '/category/writing',      label: 'AI写作' },
      { href: '/category/video',        label: 'AI视频' },
      { href: '/category/productivity', label: 'AI效率' },
    ],
  },
  {
    title: '更多分类',
    links: [
      { href: '/category/search',  label: 'AI搜索' },
      { href: '/category/design',  label: 'AI设计' },
      { href: '/category/audio',   label: 'AI音频' },
      { href: '/category/seo',     label: 'AI SEO' },
    ],
  },
  {
    title: '关于',
    links: [
      { href: 'mailto:submit@ai-tools-nav.vercel.app', label: '提交工具', external: true },
      { href: '/compare', label: '工具对比' },
      { href: '/sitemap.xml', label: '网站地图' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="container-content py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🤖</span>
              <span className="font-bold text-gray-900">AI工具导航</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              精选最实用的AI工具，帮助你找到最适合的AI助手，提升工作效率。
            </p>
          </div>

          {/* Link groups */}
          {FOOTER_LINKS.map(group => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map(link => (
                  <li key={link.href}>
                    {link.external ? (
                      <a href={link.href} className="text-sm text-gray-500 hover:text-brand-600 transition-colors">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-sm text-gray-500 hover:text-brand-600 transition-colors">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} AI工具导航 · 发现最好用的AI工具
          </p>
          <p className="text-xs text-gray-400">
            收录 86+ 款AI工具 · 持续更新中
          </p>
        </div>
      </div>
    </footer>
  )
}
