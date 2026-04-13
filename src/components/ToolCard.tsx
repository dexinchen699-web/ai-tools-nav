import Link from 'next/link'
import { ToolLogo } from '@/components/ToolLogo'
import type { AITool } from '@/lib/types'

const PRICING_BADGE: Record<string, string> = {
  free:       'badge-free',
  freemium:   'badge-freemium',
  paid:       'badge-paid',
  enterprise: 'badge-enterprise',
}

const PRICING_LABEL: Record<string, string> = {
  free:       '免费',
  freemium:   '免费+付费',
  paid:       '付费',
  enterprise: '企业版',
}

export function ToolCard({ tool }: { tool: AITool }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 hover:border-brand-200 transition-all duration-200 p-4"
    >
      {/* Logo + badges row */}
      <div className="flex items-start justify-between mb-3">
        <ToolLogo
          src={tool.logoUrl || '/images/tools/placeholder.png'}
          alt={tool.name}
          width={48}
          height={48}
          className="tool-logo w-12 h-12 rounded-xl shrink-0"
        />
        <div className="flex gap-1 flex-wrap justify-end">
          {tool.isNew && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500 text-white leading-none">NEW</span>
          )}
          {tool.isFeatured && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-white leading-none">精选</span>
          )}
          {tool.pricing && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${PRICING_BADGE[tool.pricing] ?? 'badge-free'}`}>
              {PRICING_LABEL[tool.pricing] ?? tool.pricing}
            </span>
          )}
        </div>
      </div>

      {/* Name */}
      <span className="block text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors leading-tight mb-1">
        {tool.name}
      </span>

      {/* Description */}
      <span className="block text-xs text-gray-500 leading-relaxed line-clamp-2">
        {tool.tagline || tool.description}
      </span>
    </Link>
  )
}
