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
  freemium:   '免费+',
  paid:       '付费',
  enterprise: '企业',
}

export function ToolCard({ tool }: { tool: AITool }) {
  return (
    <Link href={`/tools/${tool.slug}`} className="tool-card group">
      {/* Top row: logo + badges */}
      <div className="flex items-start justify-between">
        <ToolLogo
          website={tool.website}
          alt={tool.name}
          width={40}
          height={40}
          className="w-10 h-10 rounded-lg shrink-0 object-cover"
        />
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {tool.isNew && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm"
              style={{ background: '#ef4444', color: '#fff' }}>
              NEW
            </span>
          )}
          {tool.isFeatured && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm"
              style={{ background: '#f59e0b', color: '#fff' }}>
              精选
            </span>
          )}
          {tool.pricing && (
            <span className={`${PRICING_BADGE[tool.pricing] ?? 'badge-free'}`}>
              {PRICING_LABEL[tool.pricing] ?? tool.pricing}
            </span>
          )}
        </div>
      </div>

      {/* Name */}
      <span className="block text-sm font-semibold leading-tight"
        style={{ color: 'var(--text-primary)', transition: 'color 0.15s' }}>
        {tool.name}
      </span>

      {/* Description */}
      <span className="block text-xs leading-relaxed line-clamp-2"
        style={{ color: 'var(--text-secondary)' }}>
        {tool.tagline || tool.description}
      </span>
    </Link>
  )
}
