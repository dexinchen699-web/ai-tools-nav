import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import type { NewsCategory } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// ── RSS sources ──────────────────────────────────────────────────────────────
const RSS_SOURCES: { name: string; url: string; category: NewsCategory }[] = [
  {
    name: 'AIBase',
    url: 'https://www.aibase.com/rss.xml',
    category: '产品发布',
  },
  {
    name: '量子位',
    url: 'https://www.qbitai.com/feed',
    category: '行业动态',
  },
  {
    name: '机器之心',
    url: 'https://www.jiqizhixin.com/rss',
    category: '研究论文',
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Extract text content between XML tags (handles CDATA) */
function extractTag(xml: string, tag: string): string {
  const re = new RegExp(
    `<${tag}[^>]*>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${tag}>`,
    'i',
  )
  const m = xml.match(re)
  if (!m) return ''
  return (m[1] ?? m[2] ?? '').trim()
}

/** Split RSS XML into individual <item> blocks */
function splitItems(xml: string): string[] {
  const items: string[] = []
  const re = /<item[\s>]([\s\S]*?)<\/item>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null) {
    items.push(m[1])
  }
  return items
}

/** Slugify a title to a URL-safe string */
function slugify(title: string, date: Date): string {
  const base = title
    .toLowerCase()
    .replace(/[\u4e00-\u9fff]+/g, (s) =>
      // keep CJK chars but replace spaces/special chars
      s.replace(/\s+/g, '-'),
    )
    .replace(/[^\w\u4e00-\u9fff-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
  const ts = date.toISOString().slice(0, 10).replace(/-/g, '')
  return `${base}-${ts}` || `news-${Date.now()}`
}

/** Strip HTML tags for plain-text summary */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 300)
}

interface RssItem {
  slug: string
  title: string
  summary: string
  content: string
  source: string
  source_url: string
  published_at: string
  category: NewsCategory
  tags: string[]
  image_url: string | null
}

async function fetchRss(
  source: (typeof RSS_SOURCES)[number],
): Promise<RssItem[]> {
  const res = await fetch(source.url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ai-tools-nav-bot/1.0)' },
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${source.url}`)
  const xml = await res.text()
  const rawItems = splitItems(xml)

  return rawItems.slice(0, 20).map((item) => {
    const title = extractTag(item, 'title') || 'Untitled'
    const link = extractTag(item, 'link') || extractTag(item, 'guid')
    const pubDateStr = extractTag(item, 'pubDate') || extractTag(item, 'dc:date')
    const description = extractTag(item, 'description')
    const contentEncoded =
      extractTag(item, 'content:encoded') || extractTag(item, 'content')

    const published_at = pubDateStr
      ? new Date(pubDateStr).toISOString()
      : new Date().toISOString()

    const bodyHtml = contentEncoded || description
    const summary = stripHtml(description || contentEncoded)
    const content = stripHtml(bodyHtml)

    // Try to extract first image from content
    const imgMatch = bodyHtml.match(/<img[^>]+src=["']([^"']+)["']/i)
    const image_url = imgMatch ? imgMatch[1] : null

    const slug = slugify(title, new Date(published_at))

    return {
      slug,
      title,
      summary,
      content,
      source: source.name,
      source_url: link,
      published_at,
      category: source.category,
      tags: [source.name],
      image_url,
    }
  })
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // Simple auth: Vercel cron sends Authorization header, or allow CRON_SECRET
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const results: Record<string, { fetched: number; inserted: number; errors: string[] }> = {}

  for (const source of RSS_SOURCES) {
    results[source.name] = { fetched: 0, inserted: 0, errors: [] }
    try {
      const items = await fetchRss(source)
      results[source.name].fetched = items.length

      if (items.length === 0) continue

      // Upsert on source_url (unique key to avoid duplicates)
      const { data, error } = await supabase
        .from('news')
        .upsert(items, { onConflict: 'source_url', ignoreDuplicates: true })
        .select('id')

      if (error) {
        results[source.name].errors.push(error.message)
      } else {
        results[source.name].inserted = data?.length ?? 0
      }
    } catch (err) {
      results[source.name].errors.push(String(err))
    }
  }

  const totalInserted = Object.values(results).reduce((s, r) => s + r.inserted, 0)

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    totalInserted,
    results,
  })
}
