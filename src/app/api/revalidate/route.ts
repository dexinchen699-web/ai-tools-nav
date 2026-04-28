import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tag, secret } = body

    // 简单的安全验证（可选）
    if (secret && secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    if (tag) {
      revalidateTag(tag, 'everything')
      return NextResponse.json({
        revalidated: true,
        tag,
        now: Date.now()
      })
    }

    // 如果没有指定 tag，清除所有相关缓存
    revalidateTag('tools', 'everything')
    revalidateTag('categories', 'everything')
    revalidateTag('news', 'everything')

    return NextResponse.json({ 
      revalidated: true, 
      tags: ['tools', 'categories', 'news'],
      now: Date.now() 
    })
  } catch (err) {
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST method to revalidate cache',
    usage: 'POST /api/revalidate with body: { tag?: "tools" | "categories" | "news", secret?: "your-secret" }'
  })
}
