# AI工具导航站 — 产品需求文档 (PRD)

**版本**: v1.0  
**日期**: 2026-04-21  
**作者**: DeerFlow 2.0  
**项目**: ai-tools-nav  
**线上地址**: https://ai-tools-nav-two.vercel.app/

---

## 1. 产品概述

### 1.1 产品定位

AI工具导航站是一个面向中文用户的 AI 工具聚合导航与测评平台，目标是成为中文互联网上最权威、最实用的 AI 工具发现与选择入口。通过程序化 SEO 策略，在 Google 和百度双引擎获取自然流量，以工具对比、场景推荐、用户评测为核心差异化竞争力。

### 1.2 核心价值主张

- **发现**：一站式聚合 200+ AI 工具，按类别、场景、价格快速筛选
- **对比**：结构化横向对比，帮助用户在同类工具中做出最优选择
- **评测**：真实用户评分 + 专业测评文章，降低决策成本
- **本土化**：专注中文可用性（是否有中文界面、国内能否访问、免费额度等）

### 1.3 商业目标

| 阶段 | 时间 | 目标 |
|------|------|------|
| Phase 1 | 已完成 | 16 个静态页面上线，基础 SEO 框架搭建 |
| Phase 2 | 2026 Q2 | 月 UV 破 1 万，工具库扩展至 200+，评测功能上线 |
| Phase 3 | 2026 Q3 | 月 UV 破 5 万，联盟营销收入启动，付费收录开放 |
| Phase 4 | 2026 Q4 | 月 UV 破 20 万，成为细分领域头部导航站 |

---

## 2. 竞品分析

### 2.1 主要竞品

| 竞品 | 定位 | 优势 | 劣势 |
|------|------|------|------|
| **ai-bot.cn** | 中文 AI 工具导航 | 工具数量多、更新频繁 | 设计陈旧、无深度测评 |
| **toolify.ai** | 英文 AI 工具目录 | 数据量大、SEO 强 | 无中文本土化 |
| **futurepedia.io** | 英文 AI 工具聚合 | 社区活跃、分类细 | 无中文支持 |
| **aigc.cn** | 中文 AIGC 资讯 | 内容质量高 | 工具导航功能弱 |
| **ainav.cn** | 中文 AI 导航 | 界面简洁 | 工具数量少、无测评 |

### 2.2 差异化机会

1. **中文可用性标注**：明确标注每个工具是否有中文界面、国内直连、免费额度
2. **场景化推荐**：按"我要做什么"而非"工具类别"组织内容
3. **结构化对比页**：SEO 友好的 A vs B 对比页，覆盖长尾关键词
4. **用户真实评测**：UGC 评分 + 使用场景标注，增加可信度

---

## 3. 用户研究

### 3.1 目标用户画像

#### Persona A — 职场效率党「小王」
- **年龄**: 25-35 岁，互联网/创意行业从业者
- **痛点**: 每天被各种 AI 工具信息轰炸，不知道哪个真的好用；担心付费后发现不适合
- **需求**: 快速找到适合自己工作场景的工具，看真实用户评价
- **行为**: 搜索"XX AI工具哪个好"、"ChatGPT 替代品"、"免费 AI 写作工具"

#### Persona B — 创业者/产品经理「张总」
- **年龄**: 30-45 岁，创业公司或中小企业主
- **痛点**: 需要为团队选型 AI 工具，要考虑价格、稳定性、中文支持
- **需求**: 详细的功能对比、价格对比、企业版信息
- **行为**: 搜索"AI工具对比"、"企业用 AI 工具推荐"、"XX vs YY 哪个好"

#### Persona C — 学生/自媒体人「小李」
- **年龄**: 18-28 岁，学生或内容创作者
- **痛点**: 预算有限，需要找免费或低价 AI 工具；英文界面看不懂
- **需求**: 免费工具推荐、中文界面工具、新手友好
- **行为**: 搜索"免费 AI 工具"、"AI 绘画免费"、"有中文界面的 AI 工具"

#### Persona D — 技术开发者「老陈」
- **年龄**: 25-40 岁，软件工程师或独立开发者
- **痛点**: 需要了解 AI 工具的 API、集成方式、技术细节
- **需求**: API 文档链接、技术规格、开发者计划信息
- **行为**: 搜索"AI API 对比"、"最好的代码 AI 工具"、"Copilot 替代品"

### 3.2 核心用户旅程

```
发现需求 → 搜索关键词 → 进入导航站 → 浏览/筛选工具 → 查看详情/对比 → 收藏/点击跳转 → 使用工具 → 回来评分
```

---

## 4. 功能需求

### 4.1 P0 — 立即修复（本周）

#### 4.1.1 评测功能修复
**问题**: `reviews` 表未在 Supabase 创建，导致评分/评论功能完全不可用

**修复 SQL**:
```sql
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_slug TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  use_case TEXT,
  recommended BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
```

**验收标准**:
- [ ] 工具详情页可以提交评分（1-5星）
- [ ] 评分提交后立即显示在页面上
- [ ] 同一浏览器不能重复评分（localStorage 去重）
- [ ] 评分统计（平均分、评分数）正确显示

#### 4.1.2 文章页面修复
**问题**: articles 表数据未显示在生产环境，原因是 `is_published` 字段为 false 且未使用 service role client

**修复步骤**:
1. Supabase SQL Editor 执行: `UPDATE articles SET is_published = true;`
2. 确认 `src/app/articles/page.tsx` 和 `src/app/articles/[slug]/page.tsx` 使用 `createServiceClient()`

**验收标准**:
- [ ] `/articles` 页面显示 41 篇文章列表
- [ ] 每篇文章详情页可正常访问
- [ ] 文章页面有正确的 JSON-LD 结构化数据

#### 4.1.3 Google Analytics 4 集成
**需求**: 在 `src/app/layout.tsx` 集成 GA4，追踪用户行为

**实现方案**:
```tsx
// src/app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

// 在 <body> 内添加:
<GoogleAnalytics gaId="G-XXXXXXXXXX" />
```

**需追踪的关键事件**:
- `tool_click` — 用户点击工具跳转
- `tool_favorite` — 用户收藏工具
- `review_submit` — 用户提交评分
- `comparison_view` — 用户查看对比页

**验收标准**:
- [ ] GA4 实时报告能看到页面浏览数据
- [ ] 关键事件正确触发
- [ ] 不影响页面性能（Core Web Vitals）

### 4.2 P1 — 本月完成

#### 4.2.1 中文可用性字段
**需求**: 为工具添加中文本土化相关字段，这是核心差异化竞争力

**Schema 变更**:
```sql
ALTER TABLE tools ADD COLUMN IF NOT EXISTS accessibility_cn TEXT DEFAULT 'unknown';
-- 值: 'full'(完整中文) | 'partial'(部分中文) | 'none'(无中文) | 'unknown'
ALTER TABLE tools ADD COLUMN IF NOT EXISTS has_chinese_ui BOOLEAN DEFAULT false;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS free_tier_detail TEXT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;
```

**前端展示**: 工具详情页增加"中文可用性"badge，工具卡片增加中文标识图标

#### 4.2.2 场景化推荐模块
**需求**: 在首页增加"按场景找工具"入口，覆盖高搜索量场景关键词

**场景列表**（初期 8 个）:
- 写作/文案创作
- AI 绘画/图像生成
- 代码辅助/编程
- 视频制作/剪辑
- 数据分析/报表
- 客服/对话机器人
- 翻译/语言学习
- PPT/演示文稿

**SEO 价值**: 每个场景页面对应一批长尾关键词，如"AI写作工具哪个好"、"免费AI绘画工具推荐"

#### 4.2.3 工具库扩展至 200+
**当前状态**: 85 个工具  
**目标**: 200+ 工具（新增 115+）

**扩展策略**:
- 优先补充国产 AI 工具（文心一言、通义千问、讯飞星火等生态工具）
- 补充垂直领域工具（法律、医疗、教育、金融）
- 使用 Python pipeline 批量生成工具数据

### 4.3 P2 — 下月完成

#### 4.3.1 对比页扩展至 100+
**当前状态**: 34 个对比页  
**目标**: 100+ 对比页

**关键词策略**: 覆盖"XX vs YY"类搜索词，这类词有明确购买意图，转化率高

#### 4.3.2 "最佳工具"排行榜页面
**需求**: 创建按类别的"最佳 XX 工具"页面，如"2026年最好的AI写作工具"

**SEO 价值**: 这类页面搜索量大，且用户购买意图强

**页面结构**:
- 标题: `2026年最好的[类别] AI工具推荐`
- 内容: Top 5-10 工具，每个有简介、优缺点、适用人群
- 更新频率: 每季度更新一次

#### 4.3.3 完整评测系统
**需求**: 升级现有评分功能为完整评测系统

**新增功能**:
- 评测者身份标注（职业/使用场景）
- 评测维度细化（易用性、功能性、性价比、中文支持）
- 评测有用性投票
- 评测管理后台（审核垃圾评测）

### 4.4 P3 — Q3 2026

#### 4.4.1 联盟营销链接
**需求**: 为支持联盟计划的工具添加追踪链接，实现流量变现

**目标工具**: Jasper、Copy.ai、Midjourney、Notion AI 等有联盟计划的工具

#### 4.4.2 付费收录功能
**需求**: 允许 AI 工具厂商付费获得更好的展示位置或"已验证"标识

#### 4.4.3 微信公众号同步
**需求**: 将高质量测评文章同步到微信公众号，扩大内容分发渠道

---

## 5. 技术需求

### 5.1 当前技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 16.2.3 + React 19 + TypeScript |
| 样式 | Tailwind CSS + 全站暗色主题 |
| 后端/数据库 | Supabase (PostgreSQL + RLS) |
| 内容生成 | Python pipeline + Claude API (via proxy) |
| 部署 | Vercel (自动 CI/CD from GitHub) |
| SEO | next-sitemap + JSON-LD + ISR |

### 5.2 性能要求

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **首屏加载**: < 3s（移动端 4G 网络）

### 5.3 SEO 技术要求

- 所有页面有唯一 `<title>` 和 `<meta description>`
- 动态路由页面实现 `generateStaticParams` + ISR
- 结构化数据: 工具页 (SoftwareApplication)、文章页 (Article)、教程页 (HowTo)、对比页 (FAQPage)
- `sitemap.xml` 覆盖所有公开页面，每日自动更新
- `robots.txt` 正确配置，不屏蔽重要页面

### 5.4 数据库扩展计划

```sql
-- 已完成
CREATE TABLE tools (...);
CREATE TABLE categories (...);
CREATE TABLE comparisons (...);
CREATE TABLE news (...);
CREATE TABLE tutorials (...);
CREATE TABLE articles (...);

-- 待执行 (P0)
CREATE TABLE reviews (...);  -- 见 4.1.1

-- 待执行 (P1)
ALTER TABLE tools ADD COLUMN accessibility_cn TEXT;
ALTER TABLE tools ADD COLUMN has_chinese_ui BOOLEAN;
ALTER TABLE tools ADD COLUMN free_tier_detail TEXT;
ALTER TABLE tools ADD COLUMN last_verified_at TIMESTAMPTZ;
```

---

## 6. 非功能需求

### 6.1 可用性
- 移动端优先设计，支持 iOS Safari / Android Chrome
- 支持键盘导航（无障碍基础要求）
- 页面在 JS 禁用时仍可读取基本内容（SSR）

### 6.2 安全性
- Supabase RLS 策略保护所有表
- API 路由使用 service role client 时不暴露密钥到前端
- 用户输入（评论内容）做 XSS 过滤

### 6.3 可维护性
- Python pipeline 支持增量更新（不重复生成已有工具）
- 内容数据与代码分离（全部存 Supabase，不硬编码）
- 环境变量统一管理（`.env.local` + Vercel 环境变量）

---

## 7. 成功指标 (KPIs)

### 7.1 流量指标
| 指标 | 当前 | 1个月目标 | 3个月目标 |
|------|------|-----------|-----------|
| 月 UV | ~0 (新站) | 1,000 | 10,000 |
| 月 PV | ~0 | 3,000 | 30,000 |
| Google 收录页面数 | 1 (首页) | 50 | 200 |
| 平均排名关键词数 | 0 | 20 | 200 |

### 7.2 用户行为指标
| 指标 | 目标值 |
|------|--------|
| 平均停留时长 | > 2 分钟 |
| 跳出率 | < 65% |
| 工具点击率 | > 15% |
| 收藏功能使用率 | > 5% |

### 7.3 内容指标
| 指标 | 当前 | 目标 |
|------|------|------|
| 工具数量 | 85 | 200+ |
| 对比页数量 | 34 | 100+ |
| 文章数量 | 41 | 100+ |
| 教程数量 | 12 | 50+ |

---

## 8. 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| Google 算法更新降权 | 中 | 高 | 保持内容质量，避免纯 AI 生成内容，增加 UGC |
| Supabase 免费额度超限 | 低 | 中 | 监控用量，提前升级计划 |
| Vercel 带宽超限 | 低 | 中 | 启用 ISR 缓存，减少 SSR 请求 |
| 竞品抄袭内容 | 高 | 低 | 增加原创性（用户评测、独家数据），建立品牌 |
| AI 工具市场变化过快 | 高 | 中 | 建立自动化更新 pipeline，定期验证工具状态 |
| 国内访问速度慢 | 中 | 高 | 考虑接入 CDN 或部署国内镜像 |

---

## 9. 附录

### 9.1 关键词策略示例

**高优先级关键词（月搜索量 > 1000）**:
- "AI工具推荐" — 导航首页
- "ChatGPT替代品" — 对比页
- "免费AI绘画工具" — 类别页
- "AI写作工具哪个好" — 场景页

**中优先级关键词（月搜索量 100-1000）**:
- "Midjourney vs Stable Diffusion 中文" — 对比页
- "AI工具 有中文界面" — 筛选页
- "Claude vs ChatGPT 哪个好" — 对比页

### 9.2 内容更新计划

| 内容类型 | 更新频率 | 负责方式 |
|----------|----------|----------|
| 工具信息 | 每月验证一次 | Python pipeline 自动 + 人工审核 |
| 新闻资讯 | 每日自动 | Vercel Cron + RSS 抓取 |
| 对比页 | 每季度更新 | Python pipeline 重新生成 |
| 测评文章 | 每周 1-2 篇 | AI 生成 + 人工润色 |

### 9.3 技术债务清单

1. **reviews 表未创建** — P0，本周修复
2. **articles is_published 未设置** — P0，本周修复
3. **GA4 未集成** — P0，本周修复
4. **工具数据 last_verified_at 未填充** — P1
5. **移动端部分页面布局问题** — P1
6. **图片未使用 next/image 优化** — P2

---

*文档版本: v1.0 | 最后更新: 2026-04-21*
