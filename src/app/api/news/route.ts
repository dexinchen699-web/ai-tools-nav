import { NextRequest, NextResponse } from 'next/server'
import { getAllNews, getNewsByCategory, getLatestNews } from '@/lib/data'
import type { NewsCategory } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') as NewsCategory | null
  const limit = parseInt(searchParams.get('limit') ?? '0', 10)

  try {
    let news
    if (category) {
      news = await getNewsByCategory(category)
    } else if (limit > 0) {
      news = await getLatestNews(limit)
    } else {
      news = await getAllNews()
    }
    return NextResponse.json({ news })
  } catch (err) {
    console.error('[api/news] error:', err)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
