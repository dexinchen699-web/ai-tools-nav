'use client'
import { useState } from 'react'
import Image from 'next/image'

interface ToolLogoProps {
  src?: string        // 原始 logoUrl（可选，作为第一优先）
  website?: string    // 工具官网，用于派生 favicon URL
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
}

// Deterministic color palette based on first char
const COLORS: [string, string][] = [
  ['#3B82F6', '#1D4ED8'],
  ['#8B5CF6', '#6D28D9'],
  ['#EC4899', '#BE185D'],
  ['#F59E0B', '#B45309'],
  ['#10B981', '#047857'],
  ['#EF4444', '#B91C1C'],
  ['#06B6D4', '#0E7490'],
  ['#F97316', '#C2410C'],
]

function getColor(name: string): [string, string] {
  const code = name.charCodeAt(0) || 0
  return COLORS[code % COLORS.length]
}

function LetterAvatar({ name, size, className }: { name: string; size: number; className?: string }) {
  const letter = (name || '?')[0].toUpperCase()
  const [bg, border] = getColor(name)
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '20%',
        background: `linear-gradient(135deg, ${bg}, ${border})`,
        color: '#fff',
        fontWeight: 700,
        fontSize: Math.round(size * 0.45),
        fontFamily: 'system-ui, sans-serif',
        flexShrink: 0,
        userSelect: 'none',
      }}
      aria-label={name}
    >
      {letter}
    </span>
  )
}

/** 从网站 URL 提取 hostname，失败返回 null */
function getHostname(url?: string): string | null {
  if (!url) return null
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

/** 按优先级生成 favicon 候选列表 */
function buildFaviconCandidates(src?: string, website?: string): string[] {
  const candidates: string[] = []
  const host = getHostname(website)

  // 1. 原始 logoUrl（如果不是 placeholder）
  if (src && !src.includes('placeholder') && !src.includes('clearbit')) {
    candidates.push(src)
  }

  if (host) {
    // 2. Google Favicon API（最稳定，支持 sz 参数）
    candidates.push(`https://www.google.com/s2/favicons?domain=${host}&sz=64`)
    // 3. DuckDuckGo Favicon
    candidates.push(`https://icons.duckduckgo.com/ip3/${host}.ico`)
    // 4. Clearbit Logo（有时可用）
    candidates.push(`https://logo.clearbit.com/${host}`)
  }

  return candidates
}

export function ToolLogo({ src, website, alt, width, height, className, priority = false }: ToolLogoProps) {
  const candidates = buildFaviconCandidates(src, website)
  const [index, setIndex] = useState(0)

  // 所有候选都失败 → 字母头像
  if (index >= candidates.length) {
    return <LetterAvatar name={alt} size={width} className={className} />
  }

  return (
    <Image
      key={candidates[index]}
      src={candidates[index]}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      sizes={`${width}px`}
      onError={() => setIndex((i) => i + 1)}
      unoptimized  // favicon 是外部 URL，跳过 Next.js 图片优化
    />
  )
}
