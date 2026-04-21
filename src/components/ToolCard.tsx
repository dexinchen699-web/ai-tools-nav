import Link from 'next/link'
import { ToolLogo } from '@/components/ToolLogo'
import { FavoriteButton } from '@/components/FavoriteButton'
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
    <div className="tool-card group relative">
      {/* Clickable overlay covering the whole card */}
      <Link href={`/tools/${tool.slug}`} className="absolute inset-0 z-0" aria-label={tool.name} />

      {/* Favorite button — above the link overlay */}
      <div className="absolute top-2 right-2 z-10">
        <FavoriteButton slug={tool.slug} size="sm" />
      </div>

      {/* Top row: logo + badges */}
      <div className="flex items-start justify-between gap-2 pr-7">
        <ToolLogo
          website={tool.website}
          alt={tool.name}
          width={40}
          height={40}
          className="w-10 h-10 rounded-xl shrink-0 object-cover"
        />
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {tool.isNew && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: '#ef4444', color: '#fff', letterSpacing: '0.03em' }}>
              NEW
            </span>
          )}
          {tool.isFeatured && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: 'var(--accent-gold)', color: '#fff', letterSpacing: '0.03em' }}>
              精选
            </span>
          )}
          {tool.pricing && (
            <span className={PRICING_BADGE[tool.pricing] ?? 'badge-free'}>
              {PRICING_LABEL[tool.pricing] ?? tool.pricing}
            </span>
          )}
        </div>
      </div>

      {/* Name */}
      <p className="text-sm font-semibold leading-snug text-[var(--text-primary)] group-hover:text-[var(--accent-navy)] transition-colors">
        {tool.name}
      </p>

      {/* Description */}
      <p className="text-xs leading-relaxed line-clamp-2 text-[var(--text-secondary)]">
        {tool.tagline || tool.description}
      </p>
    </div>
  )
}
