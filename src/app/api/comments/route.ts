import { createServiceClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const slug = searchParams.get('slug')
  if (!type || !slug) return NextResponse.json({ error: 'missing params' }, { status: 400 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('comments')
    .select('id, author_name, content, created_at')
    .eq('content_type', type)
    .eq('content_slug', slug)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comments: data ?? [] })
}

export async function POST(request: Request) {
  const { type, slug, author_name, content } = await request.json()
  if (!type || !slug || !author_name?.trim() || !content?.trim()) {
    return NextResponse.json({ error: '请填写昵称和评论内容' }, { status: 400 })
  }
  if (content.trim().length > 500) {
    return NextResponse.json({ error: '评论不能超过500字' }, { status: 400 })
  }

  const db = createServiceClient()
  const { data, error } = await db
    .from('comments')
    .insert({ content_type: type, content_slug: slug, author_name: author_name.trim(), content: content.trim() })
    .select('id, author_name, content, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comment: data })
}
