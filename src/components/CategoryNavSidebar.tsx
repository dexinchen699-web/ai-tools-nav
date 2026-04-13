import Link from 'next/link'
import type { Category } from '@/lib/types'

interface Props {
  categories: Category[]
  totalCount: number
  activeSlug?: string
}

export function CategoryNavSidebar({ categories, totalCount, activeSlug }: Props) {
  return (
    <aside className="w-56 shrink-0 hidden lg:block">
      <div className="sticky top-14 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm max-h-[calc(100vh-72px)] flex flex-col">

        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80 shrink-0 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">工具分类</span>
          <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{categories.length}</span>
        </div>

        {/* Nav list */}
        <nav className="flex-1 overflow-y-auto py-1.5 scrollbar-hide">

          {/* All tools */}
          <Link
            href="/"
            className={`relative flex items-center justify-between px-4 py-2 text-sm transition-all duration-150 group ${
              !activeSlug
                ? 'bg-brand-50 text-brand-700 font-semibold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {/* Active indicator bar */}
            {!activeSlug && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-500 rounded-r-full" />
            )}
            <span className="flex items-center gap-2.5">
              <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange-50 text-base shrink-0">🔥</span>
              <span className="font-medium">全部工具</span>
            </span>
            <span className={`text-[11px] tabular-nums shrink-0 ml-1 px-1.5 py-0.5 rounded-full ${
              !activeSlug ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
            }`}>
              {totalCount}
            </span>
          </Link>

          {/* Divider */}
          <div className="mx-4 my-1 border-t border-gray-100" />

          {/* Category items */}
          {categories.map(cat => {
            const isActive = cat.slug === activeSlug
            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={`relative flex items-center justify-between px-4 py-2 text-sm transition-all duration-150 group ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-500 rounded-r-full" />
                )}
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-base shrink-0 transition-colors ${
                    isActive ? 'bg-brand-100' : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    {cat.icon}
                  </span>
                  <span className="truncate">{cat.name}</span>
                </span>
                {cat.toolCount !== undefined && (
                  <span className={`text-[11px] tabular-nums shrink-0 ml-1 px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                  }`}>
                    {cat.toolCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer CTA */}
        <div className="px-3 py-3 border-t border-gray-100 bg-gray-50/80 shrink-0">
          <Link
            href="/submit"
            className="flex items-center justify-center gap-1.5 w-full text-xs font-medium text-brand-600 hover:text-white py-2 rounded-lg hover:bg-brand-500 border border-brand-200 hover:border-brand-500 transition-all duration-150"
          >
            <span>＋</span>
            <span>提交工具</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}
