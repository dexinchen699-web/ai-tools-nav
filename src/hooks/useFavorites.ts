'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'ai_nav_favorites'

function readFromStorage(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeToStorage(slugs: string[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs))
  } catch {
    // ignore quota errors
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    setFavorites(readFromStorage())
  }, [])

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites((prev) => {
      const next = prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug]
      writeToStorage(next)
      return next
    })
  }, [])

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites]
  )

  return { favorites, toggleFavorite, isFavorite }
}
