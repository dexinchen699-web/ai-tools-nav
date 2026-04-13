import { AITool, Category, Comparison } from './types'
import { generatedTools, GeneratedTool } from '../data/generated_data'

// ── Category definitions ──────────────────────────────────────────────────────
// All 10 categories — 6 original + 4 new from pipeline expansion
const CATEGORY_DEFS: Omit<Category, 'toolCount'>[] = [
  { id: '1',  slug: 'chat',         name: 'AI对话',   description: 'AI聊天机器人和智能助手',             iconName: 'ChatBubbleIcon',      icon: '💬' },
  { id: '2',  slug: 'image',        name: 'AI绘图',   description: 'AI图像生成、编辑和设计工具',         iconName: 'PhotoIcon',           icon: '🎨' },
  { id: '3',  slug: 'coding',       name: 'AI编程',   description: 'AI代码生成、补全和调试工具',         iconName: 'CodeBracketIcon',     icon: '💻' },
  { id: '4',  slug: 'writing',      name: 'AI写作',   description: 'AI驱动的写作、文案和内容创作工具',   iconName: 'PencilIcon',          icon: '✍️' },
  { id: '5',  slug: 'video',        name: 'AI视频',   description: 'AI视频生成、编辑和字幕工具',         iconName: 'VideoCameraIcon',     icon: '🎬' },
  { id: '6',  slug: 'seo',          name: 'AI SEO',   description: 'AI驱动的SEO分析和内容优化工具',     iconName: 'MagnifyingGlassIcon', icon: '🔍' },
  { id: '7',  slug: 'search',       name: 'AI搜索',   description: 'AI驱动的智能搜索和问答引擎',         iconName: 'SearchIcon',          icon: '🔎' },
  { id: '8',  slug: 'design',       name: 'AI设计',   description: 'AI辅助的UI设计、品牌和平面设计工具', iconName: 'SwatchIcon',          icon: '🖌️' },
  { id: '9',  slug: 'audio',        name: 'AI音频',   description: 'AI语音合成、音乐生成和音频处理工具', iconName: 'MusicalNoteIcon',     icon: '🎵' },
  { id: '10', slug: 'productivity', name: 'AI效率',   description: 'AI驱动的自动化、会议和项目管理工具', iconName: 'BoltIcon',            icon: '⚡' },
]

// ── Featured & New tool slugs ─────────────────────────────────────────────────
const FEATURED_SLUGS = new Set([
  'chatgpt', 'claude', 'gemini', 'midjourney', 'cursor', 'deepseek',
  'github-copilot', 'perplexity', 'stable-diffusion', 'canva-ai',
  'suno', 'runway',
])

// Tools added/updated recently — shown in "最新收录" section
const NEW_SLUGS = new Set([
  'deepseek', 'grok', 'flux', 'suno', 'windsurf', 'ideogram',
])

// ── Adapter: GeneratedTool → AITool ──────────────────────────────────────────
function adaptTool(t: GeneratedTool, index: number): AITool {
  // Use Google favicon service for logos; fall back to placeholder
  const hostname = (() => {
    try { return new URL(t.website).hostname } catch { return '' }
  })()
  const logoUrl = hostname
    ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`
    : '/images/tools/placeholder.png'

  return {
    id: String(index + 1),
    slug: t.slug,
    name: t.name,
    tagline: t.tagline,
    description: t.description,
    category: t.category,
    tags: t.tags,
    website: t.website,
    pricing: t.pricing,
    pricingDetail: t.pricingDetail,
    rating: t.rating,
    reviewCount: t.reviewCount,
    features: t.features,
    pros: t.pros,
    cons: t.cons,
    useCases: t.useCases,
    faqs: t.faqs,
    howToSteps: t.howToSteps,
    imageUrl: t.imageUrl || '/images/tools/placeholder.png',
    logoUrl,
    createdAt: '2026-04-09T00:00:00Z',
    updatedAt: '2026-04-09T00:00:00Z',
    isFeatured: FEATURED_SLUGS.has(t.slug),
    isNew: NEW_SLUGS.has(t.slug),
  }
}

// ── Build TOOLS and CATEGORIES from generated data ────────────────────────────
export const TOOLS: AITool[] = generatedTools.map(adaptTool)

export const CATEGORIES: Category[] = CATEGORY_DEFS.map((def) => ({
  ...def,
  toolCount: TOOLS.filter((t) => t.category === def.slug).length,
}))

// ── Comparisons (hand-authored, not generated) ────────────────────────────────
export const COMPARISONS: Comparison[] = [
  {
    id: '1',
    slug: 'chatgpt-vs-claude',
    toolASlug: 'chatgpt',
    toolBSlug: 'claude',
    title: 'ChatGPT vs Claude：2026年深度对比',
    description: '全面对比ChatGPT和Claude在功能、价格、中文支持等方面的差异，帮你选择最适合的AI助手。',
    verdict: '如果你需要最全面的功能和最丰富的插件生态，选ChatGPT Plus；如果你主要处理长文档、代码开发或需要更安全的回答，Claude Pro更适合你。两者都提供$20/月的Pro套餐，可以根据主要使用场景来决定。',
    faqs: [
      { question: 'ChatGPT和Claude哪个中文更好？', answer: 'ChatGPT的中文理解和生成能力略强，更适合纯中文内容创作；Claude在中英混合场景下表现也很好。' },
      { question: '两者都需要科学上网吗？', answer: '是的，ChatGPT和Claude目前都需要科学上网才能访问，国内用户需要使用VPN。' },
    ],
    updatedAt: '2026-04-09T00:00:00Z',
  },
  {
    id: '2',
    slug: 'cursor-vs-github-copilot',
    toolASlug: 'cursor',
    toolBSlug: 'github-copilot',
    title: 'Cursor vs GitHub Copilot：AI编程工具深度对比',
    description: '对比Cursor和GitHub Copilot在代码补全、对话式编程、价格和IDE集成方面的差异，帮助开发者选择最合适的AI编程助手。',
    verdict: '对于想要完整AI编程体验的开发者，Cursor是更好的选择——它的对话式编程和代码库理解能力更强。如果你已经深度使用VS Code或JetBrains，GitHub Copilot的集成更无缝，且企业版有更完善的安全合规支持。',
    faqs: [
      { question: 'Cursor和GitHub Copilot哪个代码补全更准确？', answer: 'Cursor基于VS Code深度定制，支持多文件上下文理解，整体补全质量略优；Copilot在单文件补全速度上更快。' },
      { question: '两者价格如何？', answer: 'Cursor Pro $20/月，GitHub Copilot Individual $10/月。Cursor功能更全面但价格更高。' },
      { question: '国内能直接使用吗？', answer: '两者都需要科学上网，但Cursor有时在国内网络下也能部分使用。' },
    ],
    updatedAt: '2026-04-09T00:00:00Z',
  },
  {
    id: '3',
    slug: 'midjourney-vs-stable-diffusion',
    toolASlug: 'midjourney',
    toolBSlug: 'stable-diffusion',
    title: 'Midjourney vs Stable Diffusion：AI绘图工具对比',
    description: '对比Midjourney和Stable Diffusion在图像质量、使用门槛、价格和定制化方面的差异，找到最适合你的AI绘图工具。',
    verdict: '追求开箱即用的高质量图像，选Midjourney；需要完全控制、本地部署或商业定制，选Stable Diffusion。Midjourney适合设计师和创意工作者，Stable Diffusion更适合有技术背景的用户和开发者。',
    faqs: [
      { question: 'Midjourney和Stable Diffusion哪个画质更好？', answer: 'Midjourney在艺术风格和美感上更出色，开箱即用效果更好；Stable Diffusion在写实人像和精细控制上有优势。' },
      { question: 'Stable Diffusion可以免费使用吗？', answer: '是的，Stable Diffusion是开源的，可以本地免费部署，但需要一定的GPU配置。' },
      { question: '哪个更适合商业用途？', answer: 'Stable Diffusion的开源版本商业使用更灵活；Midjourney需要购买Pro或Mega套餐才能用于商业项目。' },
    ],
    updatedAt: '2026-04-09T00:00:00Z',
  },
  {
    id: '4',
    slug: 'chatgpt-vs-deepseek',
    toolASlug: 'chatgpt',
    toolBSlug: 'deepseek',
    title: 'ChatGPT vs DeepSeek：国内外AI助手对比',
    description: '对比ChatGPT和DeepSeek在中文能力、价格、访问便利性和推理能力方面的差异，帮助国内用户做出最佳选择。',
    verdict: 'DeepSeek对国内用户更友好——无需科学上网、价格极低（API比GPT-4便宜90%以上）、中文理解能力强。ChatGPT在英文内容、插件生态和多模态能力上仍有优势。日常中文使用推荐DeepSeek，专业英文场景或需要DALL-E等功能选ChatGPT。',
    faqs: [
      { question: 'DeepSeek和ChatGPT哪个中文更好？', answer: 'DeepSeek在中文理解和生成上与ChatGPT相当，部分中文推理任务上甚至更优，且无需翻墙。' },
      { question: 'DeepSeek的API价格如何？', answer: 'DeepSeek API价格极具竞争力，DeepSeek-V3输入约¥0.27/百万tokens，比GPT-4o便宜约95%。' },
      { question: 'DeepSeek有哪些限制？', answer: 'DeepSeek在某些政治敏感话题上有内容限制，且多模态能力（图像生成等）不如ChatGPT完善。' },
    ],
    updatedAt: '2026-04-09T00:00:00Z',
  },
  {
    id: '5',
    slug: 'perplexity-vs-chatgpt',
    toolASlug: 'perplexity',
    toolBSlug: 'chatgpt',
    title: 'Perplexity vs ChatGPT：AI搜索 vs AI对话',
    description: '对比Perplexity AI和ChatGPT在实时搜索、信息准确性、引用来源和使用场景方面的差异。',
    verdict: '需要实时信息、引用来源和事实核查，选Perplexity；需要创意写作、代码生成、长对话和多模态能力，选ChatGPT。两者定位不同，很多用户会同时使用——Perplexity作为搜索引擎替代，ChatGPT作为创作和编程助手。',
    faqs: [
      { question: 'Perplexity的信息比ChatGPT更准确吗？', answer: 'Perplexity实时联网搜索，信息更新且有来源引用，在时效性和可验证性上优于ChatGPT；但ChatGPT的推理和创作能力更强。' },
      { question: 'Perplexity免费版够用吗？', answer: 'Perplexity免费版每天有一定次数的Pro搜索限制，日常使用基本够用。Pro版$20/月，支持更多高级模型。' },
    ],
    updatedAt: '2026-04-09T00:00:00Z',
  },
]

// ── Data access functions ─────────────────────────────────────────────────────
// Swap these for Supabase queries in Phase 2

export async function getAllTools(): Promise<AITool[]> {
  return TOOLS
}

export async function getToolBySlug(slug: string): Promise<AITool | null> {
  return TOOLS.find((t) => t.slug === slug) ?? null
}

export async function getAllCategories(): Promise<Category[]> {
  return CATEGORIES
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return CATEGORIES.find((c) => c.slug === slug) ?? null
}

export async function getToolsByCategory(categorySlug: string): Promise<AITool[]> {
  return TOOLS.filter((t) => t.category === categorySlug)
}

export async function getAllComparisons(): Promise<Comparison[]> {
  return COMPARISONS
}

export async function getComparisonBySlug(slug: string): Promise<Comparison | null> {
  return COMPARISONS.find((c) => c.slug === slug) ?? null
}

export async function getFeaturedTools(): Promise<AITool[]> {
  return TOOLS.filter((t) => t.isFeatured)
}

export async function getRelatedTools(slug: string, limit = 4): Promise<AITool[]> {
  const tool = TOOLS.find((t) => t.slug === slug)
  if (!tool) return []

  const tagSet = new Set(tool.tags ?? [])

  return TOOLS
    .filter((t) => t.slug !== slug)
    .map((t) => {
      // same category = 10 pts, each shared tag = 2 pts, featured = 1 pt
      const tagOverlap = (t.tags ?? []).filter((tag) => tagSet.has(tag)).length
      const score =
        (t.category === tool.category ? 10 : 0) +
        tagOverlap * 2 +
        (t.isFeatured ? 1 : 0)
      return { tool: t, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.tool.rating - a.tool.rating)
    .slice(0, limit)
    .map(({ tool: t }) => t)
}
