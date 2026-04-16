import { MetadataRoute } from 'next'
import { getAllTools, getAllCategories, getAllComparisons } from '@/lib/data'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ai-tools-nav-two.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tools, categories, comparisons] = await Promise.all([
    getAllTools(),
    getAllCategories(),
    getAllComparisons(),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/compare`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/tutorials`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/feedback`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  const toolRoutes: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${BASE_URL}/tools/${tool.slug}`,
    lastModified: tool.updatedAt ? new Date(tool.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: tool.isFeatured ? 0.9 : 0.8,
  }))

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const comparisonRoutes: MetadataRoute.Sitemap = comparisons.map((cmp) => ({
    url: `${BASE_URL}/compare/${cmp.slug}`,
    lastModified: cmp.updatedAt ? new Date(cmp.updatedAt) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...toolRoutes, ...categoryRoutes, ...comparisonRoutes]
}
