'use client'
import { useState } from 'react'
import Image from 'next/image'

interface ToolLogoProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}

export function ToolLogo({ src, alt, width, height, className }: ToolLogoProps) {
  const [imgSrc, setImgSrc] = useState(src)
  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized
      onError={() => setImgSrc('/images/tools/placeholder.png')}
    />
  )
}
