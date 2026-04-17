/**
 * Supabase Seed Script
 * Run: npx tsx scripts/seed.ts
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import { generatedTools } from "../src/data/generated_data";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Categories ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "chat",        name: "AI 聊天",    slug: "chat",        description: "智能对话与聊天机器人工具",   icon: "💬", sort_order: 1 },
  { id: "image",       name: "AI 图像",    slug: "image",       description: "AI 图像生成与编辑工具",     icon: "🎨", sort_order: 2 },
  { id: "coding",      name: "AI 编程",    slug: "coding",      description: "AI 辅助编程与代码工具",     icon: "💻", sort_order: 3 },
  { id: "writing",     name: "AI 写作",    slug: "writing",     description: "AI 写作与内容创作工具",     icon: "✍️", sort_order: 4 },
  { id: "video",       name: "AI 视频",    slug: "video",       description: "AI 视频生成与编辑工具",     icon: "🎬", sort_order: 5 },
  { id: "seo",         name: "AI SEO",     slug: "seo",         description: "AI SEO 与内容营销工具",     icon: "📈", sort_order: 6 },
  { id: "search",      name: "AI 搜索",    slug: "search",      description: "AI 智能搜索与研究工具",     icon: "🔍", sort_order: 7 },
  { id: "design",      name: "AI 设计",    slug: "design",      description: "AI 设计与创意工具",         icon: "🖌️", sort_order: 8 },
  { id: "audio",       name: "AI 音频",    slug: "audio",       description: "AI 音频生成与处理工具",     icon: "🎵", sort_order: 9 },
  { id: "productivity",name: "AI 效率",    slug: "productivity",description: "AI 生产力与效率提升工具",   icon: "⚡", sort_order: 10 },
];

// ── Comparisons ───────────────────────────────────────────────────────────────
const COMPARISONS = [
  {
    slug: "chatgpt-vs-claude",
    tool_a_slug: "chatgpt",
    tool_b_slug: "claude",
    title: "ChatGPT vs Claude：哪个 AI 助手更适合你？",
    meta_description: "深度对比 ChatGPT 和 Claude 的功能、价格、使用场景，帮你选出最适合的 AI 助手。",
    summary: "ChatGPT 生态更完整，插件丰富；Claude 在长文本处理和安全性上更出色。",
    content_md: "## ChatGPT vs Claude 深度对比\n\nChatGPT 由 OpenAI 开发，拥有庞大的用户生态和丰富的插件系统。Claude 由 Anthropic 开发，以安全性和长上下文处理著称。\n\n### 核心功能对比\n\n| 功能 | ChatGPT | Claude |\n|------|---------|--------|\n| 上下文长度 | 128K | 200K |\n| 代码能力 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |\n| 写作能力 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |\n| 价格 | $20/月 | $20/月 |\n\n### 适用场景\n\n- **选 ChatGPT**：需要插件生态、图像生成、代码解释器\n- **选 Claude**：需要处理长文档、注重输出质量和安全性",
  },
  {
    slug: "midjourney-vs-stable-diffusion",
    tool_a_slug: "midjourney",
    tool_b_slug: "stable-diffusion",
    title: "Midjourney vs Stable Diffusion：AI 绘图工具深度对比",
    meta_description: "对比 Midjourney 和 Stable Diffusion 的画质、易用性、价格和使用场景。",
    summary: "Midjourney 出图质量更高更稳定；Stable Diffusion 免费开源，可本地部署。",
    content_md: "## Midjourney vs Stable Diffusion\n\n### 核心差异\n\n| 维度 | Midjourney | Stable Diffusion |\n|------|-----------|------------------|\n| 部署方式 | 云端 | 本地/云端 |\n| 价格 | $10-$60/月 | 免费开源 |\n| 易用性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |\n| 画质 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |\n\n- **选 Midjourney**：追求最高画质，不想折腾技术细节\n- **选 Stable Diffusion**：需要完全控制、本地运行、免费使用",
  },
  {
    slug: "cursor-vs-github-copilot",
    tool_a_slug: "cursor",
    tool_b_slug: "github-copilot",
    title: "Cursor vs GitHub Copilot：AI 编程助手对比",
    meta_description: "深度对比 Cursor 和 GitHub Copilot 的功能、价格和适用场景。",
    summary: "Cursor 是完整 AI IDE，上下文理解更强；Copilot 插件形式更灵活，与 GitHub 深度集成。",
    content_md: "## Cursor vs GitHub Copilot\n\n| 维度 | Cursor | GitHub Copilot |\n|------|--------|----------------|\n| 形态 | 独立 IDE | VS Code 插件 |\n| 价格 | $20/月 | $10/月 |\n| 代码补全 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |\n| 项目理解 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |\n\n- **选 Cursor**：需要强大的项目级 AI 理解和重构能力\n- **选 Copilot**：已有 VS Code 工作流，需要轻量集成",
  },
  {
    slug: "chatgpt-vs-gemini",
    tool_a_slug: "chatgpt",
    tool_b_slug: "gemini",
    title: "ChatGPT vs Gemini：两大 AI 巨头深度对比",
    meta_description: "全面对比 ChatGPT 和 Google Gemini 的能力、价格和使用场景。",
    summary: "ChatGPT 生态成熟插件丰富；Gemini 与 Google 服务深度集成，多模态能力强。",
    content_md: "## ChatGPT vs Gemini\n\n| 维度 | ChatGPT | Gemini |\n|------|---------|--------|\n| 开发商 | OpenAI | Google |\n| 免费版 | GPT-3.5 | Gemini 1.5 Flash |\n| 付费版 | $20/月 | $20/月 |\n| 多模态 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |\n\n- **选 ChatGPT**：需要成熟生态和丰富插件\n- **选 Gemini**：深度使用 Google Workspace，需要强多模态能力",
  },
  {
    slug: "claude-vs-gemini",
    tool_a_slug: "claude",
    tool_b_slug: "gemini",
    title: "Claude vs Gemini：AI 助手深度对比",
    meta_description: "对比 Anthropic Claude 和 Google Gemini 的功能特点和适用场景。",
    summary: "Claude 写作和安全性更强；Gemini 多模态和 Google 生态集成更好。",
    content_md: "## Claude vs Gemini\n\n| 维度 | Claude | Gemini |\n|------|--------|--------|\n| 上下文 | 200K | 1M |\n| 写作质量 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |\n| 多模态 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |\n| 安全性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |\n\n- **选 Claude**：长文档处理、高质量写作\n- **选 Gemini**：需要超长上下文或 Google 服务集成",
  },
];

// ── Featured / New slugs ──────────────────────────────────────────────────────
const FEATURED_SLUGS = new Set([
  "chatgpt", "claude", "gemini", "midjourney", "cursor",
  "deepseek", "github-copilot", "perplexity", "stable-diffusion",
  "canva-ai", "suno", "runway",
]);

const NEW_SLUGS = new Set([
  "deepseek", "grok", "flux", "suno", "windsurf", "ideogram",
]);

// ── Helpers ───────────────────────────────────────────────────────────────────
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Starting Supabase seed...\n");

  // 1. Upsert categories
  console.log("📂 Upserting categories...");
  const { error: catErr } = await supabase
    .from("categories")
    .upsert(CATEGORIES, { onConflict: "id" });
  if (catErr) {
    console.error("❌ Categories error:", catErr.message);
    process.exit(1);
  }
  console.log(`   ✅ ${CATEGORIES.length} categories upserted\n`);

  // 2. Upsert tools in batches of 20
  console.log("🔧 Upserting tools...");
  const toolRows = generatedTools.map((t) => ({
    id:               t.id ?? t.slug,
    slug:             t.slug,
    name:             t.name,
    tagline:          t.tagline,
    description:      t.description,
    category:         t.category,
    tags:             t.tags ?? [],
    website:          t.website,
    logo_url:         t.logoUrl ?? null,
    image_url:        t.imageUrl ?? null,
    screenshot_url:   t.screenshotUrl ?? null,
    pricing:          t.pricing,
    pricing_detail:   t.pricingDetail ?? null,
    rating:           t.rating ?? null,
    review_count:     t.reviewCount ?? null,
    title:            t.title ?? t.name,
    meta_description: t.metaDescription ?? null,
    hero_title:       t.heroTitle ?? null,
    hero_subtitle:    t.heroSubtitle ?? null,
    introduction:     t.introduction ?? null,
    features:         t.features ?? [],
    pros:             t.pros ?? [],
    cons:             t.cons ?? [],
    use_cases:        t.useCases ?? [],
    faqs:             t.faqs ?? [],
    how_to_steps:     t.howToSteps ?? [],
    target_users:     t.targetUsers ?? [],
    pricing_tiers:    t.pricingTiers ?? [],
    similar_tools:    t.similarTools ?? [],
    is_featured:      FEATURED_SLUGS.has(t.slug),
    is_new:           NEW_SLUGS.has(t.slug),
  }));

  const batches = chunkArray(toolRows, 20);
  let total = 0;
  for (const [i, batch] of batches.entries()) {
    const { error } = await supabase
      .from("tools")
      .upsert(batch, { onConflict: "slug" });
    if (error) {
      console.error(`❌ Batch ${i + 1} error:`, error.message);
      process.exit(1);
    }
    total += batch.length;
    console.log(`   Batch ${i + 1}/${batches.length}: ${total}/${toolRows.length} tools`);
  }
  console.log(`   ✅ ${total} tools upserted\n`);

  // 3. Update category tool_count
  console.log("📊 Updating category tool counts...");
  for (const cat of CATEGORIES) {
    const { count, error: countErr } = await supabase
      .from("tools")
      .select("id", { count: "exact", head: true })
      .eq("category", cat.id);
    if (countErr) {
      console.warn(`   ⚠️  Count error for ${cat.id}:`, countErr.message);
      continue;
    }
    await supabase
      .from("categories")
      .update({ tool_count: count ?? 0 })
      .eq("id", cat.id);
    console.log(`   ${cat.name}: ${count} tools`);
  }
  console.log("   ✅ Counts updated\n");

  // 4. Upsert comparisons
  console.log("⚖️  Upserting comparisons...");
  const { error: compErr } = await supabase
    .from("comparisons")
    .upsert(COMPARISONS, { onConflict: "slug" });
  if (compErr) {
    console.error("❌ Comparisons error:", compErr.message);
    process.exit(1);
  }
  console.log(`   ✅ ${COMPARISONS.length} comparisons upserted\n`);

  console.log("🎉 Seed complete!");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
