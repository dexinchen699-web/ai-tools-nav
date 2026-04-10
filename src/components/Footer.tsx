import Link from 'next/link'

const FOOTER_LINKS = [
  {
    title: 'å·¥å·åç±»',
    links: [
      { href: '/category/chat',         label: 'AIå¯¹è¯' },
      { href: '/category/image',        label: 'AIç»å¾' },
      { href: '/category/coding',       label: 'AIç¼ç¨' },
      { href: '/category/writing',      label: 'AIåä½' },
      { href: '/category/video',        label: 'AIè§é¢' },
      { href: '/category/productivity', label: 'AIæç' },
    ],
  },
  {
    title: 'æ´å¤åç±»',
    links: [
      { href: '/category/search',  label: 'AIæç´¢' },
      { href: '/category/design',  label: 'AIè®¾è®¡' },
      { href: '/category/audio',   label: 'AIé³é¢' },
      { href: '/category/seo',     label: 'AI SEO' },
    ],
  },
  {
    title: 'å³äº',
    links: [
      { href: 'mailto:634932139@qq.com', label: 'æäº¤å·¥å·', external: true },
      { href: '/compare', label: 'å·¥å·å¯¹æ¯' },
      { href: '/sitemap.xml', label: 'ç½ç«å°å¾' },
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
              <span className="text-2xl">ð¤</span>
              <span className="font-bold text-gray-900">AIå·¥å·å¯¼èª</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              ç²¾éæå®ç¨çAIå·¥å·ï¼å¸®å©ä½ æ¾å°æéåçAIå©æï¼æåå·¥ä½æçã?
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
            Â© {new Date().getFullYear()} AIå·¥å·å¯¼èª Â· åç°æå¥½ç¨çAIå·¥å·
          </p>
          <p className="text-xs text-gray-400">
            æ¶å½ 86+ æ¬¾AIå·¥å· Â· æç»­æ´æ°ä¸?
          </p>
        </div>
      </div>
    </footer>
  )
}
