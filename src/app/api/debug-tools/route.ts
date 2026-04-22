import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // 获取前 10 个工具的 category 和 category_slug 字段
    const { data, error } = await supabase
      .from('tools')
      .select('id, slug, name, category, category_slug')
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      tools: data,
      summary: {
        total: data?.length ?? 0,
        withCategory: data?.filter(t => t.category).length ?? 0,
        withCategorySlug: data?.filter(t => t.category_slug).length ?? 0,
      }
    })
  } catch (err) {
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 })
  }
}
