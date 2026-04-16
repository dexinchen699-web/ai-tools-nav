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

export function ToolLogo({ src, alt, width, height, className, priority = false }: ToolLogoProps) {
  const [imgSrc, setImgSrc] = useState(src)
  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      sizes={`${width}px`}
      onError={() => setImgSrc('/images/tools/placeholder.png')}
    />
  )
}
