'use client'
import { useEffect } from 'react'

export function ArticleChartJsInit() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js'
    script.onload = () => {
      // Re-run all inline <script> tags inside article content that reference Chart
      document
        .querySelectorAll<HTMLScriptElement>('.article-html-content script')
        .forEach(original => {
          if (!original.src && original.textContent?.includes('Chart')) {
            const clone = document.createElement('script')
            clone.textContent = original.textContent
            original.parentNode?.replaceChild(clone, original)
          }
        })
    }
    document.head.appendChild(script)
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script)
    }
  }, [])
  return null
}
