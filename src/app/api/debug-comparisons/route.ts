import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  // 1. 检查环境变量
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 2. 查询 comparisons 表
  const { data, error, count } = await supabase
    .from('comparisons')
    .select('slug, tool_a_slug, tool_b_slug, title', { count: 'exact' })
    .limit(5)

  return NextResponse.json({
    env: {
      url: url ? url.slice(0, 30) + '…' : 'MISSING',
      key: key ? key.slice(0, 20) + '…' : 'MISSING',
    },
    count,
    error: error ? { message: error.message, code: error.code } : null,
    sample: data,
  })
}
