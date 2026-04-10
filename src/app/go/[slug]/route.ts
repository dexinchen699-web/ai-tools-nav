import { redirect } from 'next/navigation'
import { getToolBySlug } from '@/lib/data'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const tool = await getToolBySlug(slug)

  if (!tool?.website) {
    redirect('/')
  }

  // TODO: 可在此处记录点击事件（如写入 Supabase analytics 表）

  redirect(tool.website)
}
