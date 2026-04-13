'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  const initialCover =
    tool.imageUrl && tool.imageUrl !== '/images/tools/placeholder.png'
      ? tool.imageUrl
      : null

  const [coverSrc, setCoverSrc] = useState<string | null>(initialCover)

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 hover:border-brand-200 transition-all duration-200"
    >
      {/* Cover image — hidden entirely when no valid src or load fails */}
      <div className={`relative w-full h-32 bg-gradient-to-br from-brand-50 to-blue-50 overflow-hidden ${!coverSrc ? 'flex items-center justify-center' : ''}`}>
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt={`${tool.name} cover`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            onError={() => setCoverSrc(null)}
          />
        ) : (
          <ToolLogo
            src={tool.logoUrl || '/images/tools/placeholder.png'}
            alt={tool.name}
            width={56}
            height={56}
            className="tool-logo w-14 h-14 opacity-40"
          />
        )}
        {/* Badges overlay */}
        <div className="absolute top-2 left-2 flex gap-1">
          {tool.isNew && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500 text-white leading-none">NEW</span>
          )}
          {tool.isFeatured && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-white leading-none">精选</span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <ToolLogo
          src={tool.logoUrl || '/images/tools/placeholder.png'}
          alt={tool.name}
          width={32}
          height={32}
          className="tool-logo w-8 h-8 shrink-0 rounded-lg"
        />
        <div className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors truncate leading-tight">
            {tool.name}
          </span>
          <span className="block text-xs text-gray-500 truncate leading-tight mt-0.5">
            {tool.tagline || tool.description}
          </span>
        </div>
        {tool.pricing && (
          <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${PRICING_BADGE[tool.pricing] ?? 'badge-free'}`}>
            {PRICING_LABEL[tool.pricing] ?? tool.pricing}
          </span>
        )}
      </div>
    </Link>
  )
}
