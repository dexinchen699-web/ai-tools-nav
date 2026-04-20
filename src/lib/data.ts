import { unstable_cache } from 'next/cache'
import { AITool, Category, Comparison, NewsItem, NewsCategory } from './types'
import { supabase } from './supabase'
import { generatedTools } from '../data/generated_data'
import newsData from '../data/news.json'

// ── Category definitions (static fallback) ───────────────────────────────────
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

const FEATURED_SLUGS = new Set([
  'chatgpt', 'claude', 'gemini', 'midjourney', 'cursor', 'deepseek',
  'github-copilot', 'perplexity', 'stable-diffusion', 'canva-ai', 'suno', 'runway',
])

const NEW_SLUGS = new Set([
  'deepseek', 'grok', 'flux', 'suno', 'windsurf', 'ideogram',
])

// ── Static fallback data ──────────────────────────────────────────────────────
function adaptTool(t: AITool, index: number): AITool {
  const hostname = (() => {
    try { return new URL(t.website).hostname } catch { return '' }
  })()
  const logoUrl = t.logoUrl || (hostname
    ? `https://logo.clearbit.com/${hostname}`
    : '/images/tools/placeholder.png')

  return {
    ...t,
    id: String(index + 1),
    imageUrl: t.imageUrl || '/images/tools/placeholder.png',
    logoUrl,
    createdAt: '2026-04-09T00:00:00Z',
    updatedAt: '2026-04-09T00:00:00Z',
    isFeatured: FEATURED_SLUGS.has(t.slug),
    isNew: NEW_SLUGS.has(t.slug),
  }
}

const STATIC_TOOLS: AITool[] = generatedTools.map(adaptTool)

const STATIC_CATEGORIES: Category[] = CATEGORY_DEFS.map((def) => ({
  ...def,
  toolCount: STATIC_TOOLS.filter((t) => t.category === def.slug).length,
}))

// ── Supabase row → AITool mapper ──────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToTool(row: any): AITool {
  const hostname = (() => {
    try { return new URL(row.website).hostname } catch { return '' }
  })()
  return {
    id: String(row.id),
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? '',
    description: row.description ?? '',
    category: row.category_slug ?? row.category ?? '',
    tags: row.tags ?? [],
    website: row.website ?? '',
    pricing: row.pricing ?? 'free',
    pricingDetail: row.pricing_detail ?? '',
    rating: row.rating ?? 0,
    reviewCount: row.review_count ?? 0,
    features: row.features ?? [],
    pros: row.pros ?? [],
    cons: row.cons ?? [],
    useCases: row.use_cases ?? [],
    faqs: row.faqs ?? [],
    howToSteps: row.how_to_steps ?? [],
    imageUrl: row.image_url || '/images/tools/placeholder.png',
    screenshotUrl: row.screenshot_url,
    logoUrl: row.logo_url || (hostname
      ? `https://logo.clearbit.com/${hostname}`
      : '/images/tools/placeholder.png'),
    title: row.title,
    metaDescription: row.meta_description,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    introduction: row.introduction,
    targetUsers: row.target_users ?? [],
    pricingTiers: row.pricing_tiers ?? [],
    similarTools: row.similar_tools ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isFeatured: row.is_featured ?? false,
    isNew: row.is_new ?? false,
  }
}

// ── Comparisons (static) ─────────────────────────────────────────────────────
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
  { id: '6',  slug: 'replit-vs-cursor',                toolASlug: 'replit',            toolBSlug: 'cursor',            title: 'Replit vs Cursor：在线IDE与本地AI编辑器对比',          description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '7',  slug: 'whisper-vs-assemblyai',           toolASlug: 'whisper',           toolBSlug: 'assemblyai',        title: 'Whisper vs AssemblyAI：AI语音转文字对比',              description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '8',  slug: 'chatgpt-vs-github-copilot',       toolASlug: 'chatgpt',           toolBSlug: 'github-copilot',    title: 'ChatGPT vs GitHub Copilot：AI编程助手对比',            description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '9',  slug: 'heygen-vs-synthesia',             toolASlug: 'heygen',            toolBSlug: 'synthesia',         title: 'HeyGen vs Synthesia：AI数字人视频对比',                description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '10', slug: 'cursor-vs-windsurf',              toolASlug: 'cursor',            toolBSlug: 'windsurf',          title: 'Cursor vs Windsurf：AI代码编辑器对比',                 description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '11', slug: 'elevenlabs-vs-murf',              toolASlug: 'elevenlabs',        toolBSlug: 'murf',              title: 'ElevenLabs vs Murf：AI语音合成工具对比',               description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '12', slug: 'github-copilot-vs-tabnine',       toolASlug: 'github-copilot',    toolBSlug: 'tabnine',           title: 'GitHub Copilot vs Tabnine：AI代码补全对比',            description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '13', slug: 'sora-vs-runway',                  toolASlug: 'sora',              toolBSlug: 'runway',            title: 'Sora vs Runway：AI视频生成工具对比',                   description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '14', slug: 'github-copilot-vs-cursor',        toolASlug: 'github-copilot',    toolBSlug: 'cursor',            title: 'GitHub Copilot vs Cursor：AI编程工具对比',             description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '15', slug: 'runway-vs-pika',                  toolASlug: 'runway',            toolBSlug: 'pika',              title: 'Runway vs Pika：AI视频创作工具对比',                   description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '16', slug: 'leonardo-vs-midjourney',          toolASlug: 'leonardo',          toolBSlug: 'midjourney',        title: 'Leonardo AI vs Midjourney：AI绘图工具对比',            description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '17', slug: 'notion-ai-vs-copilot',            toolASlug: 'notion-ai',         toolBSlug: 'github-copilot',    title: 'Notion AI vs Copilot：AI写作与编程助手对比',           description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '18', slug: 'midjourney-vs-firefly',           toolASlug: 'midjourney',        toolBSlug: 'firefly',           title: 'Midjourney vs Adobe Firefly：AI绘图工具对比',          description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '19', slug: 'stable-diffusion-vs-dalle3',      toolASlug: 'stable-diffusion',  toolBSlug: 'dalle3',            title: 'Stable Diffusion vs DALL-E 3：AI图像生成对比',         description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '20', slug: 'grammarly-vs-chatgpt',            toolASlug: 'grammarly',         toolBSlug: 'chatgpt',           title: 'Grammarly vs ChatGPT：AI写作辅助工具对比',             description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '21', slug: 'copy-ai-vs-jasper',               toolASlug: 'copy-ai',           toolBSlug: 'jasper',            title: 'Copy.ai vs Jasper：AI营销文案工具对比',                description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '22', slug: 'midjourney-vs-dalle3',            toolASlug: 'midjourney',        toolBSlug: 'dalle3',            title: 'Midjourney vs DALL-E 3：AI图像生成对比',               description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '23', slug: 'jasper-vs-chatgpt',               toolASlug: 'jasper',            toolBSlug: 'chatgpt',           title: 'Jasper vs ChatGPT：AI内容创作工具对比',                description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '24', slug: 'notion-ai-vs-chatgpt',            toolASlug: 'notion-ai',         toolBSlug: 'chatgpt',           title: 'Notion AI vs ChatGPT：AI效率工具对比',                 description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '25', slug: 'claude-vs-gpt4',                  toolASlug: 'claude',            toolBSlug: 'gpt4',              title: 'Claude vs GPT-4：顶级AI大模型深度对比',               description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '26', slug: 'chatgpt-vs-grok',                 toolASlug: 'chatgpt',           toolBSlug: 'grok',              title: 'ChatGPT vs Grok：OpenAI与xAI的AI助手对比',            description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '27', slug: 'claude-vs-gemini',                toolASlug: 'claude',            toolBSlug: 'gemini',            title: 'Claude vs Gemini：Anthropic与Google AI对比',          description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '28', slug: 'chatgpt-vs-gemini',               toolASlug: 'chatgpt',           toolBSlug: 'gemini',            title: 'ChatGPT vs Gemini：OpenAI与Google AI助手对比',         description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '29', slug: 'suno-vs-mubert',                  toolASlug: 'suno',              toolBSlug: 'mubert',            title: 'Suno vs Mubert：AI音乐生成工具对比',                   description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '30', slug: 'suno-vs-udio',                    toolASlug: 'suno',              toolBSlug: 'udio',              title: 'Suno vs Udio：AI音乐创作平台对比',                     description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '31', slug: 'bolt-vs-cursor',                  toolASlug: 'bolt',              toolBSlug: 'cursor',            title: 'Bolt vs Cursor：AI全栈开发工具对比',                   description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '32', slug: 'cursor-vs-chatgpt',               toolASlug: 'cursor',            toolBSlug: 'chatgpt',           title: 'Cursor vs ChatGPT：AI编程专用 vs 通用助手对比',        description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '33', slug: 'github-copilot-vs-chatgpt',       toolASlug: 'github-copilot',    toolBSlug: 'chatgpt',           title: 'GitHub Copilot vs ChatGPT：AI编程助手对比',            description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '34', slug: 'chatgpt-vs-jasper',               toolASlug: 'chatgpt',           toolBSlug: 'jasper',            title: 'ChatGPT vs Jasper：AI写作工具对比',                    description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '35', slug: 'notion-vs-obsidian',              toolASlug: 'notion',            toolBSlug: 'obsidian',          title: 'Notion vs Obsidian：AI笔记与知识管理工具对比',         description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '36', slug: 'stable-diffusion-vs-flux',        toolASlug: 'stable-diffusion',  toolBSlug: 'flux',              title: 'Stable Diffusion vs Flux：开源AI图像生成对比',         description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '37', slug: 'midjourney-vs-ideogram',          toolASlug: 'midjourney',        toolBSlug: 'ideogram',          title: 'Midjourney vs Ideogram：AI图像生成工具对比',           description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '38', slug: 'midjourney-vs-dall-e',            toolASlug: 'midjourney',        toolBSlug: 'dall-e',            title: 'Midjourney vs DALL-E：AI绘图工具终极对比',             description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
  { id: '39', slug: 'gemini-vs-deepseek',              toolASlug: 'gemini',            toolBSlug: 'deepseek',          title: 'Gemini vs DeepSeek：Google与国产AI大模型对比',         description: '', verdict: '', faqs: [], updatedAt: '2026-04-09T00:00:00Z' },
]

// ── Cached Supabase queries ───────────────────────────────────────────────────
// Cache TTL: 1 hour for tools/categories, 10 min for news

const _fetchAllTools = unstable_cache(
  async (): Promise<AITool[]> => {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .order('rating', { ascending: false })
    if (error || !data?.length) return STATIC_TOOLS
    return data.map(rowToTool)
  },
  ['all-tools'],
  { revalidate: 3600, tags: ['tools'] }
)

const _fetchAllCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('id', { ascending: true })
    if (error || !data?.length) return STATIC_CATEGORIES
    return data.map((row) => ({
      id: String(row.id),
      slug: row.slug,
      name: row.name,
      description: row.description ?? '',
      iconName: row.icon_name ?? '',
      icon: row.icon ?? '',
      toolCount: row.tool_count ?? 0,
    }))
  },
  ['all-categories'],
  { revalidate: 3600, tags: ['categories'] }
)

const _fetchFeaturedTools = unstable_cache(
  async (): Promise<AITool[]> => {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('is_featured', true)
      .order('rating', { ascending: false })
    if (error || !data?.length) return STATIC_TOOLS.filter((t) => t.isFeatured)
    return data.map(rowToTool)
  },
  ['featured-tools'],
  { revalidate: 3600, tags: ['tools'] }
)

const _fetchLatestNews = unstable_cache(
  async (limit: number): Promise<NewsItem[]> => {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit)
    if (error || !data?.length) return STATIC_NEWS.slice(0, limit)
    return data.map(rowToNews)
  },
  ['latest-news'],
  { revalidate: 600, tags: ['news'] }
)

const _fetchAllNews = unstable_cache(
  async (): Promise<NewsItem[]> => {
    const PAGE_SIZE = 500
    const allRows: Record<string, unknown>[] = []
    let from = 0

    // Paginate until all rows are fetched
    while (true) {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1)
      if (error) break
      if (!data?.length) break
      allRows.push(...data)
      if (data.length < PAGE_SIZE) break
      from += PAGE_SIZE
    }

    if (!allRows.length) return STATIC_NEWS
    return allRows.map(rowToNews)
  },
  ['all-news'],
  { revalidate: 600, tags: ['news'] }
)

// ── Data access functions ─────────────────────────────────────────────────────

export async function getAllTools(): Promise<AITool[]> {
  try { return await _fetchAllTools() } catch { return STATIC_TOOLS }
}

export async function getToolBySlug(slug: string): Promise<AITool | null> {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error || !data) return STATIC_TOOLS.find((t) => t.slug === slug) ?? null
    return rowToTool(data)
  } catch {
    return STATIC_TOOLS.find((t) => t.slug === slug) ?? null
  }
}

export async function getAllCategories(): Promise<Category[]> {
  try { return await _fetchAllCategories() } catch { return STATIC_CATEGORIES }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const cats = await _fetchAllCategories()
    return cats.find((c) => c.slug === slug) ?? null
  } catch {
    return STATIC_CATEGORIES.find((c) => c.slug === slug) ?? null
  }
}

export async function getToolsByCategory(categorySlug: string): Promise<AITool[]> {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('category', categorySlug)
      .order('rating', { ascending: false })
    if (error || !data?.length) return STATIC_TOOLS.filter((t) => t.category === categorySlug)
    return data.map(rowToTool)
  } catch {
    return STATIC_TOOLS.filter((t) => t.category === categorySlug)
  }
}


// -- Supabase row -> Comparison mapper
// pages 表没有 tool_a_slug / tool_b_slug 字段，从 slug 解析（格式：toolA-vs-toolB）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToComparison(row: any): Comparison {
  const parts = (row.slug as string).split('-vs-')
  const toolASlug = row.tool_a_slug ?? parts[0] ?? ''
  const toolBSlug = row.tool_b_slug ?? parts.slice(1).join('-vs-') ?? ''
  return {
    id: String(row.id ?? row.slug),
    slug: row.slug,
    toolASlug,
    toolBSlug,
    title: row.title ?? '',
    description: row.summary ?? row.description ?? '',
    verdict: row.verdict ?? '',
    faqs: row.faq ?? [],
    updatedAt: row.updated_at ?? new Date().toISOString(),
    pros_cons: row.pros_cons ?? undefined,
  }
}
export async function getAllComparisons(): Promise<Comparison[]> {
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('page_type', 'comparison')
      .order('id', { ascending: false })
    if (error || !data?.length) return COMPARISONS
    return data.map(rowToComparison)
  } catch {
    return COMPARISONS
  }
}

export async function getComparisonBySlug(slug: string): Promise<Comparison | null> {
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('page_type', 'comparison')
      .eq('slug', slug)
      .single()
    if (error || !data) return COMPARISONS.find((c) => c.slug === slug) ?? null
    return rowToComparison(data)
  } catch {
    return COMPARISONS.find((c) => c.slug === slug) ?? null
  }
}

export async function getFeaturedTools(): Promise<AITool[]> {
  try { return await _fetchFeaturedTools() } catch { return STATIC_TOOLS.filter((t) => t.isFeatured) }
}

// ── News ──────────────────────────────────────────────────────────────────────
const STATIC_NEWS: NewsItem[] = (newsData as NewsItem[]).sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
)

function rowToNews(row: Record<string, unknown>): NewsItem {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    summary: row.summary as string,
    content: row.content as string,
    source: row.source as string,
    sourceUrl: row.source_url as string,
    publishedAt: row.published_at as string,
    category: row.category as NewsCategory,
    tags: (row.tags as string[]) ?? [],
    imageUrl: (row.image_url as string) ?? undefined,
  }
}

export async function getAllNews(): Promise<NewsItem[]> {
  try { return await _fetchAllNews() } catch { return STATIC_NEWS }
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error || !data) return STATIC_NEWS.find((n) => n.slug === slug) ?? null
    return rowToNews(data)
  } catch {
    return STATIC_NEWS.find((n) => n.slug === slug) ?? null
  }
}

export async function getNewsByCategory(category: NewsCategory): Promise<NewsItem[]> {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('category', category)
      .order('published_at', { ascending: false })
      .limit(50)
    if (error || !data?.length) return STATIC_NEWS.filter((n) => n.category === category)
    return data.map(rowToNews)
  } catch {
    return STATIC_NEWS.filter((n) => n.category === category)
  }
}

export async function getLatestNews(limit = 10): Promise<NewsItem[]> {
  try { return await _fetchLatestNews(limit) } catch { return STATIC_NEWS.slice(0, limit) }
}

export async function getRelatedTools(slug: string, limit = 4): Promise<AITool[]> {
  const tool = STATIC_TOOLS.find((t) => t.slug === slug)
  if (!tool) return []

  const tagSet = new Set(tool.tags ?? [])

  try {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('category', tool.category)
      .neq('slug', slug)
      .order('rating', { ascending: false })
      .limit(limit * 2)
    if (!error && data?.length) {
      const scored = data
        .map((row) => {
          const t = rowToTool(row)
          const tagOverlap = (t.tags ?? []).filter((tag) => tagSet.has(tag)).length
          return { tool: t, score: 10 + tagOverlap * 2 + (t.isFeatured ? 1 : 0) }
        })
        .sort((a, b) => b.score - a.score || b.tool.rating - a.tool.rating)
        .slice(0, limit)
        .map(({ tool: t }) => t)
      if (scored.length) return scored
    }
  } catch { /* fall through */ }

  return STATIC_TOOLS
    .filter((t) => t.slug !== slug)
    .map((t) => {
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
