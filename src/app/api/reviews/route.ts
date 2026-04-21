/*
 * Supabase 表结构 — 在 Supabase SQL Editor 中执行以下 SQL 创建表：
 *
 * CREATE TABLE reviews (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   tool_slug text NOT NULL,
 *   rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
 *   comment text,
 *   created_at timestamptz DEFAULT now()
 * );
 * CREATE INDEX idx_reviews_tool_slug ON reviews(tool_slug);
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase, createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const toolSlug = req.nextUrl.searchParams.get('toolSlug')
  if (!toolSlug) {
    return NextResponse.json({ error: 'toolSlug is required' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at')
      .eq('tool_slug', toolSlug)
      .order('created_at', { ascending: false })

    if (error) throw error

    const rows = data ?? []
    const count = rows.length
    const avgRating = count > 0
      ? Math.round((rows.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
      : 0

    const reviews = rows.slice(0, 5).map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment ?? null,
      createdAt: r.created_at,
    }))

    return NextResponse.json({ avgRating, count, reviews })
  } catch (err) {
    console.error('[reviews GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { toolSlug, rating, comment } = body

    if (!toolSlug || typeof toolSlug !== 'string') {
      return NextResponse.json({ error: 'toolSlug is required' }, { status: 400 })
    }
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'rating must be 1–5' }, { status: 400 })
    }

    const adminClient = createServiceClient()
    const { error } = await adminClient.from('reviews').insert({
      tool_slug: toolSlug,
      rating,
      comment: comment ?? null,
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[reviews POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
