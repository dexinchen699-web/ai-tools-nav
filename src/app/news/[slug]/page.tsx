import { redirect } from 'next/navigation'
import { getNewsBySlug } from '@/lib/data'

/**
 * 详情页不再展示内容，直接 301 跳转到原文。
 * 保留此路由避免旧链接 404。
 */
export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const item = await getNewsBySlug(slug)

  if (item?.sourceUrl) {
    redirect(item.sourceUrl)
  }

  // 找不到时回到列表页
  redirect('/news')
}
