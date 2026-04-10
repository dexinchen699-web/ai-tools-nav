import Link from 'next/link'
import type { Category } from '@/lib/types'

interface Props {
  categories: Category[]
  totalCount: number
  activeSlug?: string
}

export function CategoryNavSidebar({ categories, totalCount, activeSlug }: Props) {
  return (
    <aside className="w-52 shrink-0 hidden lg:block">
      {/* sticky: top-14 = header height (h-14) */}
      <div className="sticky top-14 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm max-h-[calc(100vh-64px)] flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">工具分类</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-1">
          <Link
            href="/"
            className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors group ${
              !activeSlug
                ? 'bg-brand-50 text-brand-600 font-medium'
                : 'text-gray-700 hover:bg-brand-50 hover:text-brand-600'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-base">🔥</span>
              <span className="font-medium">全部工具</span>
            </span>
            <span className={`text-xs ${!activeSlug ? 'text-brand-400' : 'text-gray-400 group-hover:text-brand-400'}`}>
              {totalCount}
            </span>
          </Link>

          {categories.map(cat => {
            const isActive = cat.slug === activeSlug
            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors group ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 font-medium'
                    : 'text-gray-700 hover:bg-brand-50 hover:text-brand-600'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </span>
                <span className={`text-xs shrink-0 ml-1 ${isActive ? 'text-brand-400' : 'text-gray-400 group-hover:text-brand-400'}`}>
                  {cat.toolCount}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 shrink-0">
          <Link
            href="/submit"
            className="block w-full text-center text-xs font-medium text-brand-600 hover:text-brand-700 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
          >
            + 提交工具
          </Link>
        </div>
      </div>
    </aside>
  )
}
