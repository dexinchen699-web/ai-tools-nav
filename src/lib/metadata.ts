import type { Metadata } from 'next'

const SITE_NAME = 'AI工具导航'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ai-tools-nav-two.vercel.app'
const SITE_DESCRIPTION = '发现最好用的AI工具，涵盖AI对话、绘图、编程、写作、视频等10大分类，持续更新。'

export function buildMetadata({
  title,
  description,
  path = '',
  image,
}: {
  title: string
  description: string
  path?: string
  image?: string
}): Metadata {
  const url = `${SITE_URL}${path}`
  const ogImage = image ?? `${SITE_URL}/og-default.png`
  // og-default.png should exist at /public/og-default.png (1200×630)

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      locale: 'zh_CN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export function buildToolMetadata(tool: {
  name: string
  tagline: string
  slug: string
  imageUrl?: string
  logoUrl?: string
}): Metadata {
  return buildMetadata({
    title: `${tool.name} - ${tool.tagline}`,
    description: `${tool.name}：${tool.tagline}。查看功能介绍、价格、优缺点和用户评价。`,
    path: `/tools/${tool.slug}`,
    image: tool.imageUrl ?? tool.logoUrl,
  })
}

export function buildCategoryMetadata(category: {
  name: string
  description: string
  slug: string
  toolCount: number
}): Metadata {
  return buildMetadata({
    title: `${category.name}工具大全（${category.toolCount}款）`,
    description: `精选${category.toolCount}款${category.name}工具：${category.description}，持续更新。`,
    path: `/category/${category.slug}`,
  })
}

export { SITE_NAME, SITE_URL, SITE_DESCRIPTION }
