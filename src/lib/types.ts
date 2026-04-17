// Core domain types for the AI tools navigation site

export interface AITool {
  id: string
  slug: string
  name: string
  tagline: string          // short description, used in cards
  description: string      // full description for tool page
  category: string         // category slug
  tags: string[]
  website: string
  pricing: PricingType
  pricingDetail: string    // e.g. "免费 / $20/月 Pro版"
  rating: number           // 0-5
  reviewCount: number
  features: string[]
  pros: string[]
  cons: string[]
  useCases: string[]
  faqs: FAQ[]
  howToSteps: HowToStep[]
  imageUrl?: string
  screenshotUrl?: string
  logoUrl?: string
  title?: string
  metaDescription?: string
  heroTitle?: string
  heroSubtitle?: string
  introduction?: string
  targetUsers?: { type: string; description: string }[]
  pricingTiers?: { name: string; price: string; features: string[] }[]
  similarTools?: { name: string; slug: string; website?: string }[]
  createdAt?: string       // ISO date string
  updatedAt?: string       // ISO date string
  isFeatured?: boolean
  isNew?: boolean
}

export type PricingType = 'free' | 'freemium' | 'paid' | 'enterprise'

export interface Category {
  id: string
  slug: string
  name: string
  description: string
  iconName: string
  icon?: string            // emoji icon for display
  toolCount?: number
}

export interface ComparisonProsCons {
  tool1_pros: string[]
  tool1_cons: string[]
  tool2_pros: string[]
  tool2_cons: string[]
}

export interface Comparison {
  id: string
  slug: string             // e.g. "chatgpt-vs-claude"
  toolASlug: string        // tool slug
  toolBSlug: string        // tool slug
  title: string
  description: string      // meta description / summary
  verdict?: string         // recommendation text
  faqs: FAQ[]
  updatedAt: string
  pros_cons?: ComparisonProsCons  // comparative pros/cons, preferred over tools.pros/cons
}

export interface FAQ {
  question: string
  answer: string
}

export interface HowToStep {
  name: string
  text: string
  imageUrl?: string
}

// Breadcrumb item for BreadcrumbList schema
export interface BreadcrumbItem {
  name: string
  url: string
}

// ── News / 资讯 ───────────────────────────────────────────────────────────────
export type NewsCategory =
  | '行业动态'
  | '产品发布'
  | '研究论文'
  | '公司新闻'
  | '政策法规'

export interface NewsItem {
  id: string
  slug: string             // URL-safe identifier, e.g. "openai-gpt5-2026-04-15"
  title: string
  summary: string          // 1-2 sentence excerpt shown in list cards
  content: string          // full article body (markdown or plain text)
  source: string           // display name, e.g. "TechCrunch"
  sourceUrl: string        // original article URL
  publishedAt: string      // ISO date string
  category: NewsCategory
  tags: string[]
  imageUrl?: string
}
