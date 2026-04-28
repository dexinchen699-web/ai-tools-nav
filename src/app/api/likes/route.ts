import { createServiceClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const slug = searchParams.get('slug')
  if (!type || !slug) return NextResponse.json({ error: 'missing params' }, { status: 400 })

  const db = createServiceClient()
  const { count } = await db
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('content_type', type)
    .eq('content_slug', slug)

  return NextResponse.json({ count: count ?? 0 })
}

export async function POST(request: Request) {
  const { type, slug } = await request.json()
  if (!type || !slug) return NextResponse.json({ error: 'missing params' }, { status: 400 })

  const db = createServiceClient()
  const { error } = await db.from('likes').insert({ content_type: type, content_slug: slug })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { count } = await db
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('content_type', type)
    .eq('content_slug', slug)

  return NextResponse.json({ count: count ?? 0 })
}
