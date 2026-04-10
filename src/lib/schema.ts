import { AITool, Category } from './types'

const SITE_URL = 'https://ai-tools-nav.vercel.app'
const SITE_NAME = 'AI工具导航'

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildToolSchema(tool: AITool) {
  const schemas: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.name,
      description: tool.description,
      url: tool.website,
      applicationCategory: 'WebApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: tool.pricing === 'free' ? '0' : undefined,
        priceCurrency: 'USD',
        description: tool.pricingDetail,
      },
      aggregateRating: tool.reviewCount > 0
        ? { '@type': 'AggregateRating', ratingValue: tool.rating, reviewCount: tool.reviewCount, bestRating: 5 }
        : undefined,
      image: tool.imageUrl ?? tool.logoUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首页', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'AI工具', item: `${SITE_URL}/tools` },
        { '@type': 'ListItem', position: 3, name: tool.name, item: `${SITE_URL}/tools/${tool.slug}` },
      ],
    },
  ]

  if (tool.faqs?.length) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: tool.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    })
  }

  if (tool.howToSteps?.length) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `如何使用 ${tool.name}`,
      step: tool.howToSteps.map((step, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        text: step,
      })),
    })
  }

  return schemas
}

export function buildCategorySchema(category: Category, toolCount: number) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${category.name}工具大全`,
      description: category.description,
      url: `${SITE_URL}/category/${category.slug}`,
      numberOfItems: toolCount,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首页', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: category.name, item: `${SITE_URL}/category/${category.slug}` },
      ],
    },
  ]
}

export function buildComparisonSchema(params: {
  title: string
  description: string
  slug: string
  toolAName: string
  toolBName: string
  faqs?: { question: string; answer: string }[]
}) {
  const schemas: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: params.title,
      description: params.description,
      url: `${SITE_URL}/compare/${params.slug}`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首页', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: '工具对比', item: `${SITE_URL}/compare` },
        { '@type': 'ListItem', position: 3, name: params.title, item: `${SITE_URL}/compare/${params.slug}` },
      ],
    },
  ]

  if (params.faqs?.length) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: params.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    })
  }

  return schemas
}
