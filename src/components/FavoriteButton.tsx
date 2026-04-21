'use client'

import { Heart } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'

interface FavoriteButtonProps {
  slug: string
  className?: string
  size?: 'sm' | 'md'
}

export function FavoriteButton({ slug, className, size = 'md' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(slug)
  const iconSize = size === 'sm' ? 14 : 16
  const padding = size === 'sm' ? 'p-1' : 'p-1.5'

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(slug)
  }

  return (
    <button
      onClick={handleClick}
      aria-label={favorited ? '取消收藏' : '收藏'}
      className={`${padding} rounded-full hover:bg-red-50 transition-colors ${className ?? ''}`}
    >
      <Heart
        size={iconSize}
        className={
          favorited
            ? 'fill-red-500 text-red-500'
            : 'text-gray-400 hover:text-red-400'
        }
      />
    </button>
  )
}
