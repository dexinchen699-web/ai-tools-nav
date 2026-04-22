'use client'
import { useEffect } from 'react'

export function ArticleMermaidInit() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js'
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m = (window as any).mermaid
      if (m) {
        m.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' })
        m.run()
      }
    }
    document.head.appendChild(script)
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script)
    }
  }, [])
  return null
}
