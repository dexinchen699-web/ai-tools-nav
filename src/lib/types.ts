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
  similarTools?: { name: string; slug: string }[]
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
