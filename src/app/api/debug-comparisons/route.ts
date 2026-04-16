import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  // 1. 检查环境变量
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 2. 查询 pages 表（page_type = comparison）
  const { data, error, count } = await supabase
    .from('pages')
    .select('slug, title, page_type', { count: 'exact' })
    .eq('page_type', 'comparison')
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
