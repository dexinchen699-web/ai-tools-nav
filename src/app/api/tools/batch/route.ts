import { NextRequest, NextResponse } from 'next/server'
import { getAllTools } from '@/lib/data'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const slugs: string[] = Array.isArray(body?.slugs) ? body.slugs : []

    if (!slugs.length) {
      return NextResponse.json({ tools: [] })
    }

    const allTools = await getAllTools()
    const slugSet = new Set(slugs)
    const tools = allTools.filter((t) => slugSet.has(t.slug))

    return NextResponse.json({ tools })
  } catch {
    return NextResponse.json({ tools: [] }, { status: 500 })
  }
}
