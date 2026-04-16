'use client'
import { useState } from 'react'
import Image from 'next/image'

interface ToolLogoProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
}

// Deterministic color palette based on first char
const COLORS = [
  ['#3B82F6', '#1D4ED8'], // blue
  ['#8B5CF6', '#6D28D9'], // violet
  ['#EC4899', '#BE185D'], // pink
  ['#F59E0B', '#B45309'], // amber
  ['#10B981', '#047857'], // emerald
  ['#EF4444', '#B91C1C'], // red
  ['#06B6D4', '#0E7490'], // cyan
  ['#F97316', '#C2410C'], // orange
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

export function ToolLogo({ src, alt, width, height, className, priority = false }: ToolLogoProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <LetterAvatar name={alt} size={width} className={className} />
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      sizes={`${width}px`}
      onError={() => setFailed(true)}
    />
  )
}
