import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import type { NewsCategory } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// ── RSS sources ───────────────────────────────────────────────────────────────
const RSS_SOURCES: { url: string; source: string; category: NewsCategory }[] = [
  {
    url: 'https://venturebeat.com/category/ai/feed/',
    source: 'VentureBeat AI',
    category: '行业动态',
  },
  {
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    source: 'TechCrunch AI',
    category: '产品发布',
  },
  {
    url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    source: 'The Verge AI',
    category: '行业动态',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

function buildSlug(title: string, date: string): string {
  const dateStr = date ? new Date(date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  return `${slugify(title)}-${dateStr}`
}

function extractText(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i'))
  return m ? m[1].trim() : ''
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i'))
  return m ? m[1] : ''
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, ' ').trim()
}

interface RssItem {
  title: string
  link: string
  pubDate: string
  description: string
  imageUrl: string
}

function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = []
  const itemMatches = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? []

  for (const block of itemMatches) {
    const title = stripHtml(extractText(block, 'title'))
    const link = extractText(block, 'link') || extractAttr(block, 'link', 'href')
    const pubDate = extractText(block, 'pubDate') || extractText(block, 'published') || extractText(block, 'dc:date')
    const description = stripHtml(extractText(block, 'description') || extractText(block, 'content:encoded') || extractText(block, 'summary'))

    // Try to extract image from media:content, enclosure, or og:image
    const imageUrl =
      extractAttr(block, 'media:content', 'url') ||
      extractAttr(block, 'enclosure', 'url') ||
      extractAttr(block, 'media:thumbnail', 'url') ||
      ''

    if (title && link) {
      items.push({ title, link, pubDate, description, imageUrl })
    }
  }
  return items
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  // Auth check — if CRON_SECRET is not configured, allow Vercel internal cron calls
  // (Vercel sets x-vercel-cron: 1 on scheduled invocations)
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const secret = request.headers.get('x-cron-secret') ?? request.nextUrl.searchParams.get('secret')
    if (secret !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  let totalInserted = 0
  const errors: string[] = []

  for (const source of RSS_SOURCES) {
    try {
      const res = await fetch(source.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ai-tools-nav-bot/1.0)' },
        signal: AbortSignal.timeout(10_000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const xml = await res.text()
      const items = parseRssItems(xml).slice(0, 10) // max 10 per source per run

      for (const item of items) {
        const slug = buildSlug(item.title, item.pubDate)
        const publishedAt = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
        const summary = item.description.slice(0, 200)

        // Skip if already in DB (accurate count)
        const { data: existing } = await supabase
          .from('news')
          .select('slug')
          .eq('slug', slug)
          .maybeSingle()

        if (existing) continue

        const { error } = await supabase.from('news').insert({
          slug,
          title: item.title,
          summary,
          content: item.description,
          source: source.source,
          source_url: item.link,
          published_at: publishedAt,
          category: source.category,
          tags: [],
          image_url: item.imageUrl || null,
        })

        if (error) {
          errors.push(`${source.source}: ${error.message}`)
        } else {
          totalInserted++
        }
      }
    } catch (err) {
      errors.push(`${source.source}: ${String(err)}`)
    }
  }

  // Bust Next.js cache so news page reflects new data immediately
  if (totalInserted > 0) {
    revalidatePath('/news')
  }

  return NextResponse.json({
    ok: true,
    inserted: totalInserted,
    errors: errors.length ? errors : undefined,
  })
}
